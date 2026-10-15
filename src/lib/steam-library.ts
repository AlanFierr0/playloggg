import "server-only";
import { normalizeImport } from "@/lib/catalog-input";
import { queryIgdb } from "@/lib/igdb";
import { recentRead } from "@/lib/recent-read";
import { parseSteamLibrary, steamIdentity, matchSteamGames, steamMatchBody } from "@/lib/steam-library-input";

export async function readSteamLibrary(steamId: string) {
  if (!steamIdentity(steamId)) throw new Error("Sign in with Steam to import your library.");
  const key = process.env.STEAM_WEB_API_KEY;
  if (!key) throw new Error("Steam library import is not configured yet.");
  const url = new URL("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/");
  url.searchParams.set("key",key);
  url.searchParams.set("input_json",JSON.stringify({steamid:steamId,include_appinfo:true,include_played_free_games:true}));
  // Never log this URL: it contains a server credential and a private account ID.
  let response: Response;
  try { response = await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(15000)}); }
  catch { throw new Error("Steam is unavailable right now. Please retry."); }
  if (!response.ok) throw new Error("Steam is unavailable right now. Please retry.");
  let data: unknown;
  try { data = await response.json(); }
  catch { throw new Error("Steam returned an invalid library. Please retry."); }
  return parseSteamLibrary(data);
}

// Keys bind the verified Auth owner and Steam identity. No browser-supplied library is trusted.
// Vercel instances may not share this cache; misses always fetch a fresh server library.
const recentLibraries=recentRead(async (key:string)=>readSteamLibrary(key.split(":")[1]),30_000,50);
export function readSteamImportContext(ownerId:string,steamId:string,refresh=false){
  return recentLibraries(`${ownerId}:${steamId}`,refresh);
}

// Only public, normalized provider metadata is shared; ownership/playtime is checked separately.
// ponytail: warm-instance cache; misses on other Vercel instances safely query IGDB again.
type SteamCatalogMatch = {id:number;game:NonNullable<ReturnType<typeof normalizeImport>>};
const catalogMatches = new Map<number,{expires:number;match:SteamCatalogMatch|null}>();
export async function readSteamCatalogMatches(appIds:number[],refresh=false) {
  steamMatchBody(appIds); // Validate the bounded provider query even on cache hits.
  const now=Date.now();
  for(const [id,entry] of catalogMatches)if(entry.expires<=now)catalogMatches.delete(id);
  const result=new Map<number,SteamCatalogMatch>();
  const missing=appIds.filter(id=>refresh||!catalogMatches.has(id));
  for(const id of appIds){const entry=catalogMatches.get(id);if(!refresh&&entry?.match)result.set(id,entry.match);}
  if(missing.length){
    const records=await queryIgdb(steamMatchBody(missing));
    const matches=matchSteamGames(records,missing);
    const games=new Map(records.map(normalizeImport).flatMap(game=>game ? [[game.igdb_id,game] as const] : []));
    for(const appId of missing){
      const id=matches.get(appId);
      const game=id ? games.get(id) : null;
      const match=id&&game ? {id,game} : null;
      catalogMatches.delete(appId);
      if(catalogMatches.size>=1000)catalogMatches.delete(catalogMatches.keys().next().value!);
      catalogMatches.set(appId,{expires:Date.now()+300_000,match});
      if(match)result.set(appId,match);
    }
  }
  return result;
}
