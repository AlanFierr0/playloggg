"use server";
import { revalidatePath } from "next/cache";
import { getAccount } from "@/lib/owner";
import { readSteamLibrary } from "@/lib/steam-library";
import { browseSteamLibrary, parseSteamBrowse, matchSteamGames, steamAppId, steamIdentity, steamMatchBody, type SteamGame } from "@/lib/steam-library-input";
import { normalizeMatch } from "@/lib/catalog-input";
import { queryIgdb } from "@/lib/igdb";
import { importIgdb } from "@/app/actions/catalog";

export type LibraryRow = SteamGame & { matched: boolean; logged: boolean; cover: string | null };
export type LibraryPreview = { ok: boolean; message: string; games: LibraryRow[]; total: number; nextOffset: number };
const libraryErrors = new Set([
  "Steam library import is not configured yet.",
  "Steam is unavailable right now. Please retry.",
  "Steam returned an invalid library. Please retry.",
  "Steam game details are unavailable. Set Game details to Public in Steam privacy settings, then retry.",
]);
const failure = (error: unknown) => error instanceof Error && libraryErrors.has(error.message) ? error.message : "Library import is unavailable right now. Please retry.";

export async function previewSteamLibrary(input: unknown): Promise<LibraryPreview> {
  const empty: LibraryPreview = {ok:false,message:"",games:[],total:0,nextOffset:0};
  const query = parseSteamBrowse(input);
  if (!query) return {...empty,message:"Use nonnegative hours and a minimum no greater than the maximum."};
  try {
    const account = await getAccount();
    const steamId = account?.user.app_metadata.playlogg_steam_id;
    if (!account?.profile || !steamIdentity(steamId)) return {...empty,message:"Sign in with Steam to import your library."};
    const library = browseSteamLibrary(await readSteamLibrary(steamId),query);
    const entries = library.slice(query.offset,query.offset+25);
    if (!entries.length) return {ok:true,message:library.length ? "" : "No Steam games match these filters.",games:[],total:library.length,nextOffset:query.offset};
    const records = await queryIgdb(steamMatchBody(entries.map(game=>game.appId)));
    const matches = matchSteamGames(records, entries.map(game=>game.appId));
    const covers = new Map(records.map(normalizeMatch).flatMap(game=>game?.cover ? [[game.id,game.cover] as const] : []));
    const ids = [...new Set(matches.values())];
    const {data:catalog,error} = ids.length ? await account.supabase.from("games").select("id,igdb_id,cover_url").in("igdb_id",ids) : {data:[],error:null};
    if (error) throw new Error("Catalog read failed");
    const {data:logged,error:entryError} = catalog.length ? await account.supabase.from("ratings").select("game_id").eq("profile_id",account.profile.id).in("game_id",catalog.map(game=>game.id)) : {data:[],error:null};
    if (entryError) throw new Error("Entry read failed");
    return {ok:true,message:"",total:library.length,nextOffset:query.offset+entries.length,games:entries.map(game=>{
      const stored = catalog.find(row=>row.igdb_id===matches.get(game.appId));
      return {...game,matched:matches.has(game.appId),logged:Boolean(stored && logged.some(row=>row.game_id===stored.id)),cover:stored?.cover_url && !["/icon.svg","/images/missing-cover.svg"].includes(stored.cover_url) ? stored.cover_url : covers.get(matches.get(game.appId)!) ?? null};
    })};
  } catch(error) { return {...empty,message:failure(error)}; }
}

export async function importSteamGame(input: unknown): Promise<{ok:boolean;message:string;skipped?:boolean}> {
  if (!steamAppId(input)) return {ok:false,message:"Choose a valid Steam game."};
  try {
    const account = await getAccount();
    const steamId = account?.user.app_metadata.playlogg_steam_id;
    if (!account?.profile || !steamIdentity(steamId)) return {ok:false,message:"Sign in with Steam to import your library."};
    // Trust only a fresh library read and provider match, never browser playtime/IDs.
    const game = (await readSteamLibrary(steamId)).find(game=>game.appId===input);
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
