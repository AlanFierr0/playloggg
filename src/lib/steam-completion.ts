import "server-only";
import { recentRead } from "@/lib/recent-read";
import { parseSteamCompletions } from "@/lib/steam-completion-input";
// shortcut: cache is local to a warm server instance; use shared storage if cross-instance reuse is needed.
const achievements=recentRead(async(key:string)=>{
  const [,steamId,appId]=JSON.parse(key) as [string,string,number];
  const apiKey=process.env.STEAM_WEB_API_KEY;
  if(!apiKey)throw new Error("Steam achievements unavailable");
  const url=new URL("https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/");
  url.searchParams.set("key",apiKey);url.searchParams.set("steamid",steamId);url.searchParams.set("appid",String(appId));url.searchParams.set("l","english");
  // Never log provider URLs: they contain credentials and private account IDs.
  const response=await fetch(url,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error("Steam achievements unavailable");
  const data:unknown=await response.json();
  return parseSteamCompletions(data,appId,null);
},900_000,250);
export async function readSteamCompletions(ownerId:string,steamId:string,appId:number,releasedOn:string|null,refresh=false) {
  const candidates=await achievements(JSON.stringify([ownerId,steamId,appId]),refresh);
  return candidates.filter(candidate=>!releasedOn||candidate.date>=releasedOn);
}
