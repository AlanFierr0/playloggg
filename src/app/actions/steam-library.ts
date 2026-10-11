"use server";
import { revalidatePath, updateTag } from "next/cache";
import { checkOperationLimit, operationFailure, reserveImportQuota } from "@/lib/operation-limits";
import { getAccount } from "@/lib/owner";
import { readSteamLibrary, readSteamImportContext, readSteamCatalogMatches } from "@/lib/steam-library";
import { browseSteamLibrary, parseSteamBrowse, matchSteamGames, steamAppId, steamIdentity, type SteamGame } from "@/lib/steam-library-input";
import { queryIgdb } from "@/lib/igdb";
import { createCatalogAdmin } from "@/lib/supabase/catalog-admin";
import { validateRating } from "@/lib/rating-input";
import { recentRead } from "@/lib/recent-read";
import { readProfileRatings } from "@/lib/profile-ratings";

export type LibraryRow = SteamGame & { matched: boolean; logged: boolean; cover: string | null; genres: string[] };
export type ImportedSteamRating = { slug: string; updatedAt: string | null };
export type LibraryPreview = { ok: boolean; message: string; games: LibraryRow[]; total: number; nextOffset: number; syncAppIds: number[] };
const libraryErrors = new Set([
  "Steam library import is not configured yet.",
  "Steam is unavailable right now. Please retry.",
  "Steam returned an invalid library. Please retry.",
  "Steam game details are unavailable. Set Game details to Public in Steam privacy settings, then retry.",
]);
const failure = (error: unknown) => error instanceof Error && libraryErrors.has(error.message) ? error.message : operationFailure(error,"Library import is unavailable right now. Please retry.");

// Resolve stored entries in bounded batches before paginating the remaining library.
async function loggedSteamGames(account: NonNullable<Awaited<ReturnType<typeof getAccount>>>, library: SteamGame[]) {
  if (!account.profile) throw new Error("Profile required");
  const ratings = await readProfileRatings(account.supabase, account.profile.id);
  const catalog: {id:number;igdb_id:number|null}[] = [];
  const records: unknown[] = [];
  for (let offset=0;offset<ratings.length;offset+=100) {
    const {data,error} = await account.supabase.from("games").select("id,igdb_id").in("id",ratings.slice(offset,offset+100).map(row=>row.game_id));
    if (error) throw new Error("Catalog read failed");
    catalog.push(...data);
    const ids = data.flatMap(row=>steamAppId(row.igdb_id) ? [row.igdb_id] : []);
    if (ids.length) {
      const result = await queryIgdb(`fields id,external_games.uid,external_games.external_game_source; where id = (${ids.join(",")}); limit 100;`);
      records.push(...result.filter(record=>record && typeof record==="object" && "id" in record && ids.includes(record.id as number)));
    }
  }
  const matches = matchSteamGames(records,library.map(game=>game.appId));
  const byIgdb=new Map(catalog.map(game=>[game.igdb_id,game.id]));
  const byGame=new Map(ratings.map(rating=>[rating.game_id,rating]));
  return new Map([...matches].flatMap(([appId,igdbId])=>{
    const rating=byGame.get(byIgdb.get(igdbId)!);
    return rating ? [[appId,rating] as const] : [];
  }));
}

const previewKey=(actor:string,profileId:number,steamId:string)=>JSON.stringify([actor,profileId,steamId]);
// Cache only app IDs, never sessions or reviews. Every preview still re-verifies Auth/ownership.
// ponytail: 30-second warm-instance snapshot; a cache miss on another instance resolves it afresh.
const loggedPreviews=recentRead(async(key:string)=>{
  const account=await getAccount();
  const steamId=account?.user.app_metadata.playlogg_steam_id;
  if(!account?.profile||!steamIdentity(steamId)||previewKey(account.user.id,account.profile.id,steamId)!==key)throw new Error("Profile required");
  const logged=await loggedSteamGames(account,await readSteamImportContext(account.user.id,steamId));
  return {appIds:[...logged.keys()],syncAppIds:[...logged].filter(([,rating])=>rating.platform==="pc").map(([id])=>id)};
},30_000,50);

export async function previewSteamLibrary(input: unknown): Promise<LibraryPreview> {
  const empty: LibraryPreview = {ok:false,message:"",games:[],total:0,nextOffset:0,syncAppIds:[]};
  const query = parseSteamBrowse(input);
  if (!query) return {...empty,message:"Use nonnegative hours and a minimum no greater than the maximum."};
  try {
    const account = await getAccount();
    const steamId = account?.user.app_metadata.playlogg_steam_id;
    if (!account?.profile || !steamIdentity(steamId)) return {...empty,message:"Sign in with Steam to import your library."};
    await checkOperationLimit(account.user.id,"steam");
    const owned = await readSteamImportContext(account.user.id,steamId,Boolean(input && typeof input==="object" && "refresh" in input && input.refresh===true));
    const snapshot=await loggedPreviews(previewKey(account.user.id,account.profile.id,steamId),query.offset===0);
    const logged=new Set(snapshot.appIds);
    const syncAppIds=snapshot.syncAppIds;
    const library = browseSteamLibrary(owned.filter(game=>!logged.has(game.appId)),query);
    const entries = library.slice(query.offset,query.offset+25);
    if (!entries.length) return {ok:true,message:library.length ? "" : "No Steam games match these filters.",games:[],total:library.length,nextOffset:query.offset,syncAppIds};
    const matches = await readSteamCatalogMatches(entries.map(game=>game.appId),Boolean(input && typeof input==="object" && "refresh" in input && input.refresh===true));
    const ids = [...new Set([...matches.values()].map(match=>match.id))];
    const {data:catalog,error} = ids.length ? await account.supabase.from("games").select("id,igdb_id,cover_url,genres").in("igdb_id",ids) : {data:[],error:null};
    if (error) throw new Error("Catalog read failed");
    return {ok:true,message:"",total:library.length,nextOffset:query.offset+entries.length,syncAppIds,games:entries.map(game=>{
      const stored = catalog.find(row=>row.igdb_id===matches.get(game.appId)?.id);
      const cover=[stored?.cover_url,matches.get(game.appId)?.game.cover_url].find(url=>url&&!["/icon.svg","/images/missing-cover.svg"].includes(url));
      return {...game,genres:stored?.genres?.length ? stored.genres : matches.get(game.appId)?.game.genres ?? [],matched:matches.has(game.appId),logged:false,cover:cover ?? null};
    })};
  } catch(error) { return {...empty,message:failure(error)}; }
}

export async function syncSteamPlaytime(input: unknown): Promise<{ok:boolean;message:string;updated:number;failed:number}> {
  let updated=0;
  if (!Array.isArray(input) || !input.length || input.length>25 || input.some(id=>!steamAppId(id))) return {ok:false,message:"Choose a valid Steam game.",updated,failed:0};
  try {
    const account=await getAccount();
    const steamId=account?.user.app_metadata.playlogg_steam_id;
    if (!account?.profile || !steamIdentity(steamId)) return {ok:false,message:"Sign in with Steam to import your library.",updated,failed:input.length};
    await checkOperationLimit(account.user.id,"steam");
    const library=(await readSteamLibrary(steamId)).filter(game=>input.includes(game.appId));
    const logged=await loggedSteamGames(account,library);
    let failed=0;
    for (const game of library) {
      const rating=logged.get(game.appId);
      if (!rating || rating.platform!=="pc" || rating.hours_played===game.hours) continue;
      // Compare the timestamp as well: a concurrent editor save takes precedence.
      let update=account.supabase.from("ratings").update({hours_played:game.hours})
        .eq("profile_id",account.profile.id).eq("game_id",rating.game_id).eq("platform","pc");
      update=rating.updated_at===null ? update.is("updated_at",null) : update.eq("updated_at",rating.updated_at);
      const {data,error}=await update.select("game_id");
      if (error || !data?.length) failed++; else updated++;
    }
    if (updated) revalidatePath("/profile","layout");
    return {ok:failed===0,message:failed ? "Some playtimes could not be synced. Retry to update the remaining games." : "Playtime synced. Other entry details were kept unchanged.",updated,failed};
  } catch(error) {
    if(updated)revalidatePath("/profile","layout");
    return {ok:false,message:failure(error),updated,failed:input.length};
  }
}

export type SteamImportResult = {appId:number;ok:boolean;message:string;skipped?:boolean;rating?:ImportedSteamRating};
export async function importSteamGames(input: unknown, recover=false): Promise<{ok:boolean;message:string;results:SteamImportResult[]}> {
  if (typeof recover!=="boolean" || !Array.isArray(input) || !input.length || input.length>25 || input.some(id=>!steamAppId(id)) || new Set(input).size!==input.length)
    return {ok:false,message:"Choose a valid Steam game.",results:[]};
  const ids=input as number[];
  const results=new Map<number,SteamImportResult>();
  const fail=(appId:number,message:string)=>results.set(appId,{appId,ok:false,message});
  let catalogChanged=false,profileChanged=false;
  let snapshotKey:string|undefined;
  try {
    const account=await getAccount();
    const steamId=account?.user.app_metadata.playlogg_steam_id;
    if(!account?.profile || !steamIdentity(steamId))return {ok:false,message:"Sign in with Steam to import your library.",results:[]};
    snapshotKey=previewKey(account.user.id,account.profile.id,steamId);
    // Authorize each bounded action; trust only server-owned library and provider metadata.
    await checkOperationLimit(account.user.id,"steam");
    const library=new Map((await readSteamImportContext(account.user.id,steamId)).map(game=>[game.appId,game]));
    const owned=ids.filter(id=>library.has(id));
    for(const id of ids)if(!library.has(id))fail(id,"This game is not in your Steam library.");
    const matches=owned.length ? await readSteamCatalogMatches(owned) : new Map();
    for(const id of owned)if(!matches.has(id))fail(id,"No exact catalog match. This game was not imported.");
    const igdbIds=[...new Set([...matches.values()].map(match=>match.id))];
    const {data:existing,error:readError}=igdbIds.length ? await account.supabase.from("games").select("id,igdb_id,slug").in("igdb_id",igdbIds) : {data:[],error:null};
    if(readError)throw new Error("Catalog read failed");
    const catalog=new Map(existing.map(game=>[game.igdb_id,game]));
    const missing=[...new Map([...matches.values()].filter(match=>!catalog.has(match.id)).map(match=>[match.id,match.game])).values()];
    let allowed=missing;
    if(missing.length){
      try {
        const quota=await reserveImportQuota(account.user.id,missing.length);
        allowed=missing.slice(0,quota.allowed);
        for(const game of missing.slice(quota.allowed))for(const [appId,match] of matches)if(match.id===game.igdb_id)fail(appId,quota.message);
      }catch(error){
        allowed=[];
        for(const game of missing)for(const [appId,match] of matches)if(match.id===game.igdb_id)fail(appId,failure(error));
      }
    }
    if(allowed.length){
      const admin=createCatalogAdmin();
      // Unique IGDB IDs + DO NOTHING preserve reviewed metadata and concurrent imports.
      const {data:created,error}=await admin.from("games").upsert(allowed,{onConflict:"igdb_id",ignoreDuplicates:true}).select("id,igdb_id,slug");
      catalogChanged=true;
      if(!error){
        for(const game of created)catalog.set(game.igdb_id,game);
        const raced=allowed.filter(game=>!catalog.has(game.igdb_id));
        if(raced.length){
          const {data,error}=await account.supabase.from("games").select("id,igdb_id,slug").in("igdb_id",raced.map(game=>game.igdb_id!));
          if(!error)for(const game of data)catalog.set(game.igdb_id,game);
        }
      }
      for(const [appId,match] of matches)if(!results.has(appId)&&!catalog.has(match.id))fail(appId,"This game could not be imported. Please retry.");
    }
    const aliases=new Map<number,number[]>();
    const entries=new Map<number,{appId:number;slug:string;hours:number}>();
    for(const appId of owned){
      if(results.has(appId))continue;
      const match=matches.get(appId);
      const game=match ? catalog.get(match.id) : null;
      if(!game)continue;
      if(entries.has(game.id))aliases.set(game.id,[...(aliases.get(game.id)??[]),appId]);
      else entries.set(game.id,{appId,slug:game.slug,hours:library.get(appId)!.hours});
    }
    if(entries.size){
      // One atomic batch insert; conflicts never overwrite a manual entry or retry.
      const {data:saved,error}=await account.supabase.from("ratings").upsert([...entries].map(([game_id,game])=>({profile_id:account.profile!.id,game_id,platform:"pc" as const,hours_played:game.hours})),{onConflict:"profile_id,game_id",ignoreDuplicates:true}).select("game_id,updated_at");
      profileChanged=!error&&saved.length>0;
      const inserted=new Map((saved??[]).map(row=>[row.game_id,row]));
      const recovered=new Map<number,{game_id:number;updated_at:string|null}>();
      if(recover&&!error){
        const missing=[...entries.keys()].filter(id=>!inserted.has(id));
        if(missing.length){
          const {data,error:recoverError}=await account.supabase.from("ratings").select("game_id,updated_at,platform,score,tier,status,review,tags,completed_on").eq("profile_id",account.profile.id).in("game_id",missing);
          if(recoverError)for(const id of missing)fail(entries.get(id)!.appId,"This entry could not be recovered. Please retry.");
          else for(const row of data)if(row.platform==="pc"&&row.score===null&&row.tier===null&&row.status===null&&!row.review&&!row.tags.length&&row.completed_on===null)recovered.set(row.game_id,row);
        }
      }
      for(const [id,game] of entries){
        if(results.has(game.appId))continue;
        if(error){for(const appId of [game.appId,...(aliases.get(id)??[])])fail(appId,"This entry could not be saved. Please retry.");continue;}
        for(const appId of aliases.get(id)??[])results.set(appId,{appId,ok:true,skipped:true,message:"Existing entry kept unchanged."});
        const row=inserted.get(id)??recovered.get(id);
        results.set(game.appId,{appId:game.appId,ok:true,skipped:!inserted.has(id),rating:row ? {slug:game.slug,updatedAt:row.updated_at} : undefined,message:row ? "Steam game imported." : "Existing entry kept unchanged."});
      }
    }
    return {ok:true,message:"",results:ids.map(appId=>results.get(appId)??{appId,ok:false,message:"This game could not be imported. Please retry."})};
  } catch(error){return {ok:false,message:failure(error),results:[]};}
  finally {
    if(snapshotKey)loggedPreviews.invalidate(snapshotKey);
    if(catalogChanged){updateTag("game-catalog");revalidatePath("/","layout");}
    else if(profileChanged)revalidatePath("/profile","layout");
  }
}

// Patch only the three fields offered during import. Concurrent edits take precedence.
export async function saveSteamImportRating(input: unknown, updatedAt: unknown) {
  const rating = validateRating(input);
  if (!rating || (updatedAt !== null && (typeof updatedAt !== "string" || !Number.isFinite(Date.parse(updatedAt)))))
    return {ok:false,message:"Choose a valid score, tier and playback status."};
  try {
    const account = await getAccount();
    if (!account?.profile || !steamIdentity(account.user.app_metadata.playlogg_steam_id)) return {ok:false,message:"Sign in with Steam to import your library."};
    const {data:game,error:gameError} = await account.supabase.from("games").select("id").eq("slug",rating.slug).single();
    if (gameError || !game) throw new Error("Unavailable game");
    const {data:previous,error:readError}=await account.supabase.from("ratings").select("score,tier,tier_manual,status,platform,hours_played,completed_on,tags,review,updated_at").eq("profile_id",account.profile.id).eq("game_id",game.id).eq("platform","pc").maybeSingle();
    if(readError)throw new Error("Save failed");
    if(!previous || previous.updated_at!==updatedAt)return {ok:false,message:"This entry changed elsewhere. Skip it and edit the latest entry from your profile."};
    const {error}=await account.supabase.rpc("save_rating",{p_game_id:game.id,p_expected_updated_at:updatedAt as string,
      p_values:{...previous,score:rating.score,tier:rating.tier,tier_manual:rating.tierManual??rating.tier!==null,status:rating.status}});
    if(error?.code==="40001")return {ok:false,message:"This entry changed elsewhere. Skip it and edit the latest entry from your profile."};
    if(error)throw new Error("Save failed");
    revalidatePath("/profile","layout");
    return {ok:true,message:"Saved."};
  } catch { return {ok:false,message:"Your rating could not be saved. Please retry or skip this game."}; }
}

export type SteamReviewSummary = {description:string;positive:number;total:number};
export async function getSteamReviewSummary(input:unknown):Promise<SteamReviewSummary|null> {
  if(!steamAppId(input))return null;
  try {
    const account=await getAccount();
    if(!account?.profile || !steamIdentity(account.user.app_metadata.playlogg_steam_id))return null;
    await checkOperationLimit(account.user.id,"steam");
    const response=await fetch(`https://store.steampowered.com/appreviews/${input}?json=1&filter=all&language=all&review_type=all&purchase_type=steam&num_per_page=1&l=english`,{next:{revalidate:3600},signal:AbortSignal.timeout(8000),redirect:"error"});
    if(!response.ok)return null;
    const data:unknown=await response.json();
    if(!data || typeof data!=="object" || !("success" in data) || data.success!==1 || !("query_summary" in data) || !data.query_summary || typeof data.query_summary!=="object")return null;
    const summary=data.query_summary as Record<string,unknown>;
    const {review_score_desc:description,total_positive:positive,total_reviews:total}=summary;
    if(typeof total!=="number" || !Number.isSafeInteger(total) || total<0 || typeof positive!=="number" || !Number.isSafeInteger(positive) || positive<0 || positive>total || typeof description!=="string" || description.length>100 || (total>0 && !description.trim()))return null;
    return {description:total ? description : "No user reviews",positive,total};
  } catch {return null;}
}
