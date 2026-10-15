import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {stripTypeScriptTypes} from "node:module";
import {createHash} from "node:crypto";
import {recentRead} from "../src/lib/recent-read.ts";
import {parseSteamAchievementSchema,parseCompletionAchievementIds,parseGeminiCompletion,completionClassificationRequest} from "../src/lib/steam-completion-ai-input.ts";
import {parseSteamCompletions} from "../src/lib/steam-completion-input.ts";
const publicData={game:{gameName:"Public game",availableGameStats:{achievements:[{name:"ENDING",displayName:"A new dawn",description:"The tyrant is gone."},{name:"LOCKED",displayName:"Another dawn",description:"Another story ending."}]}}};
const schema=parseSteamAchievementSchema(publicData);
const response=ids=>({candidates:[{finishReason:"STOP",content:{parts:[{text:JSON.stringify({completionAchievementIds:ids})}]}}]});
test("AI output must select existing public IDs only and cannot supply dates",()=>{
 assert.deepEqual(parseGeminiCompletion(response(["ENDING"]),schema),["ENDING"]);
 assert.deepEqual(parseGeminiCompletion(response([]),schema),[]);
 for(const value of [response(["INVENTED"]),response(["ENDING","ENDING"]),{candidates:[{finishReason:"MAX_TOKENS",content:{parts:[{text:'{"completionAchievementIds":["ENDING"]}'}]}}]},response([123]),{candidates:[{finishReason:"STOP",content:{parts:[{text:'{"completionAchievementIds":["ENDING"],"date":"2025-01-01"}'}]}}]}])assert.throws(()=>parseGeminiCompletion(value,schema));
});
test("AI-classified indirect endings use only valid unlocked Steam timestamps, with public text fallback",()=>{
 const player={playerstats:{success:true,steamID:"76561198000000000",achievements:[{apiname:"ENDING",achieved:1,unlocktime:1751414400},{apiname:"LOCKED",achieved:0,unlocktime:0}]}};
 const now=Date.parse("2026-10-14T12:00:00Z");
 assert.deepEqual(parseSteamCompletions(player,101,null,now,"76561198000000000",["ENDING","LOCKED"],schema).map(row=>[row.id,row.date,row.source]),[["ENDING","2025-07-02","ai"]]);
 assert.deepEqual(parseSteamCompletions(player,101,"2026-01-01",now,"76561198000000000",["ENDING"],schema),[]);
 assert.deepEqual(parseSteamCompletions(player,101,null,now,"76561198000000000",[],schema),[]);
});
test("schema normalization and the Gemini prompt contain public metadata only",()=>{
 const normalized=parseSteamAchievementSchema({...publicData,steamID:"PRIVATE",unlocktime:999,game:{...publicData.game,privateHistory:"PRIVATE"}});
 const request=JSON.stringify(completionClassificationRequest(normalized));assert.ok(!request.includes("PRIVATE"));assert.ok(!request.includes("unlocktime"));assert.ok(request.includes("APPLICATION_JSON"));
 assert.throws(()=>parseSteamAchievementSchema({game:{gameName:"Game",availableGameStats:{achievements:Array(501).fill({name:"X",displayName:"Name"})}}}));
 assert.throws(()=>parseCompletionAchievementIds(["UNKNOWN"],normalized));
});
// Load the real service with isolated provider/cache dependencies; each load represents a cold server.
const source=stripTypeScriptTypes(readFileSync(new URL("../src/lib/steam-completion-ai.ts",import.meta.url),"utf8")).replace(/^import .*;\r?\n/gm,"").replace(/export /g,"");
function service(cache,mode,counters){
 const dependencies={cachedSteamAchievementRead:async(_key,_owner,_seconds,load)=>load(),createHash,recentRead,parseSteamAchievementSchema,parseCompletionAchievementIds,parseGeminiCompletion,completionClassificationRequest,process:{env:{GEMINI_API_KEY:"fixture",STEAM_WEB_API_KEY:"fixture"}},checkOperationLimit:async()=>{counters.quota++;},createAuthAdmin:()=>({rpc:async(name,input)=>{if(name==="read_steam_completion_classification")return {data:cache.get(`${input.p_app_id}:${input.p_hash}`)??null,error:null};cache.set(`${input.p_app_id}:${input.p_hash}`,input.p_ids);return {error:null};}}),fetch:async(url,options)=>{
  if(String(url).includes("GetSchemaForGame"))return Response.json(publicData);
  counters.ai++;const text=JSON.stringify(options.body);assert.ok(!text.includes("76561198000000000"));
  return mode==="unavailable"?new Response("",{status:429}):Response.json(response(mode==="empty"?[]:["ENDING"]));
 }};
 return new Function(...Object.keys(dependencies),`${source}\nreturn readAiCompletionClassification;`)(...Object.values(dependencies));
}
test("persistent per-game cache survives cold servers, includes empty results and avoids another AI request",async()=>{
 for(const mode of ["valid","empty"]){const cache=new Map(),counters={ai:0,quota:0};const first=await service(cache,mode,counters)(101);const second=await service(cache,mode,counters)(101);assert.deepEqual(first,second);assert.equal(counters.ai,1);assert.equal(counters.quota,1);assert.equal(cache.size,1);}
});
test("quota/provider failures return fallback without saving a false AI result",async()=>{
 const cache=new Map(),counters={ai:0,quota:0};assert.equal(await service(cache,"unavailable",counters)(101),null);assert.equal(cache.size,0);
});
