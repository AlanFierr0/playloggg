import "server-only";
import { readAiCompletionClassification } from "@/lib/steam-completion-ai";
import { cachedSteamAchievementRead } from "@/lib/steam-achievement-cache";
import type { Json } from "@/types/database";
import { parseSteamCompletions } from "@/lib/steam-completion-input";
async function loadAchievements(key:string,refresh=false){
  const [ownerId,steamId,appId]=JSON.parse(key) as [string,string,number];
  const data=await cachedSteamAchievementRead(`player:english:v1:${steamId}:${appId}`,ownerId,900,async()=>{
    const apiKey=process.env.STEAM_WEB_API_KEY;
    if(!apiKey)throw new Error("Steam achievements unavailable");
    const url=new URL("https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/");
    url.searchParams.set("key",apiKey);url.searchParams.set("steamid",steamId);url.searchParams.set("appid",String(appId));url.searchParams.set("l","english");
    // Never log provider URLs: they contain credentials and private account IDs.
    const response=await fetch(url,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new Error("Steam achievements unavailable");
    const data:unknown=await response.json();
    parseSteamCompletions(data,appId,null,Date.now(),steamId);
    return data as Json;
  },refresh);
  const classification=await readAiCompletionClassification(appId);
  return parseSteamCompletions(data,appId,null,Date.now(),steamId,classification?.ids,classification?.schema);
}
export async function readSteamCompletions(ownerId:string,steamId:string,appId:number,releasedOn:string|null,refresh=false) {
  const key=JSON.stringify([ownerId,steamId,appId]);
  const candidates=await loadAchievements(key,refresh);
  return candidates.filter(candidate=>!releasedOn||candidate.date>=releasedOn);
}
