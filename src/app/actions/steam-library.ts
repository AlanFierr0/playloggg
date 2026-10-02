"use server";
import { revalidatePath } from "next/cache";
import { checkOperationLimit, operationFailure } from "@/lib/operation-limits";
import { getAccount } from "@/lib/owner";
import { readSteamLibrary, readSteamImportContext } from "@/lib/steam-library";
import { browseSteamLibrary, parseSteamBrowse, matchSteamGames, steamAppId, steamIdentity, steamMatchBody, type SteamGame } from "@/lib/steam-library-input";
import { normalizeMatch } from "@/lib/catalog-input";
import { queryIgdb } from "@/lib/igdb";
import { importIgdb } from "@/app/actions/catalog";
import { readProfileRatings } from "@/lib/profile-ratings";

export type LibraryRow = SteamGame & { matched: boolean; logged: boolean; cover: string | null };
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
  return new Map([...matches].flatMap(([appId,igdbId])=>{
    const stored=catalog.find(game=>game.igdb_id===igdbId);
    const rating=ratings.find(row=>row.game_id===stored?.id);
    return rating ? [[appId,rating] as const] : [];
  }));
}

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
    const logged = await loggedSteamGames(account,owned);
    const syncAppIds = [...logged].filter(([,rating])=>rating.platform==="pc").map(([id])=>id);
    const library = browseSteamLibrary(owned.filter(game=>!logged.has(game.appId)),query);
    const entries = library.slice(query.offset,query.offset+25);
    if (!entries.length) return {ok:true,message:library.length ? "" : "No Steam games match these filters.",games:[],total:library.length,nextOffset:query.offset,syncAppIds};
    const records = await queryIgdb(steamMatchBody(entries.map(game=>game.appId)));
    const matches = matchSteamGames(records, entries.map(game=>game.appId));
    const covers = new Map(records.map(normalizeMatch).flatMap(game=>game?.cover ? [[game.id,game.cover] as const] : []));
    const ids = [...new Set(matches.values())];
    const {data:catalog,error} = ids.length ? await account.supabase.from("games").select("id,igdb_id,cover_url").in("igdb_id",ids) : {data:[],error:null};
    if (error) throw new Error("Catalog read failed");
    return {ok:true,message:"",total:library.length,nextOffset:query.offset+entries.length,syncAppIds,games:entries.map(game=>{
      const stored = catalog.find(row=>row.igdb_id===matches.get(game.appId));
      return {...game,matched:matches.has(game.appId),logged:false,cover:stored?.cover_url && !["/icon.svg","/images/missing-cover.svg"].includes(stored.cover_url) ? stored.cover_url : covers.get(matches.get(game.appId)!) ?? null};
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

export async function importSteamGame(input: unknown): Promise<{ok:boolean;message:string;skipped?:boolean}> {
  if (!steamAppId(input)) return {ok:false,message:"Choose a valid Steam game."};
  try {
    const account = await getAccount();
    const steamId = account?.user.app_metadata.playlogg_steam_id;
    if (!account?.profile || !steamIdentity(steamId)) return {ok:false,message:"Sign in with Steam to import your library."};
    // Re-authorize each game; reuse a server library for at most 30 seconds, never browser playtime/IDs.
    await checkOperationLimit(account.user.id,"steam");
    const game = (await readSteamImportContext(account.user.id,steamId)).find(game=>game.appId===input);
    if (!game) return {ok:false,message:"This game is not in your Steam library."};
    const id = matchSteamGames(await queryIgdb(steamMatchBody([input])),[input]).get(input);
    if (!id) return {ok:false,message:"No exact catalog match. This game was not imported."};
    const imported = await importIgdb(id);
    if (!imported.ok || !imported.game) return {ok:false,message:"This game could not be imported. Please retry."};
    const {data:catalog,error} = await account.supabase.from("games").select("id").eq("igdb_id",id).single();
    if (error) throw new Error("Catalog read failed");
    // DO NOTHING also preserves a concurrent manual log edit or repeated import.
    const {data:saved,error:saveError} = await account.supabase.from("ratings").upsert({profile_id:account.profile.id,game_id:catalog.id,platform:"pc",hours_played:game.hours,score:null,tier:null,status:null,review:null,tags:[],completed_on:null},{onConflict:"profile_id,game_id",ignoreDuplicates:true}).select("game_id");
    if (saveError) return {ok:false,message:"This entry could not be saved. Please retry."};
    revalidatePath("/profile","layout");
    return {ok:true,skipped:!saved.length,message:saved.length ? "Steam game imported." : "Existing entry kept unchanged."};
  } catch(error) {return {ok:false,message:failure(error)};}
}
