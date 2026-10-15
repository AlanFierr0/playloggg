import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {stripTypeScriptTypes} from "node:module";
import {createHash} from "node:crypto";
import {recentRead} from "../src/lib/recent-read.ts";
import {parseSteamCompletions} from "../src/lib/steam-completion-input.ts";
const source=stripTypeScriptTypes(readFileSync(new URL("../src/lib/steam-achievement-cache.ts",import.meta.url),"utf8")).replace(/^import .*;\r?\n/gm,"").replace(/export /g,"");
function cacheService(rows,clock={now:0},fail=false){
 const createAuthAdmin=()=>({rpc:async(name,input)=>{if(fail)throw new Error("Storage unavailable");const key=JSON.stringify([input.p_owner,input.p_key]);if(name==="read_steam_achievement_cache"){const row=rows.get(key);return {data:row&&row.expires>clock.now?row.data:null,error:null};}rows.set(key,{data:input.p_data,expires:clock.now+input.p_seconds*1000});return {data:null,error:null};}});
 return new Function("createHash","createAuthAdmin",`${source}\nreturn cachedSteamAchievementRead;`)(createHash,createAuthAdmin);
}
test("Steam reads survive cold servers, isolate owner/Steam/app keys, and retain empty achievements",async()=>{
 const rows=new Map();let reads=0;const load=async()=>{reads++;return {playerstats:{achievements:[]}};};
 await cacheService(rows)("steam-a:101","owner-a",900,load);
 await cacheService(rows)("steam-a:101","owner-a",900,load);assert.equal(reads,1);
 for(const [key,owner] of [["steam-a:101","owner-b"],["steam-b:101","owner-a"],["steam-a:102","owner-a"]])await cacheService(rows)(key,owner,900,load);
 assert.equal(reads,4);assert.equal(rows.size,4);
});
test("refresh replaces saved unlocks and cache hits never extend their expiry",async()=>{
 const rows=new Map(),clock={now:0};let reads=0;const load=async()=>({version:++reads});const read=cacheService(rows,clock);
 assert.deepEqual(await read("game","owner",900,load),{version:1});clock.now=899000;
 assert.deepEqual(await read("game","owner",900,load),{version:1});clock.now=900001;
 assert.deepEqual(await read("game","owner",900,load),{version:2});
 assert.deepEqual(await read("game","owner",900,load,true),{version:3});
 assert.deepEqual(await cacheService(rows,clock)("game","owner",900,load),{version:3});assert.equal(reads,3);
});
test("public schemas reuse results across servers for 24 hours",async()=>{
 const rows=new Map(),clock={now:0};let reads=0;const load=async()=>({game:{version:++reads}});
 await cacheService(rows,clock)("schema:101",null,86400,load);clock.now=900001;
 await cacheService(rows,clock)("schema:101",null,86400,load);assert.equal(reads,1);
 clock.now=86400001;await cacheService(rows,clock)("schema:101",null,86400,load);assert.equal(reads,2);
});
test("provider failures are not stored and cache failures leave provider results usable",async()=>{
 const rows=new Map();await assert.rejects(cacheService(rows)("game","owner",900,async()=>{throw new Error("Steam unavailable");}));assert.equal(rows.size,0);
 assert.deepEqual(await cacheService(rows,undefined,true)("game","owner",900,async()=>({ok:true})),{ok:true});assert.equal(rows.size,0);
});
const steamSource=stripTypeScriptTypes(readFileSync(new URL("../src/lib/steam-completion.ts",import.meta.url),"utf8")).replace(/^import .*;\r?\n/gm,"").replace(/export /g,"");
test("actual completion reader reuses private responses across cold starts and refresh reaches Steam",async()=>{
 const rows=new Map();let reads=0;const steamId="76561198000000000";
 const load=()=>new Function("cachedSteamAchievementRead","recentRead","parseSteamCompletions","readAiCompletionClassification","process","fetch",`${steamSource}\nreturn readSteamCompletions;`)(cacheService(rows),recentRead,parseSteamCompletions,async()=>null,{env:{STEAM_WEB_API_KEY:"fixture"}},async()=>{reads++;return Response.json({playerstats:{success:true,steamID:steamId,achievements:[{apiname:"END",name:"Complete the campaign",description:"",achieved:1,unlocktime:1751414400+reads*86400}]}});});
 const first=await load()("owner",steamId,101,null);assert.equal(reads,1);
 const read=load();assert.deepEqual(await read("owner",steamId,101,null),first);assert.equal(reads,1);
 const refreshed=await read("owner",steamId,101,null,true);assert.equal(reads,2);assert.notDeepEqual(refreshed,first);
 assert.deepEqual(await read("owner",steamId,101,null),refreshed);assert.equal(reads,2);
 assert.deepEqual(await load()("owner",steamId,101,null),refreshed);assert.equal(reads,2);
});

test("simultaneous achievement reads share one provider request",async()=>{
 const rows=new Map(),read=cacheService(rows);let calls=0;
 const load=async()=>{calls++;await new Promise(resolve=>setTimeout(resolve,10));return {achievements:[]};};
 const results=await Promise.all(Array.from({length:5},()=>read("game","owner",900,load)));
 assert.equal(calls,1);assert.equal(results.length,5);
});
