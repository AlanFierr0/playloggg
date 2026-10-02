import "server-only";
import { parseSteamLibrary, steamIdentity } from "@/lib/steam-library-input";

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
