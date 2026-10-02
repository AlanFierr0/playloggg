"use server";
import { revalidatePath } from "next/cache";
import { getAccount } from "@/lib/owner";
import { readSteamLibrary } from "@/lib/steam-library";
import { matchSteamGames, steamAppId, steamIdentity, steamMatchBody, type SteamGame } from "@/lib/steam-library-input";
import { queryIgdb } from "@/lib/igdb";
import { importIgdb } from "@/app/actions/catalog";

export type LibraryRow = SteamGame & { matched: boolean; logged: boolean; cover: string | null };
export type LibraryPreview = { ok: boolean; message: string; games: LibraryRow[]; total: number; page: number };
const libraryErrors = new Set([
  "Steam library import is not configured yet.",
  "Steam is unavailable right now. Please retry.",
  "Steam returned an invalid library. Please retry.",
  "Steam game details are unavailable. Set Game details to Public in Steam privacy settings, then retry.",
]);
const failure = (error: unknown) => error instanceof Error && libraryErrors.has(error.message) ? error.message : "Library import is unavailable right now. Please retry.";

export async function previewSteamLibrary(input: unknown): Promise<LibraryPreview> {
  const empty: LibraryPreview = {ok:false,message:"",games:[],total:0,page:1};
  if (typeof input !== "number" || !Number.isSafeInteger(input) || input < 1 || input > 2000) return {...empty,message:"Choose a valid library page."};
  try {
    const account = await getAccount();
    const steamId = account?.user.app_metadata.playlogg_steam_id;
    if (!account?.profile || !steamIdentity(steamId)) return {...empty,message:"Sign in with Steam to import your library."};
    const library = await readSteamLibrary(steamId);
    const page = Math.min(input,Math.max(1,Math.ceil(library.length/25)));
    const entries = library.slice((page-1)*25,page*25);
    if (!entries.length) return {ok:true,message:"Your Steam library is empty.",games:[],total:0,page};
    const matches = matchSteamGames(await queryIgdb(steamMatchBody(entries.map(game=>game.appId))), entries.map(game=>game.appId));
    const ids = [...new Set(matches.values())];
    const {data:catalog,error} = ids.length ? await account.supabase.from("games").select("id,igdb_id,cover_url").in("igdb_id",ids) : {data:[],error:null};
    if (error) throw new Error("Catalog read failed");
    const {data:logged,error:entryError} = catalog.length ? await account.supabase.from("ratings").select("game_id").eq("profile_id",account.profile.id).in("game_id",catalog.map(game=>game.id)) : {data:[],error:null};
    if (entryError) throw new Error("Entry read failed");
    return {ok:true,message:"",total:library.length,page,games:entries.map(game=>{
      const stored = catalog.find(row=>row.igdb_id===matches.get(game.appId));
      return {...game,matched:matches.has(game.appId),logged:Boolean(stored && logged.some(row=>row.game_id===stored.id)),cover:stored?.cover_url ?? null};
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
