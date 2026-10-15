import "server-only";
import { createHash } from "node:crypto";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";
import { checkOperationLimit } from "@/lib/operation-limits";
import { recentRead } from "@/lib/recent-read";
import { parseSteamAchievementSchema,parseCompletionAchievementIds,parseGeminiCompletion,completionClassificationRequest } from "@/lib/steam-completion-ai-input";
const model="gemini-3.5-flash-lite";
const schemas=recentRead(async(appId:string)=>{
  const key=process.env.STEAM_WEB_API_KEY;if(!key)throw new Error("Steam unavailable");
  const url=new URL("https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/");
  url.searchParams.set("key",key);url.searchParams.set("appid",appId);url.searchParams.set("l","english");
  const response=await fetch(url,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error("Steam schema unavailable");
  return parseSteamAchievementSchema(await response.json());
},86_400_000,250);
// Only public schemas and classifications are shared. Never include player IDs or unlock data.
const classifications=recentRead(async(appId:string)=>{
  const schema=await schemas(appId);
  if(!schema.achievements.length)return [];
  const hash=createHash("sha256").update(`${model}:completion-v1:${JSON.stringify(schema)}`).digest("hex");
  const admin=createAuthAdmin();
  const args={p_app_id:Number(appId),p_hash:hash};
  const cached=await admin.rpc("read_steam_completion_classification",args);
  if(cached.error)throw new Error("AI cache unavailable");
  if(cached.data!==null)return parseCompletionAchievementIds(cached.data,schema);
  const key=process.env.GEMINI_API_KEY;if(!key)throw new Error("AI unavailable");
  await checkOperationLimit("steam-completion-ai","achievement_ai");
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:"POST",headers:{"x-goog-api-key":key,"Content-Type":"application/json"},body:JSON.stringify(completionClassificationRequest(schema)),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error("AI classification unavailable");
  const ids=parseGeminiCompletion(await response.json(),schema);
  const saved=await admin.rpc("store_steam_completion_classification",{...args,p_ids:ids});
  if(saved.error)throw new Error("AI cache unavailable");
  return ids;
},900_000,250);
export async function readAiCompletionClassification(appId:number) {
  if(!process.env.GEMINI_API_KEY)return null;
  try{const schema=await schemas(String(appId));const ids=await classifications(String(appId));return {ids,schema};}catch{return null;}
}
