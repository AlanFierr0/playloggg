import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import {steamAppId,steamIdentity} from "../src/lib/steam-library-input.ts";

test("a 25-game Steam sync in a 3000-game library reads only its exact catalog and owned rating batch",async()=>{
 const library=Array.from({length:3000},(_,i)=>({appId:i+1,hours:10})),requested=Array.from({length:25},(_,i)=>i+100);
 let mappings=0,reads=0,writes=0;
 const db={from(table){let updating=false,gameId;return {
  select(){if(updating){writes++;return {data:[{game_id:gameId}],error:null};}return this;},
  update(patch){assert.deepEqual(Object.keys(patch),["hours_played"]);assert.equal(patch.hours_played,10);updating=true;return this;},
  eq(key,value){if(key==="profile_id")assert.equal(value,2);if(key==="game_id")gameId=value;if(key==="updated_at")assert.equal(value,"original-timestamp");return this;},
  in(key,ids){reads++;assert.equal(ids.length,25);assert.deepEqual([...ids],requested);assert.equal(key,table==="games"?"igdb_id":"game_id");return {data:table==="games"?ids.map(id=>({id,igdb_id:id})):ids.map(id=>({game_id:id,platform:"pc",hours_played:1,updated_at:"original-timestamp"})),error:null};},
  range(){assert.fail("Full profile pagination is forbidden during batch sync");}
 };}};
 const deps={"next/cache":{revalidatePath(){}},"@/lib/operation-limits":{checkOperationLimit:async()=>{},operationFailure:()=>"Failed"},"@/lib/owner":{getAccount:async()=>({user:{id:"owner",app_metadata:{playlogg_steam_id:"76561198000000000"}},profile:{id:2},supabase:db})},"@/lib/steam-library":{readSteamLibrary:async()=>library,readSteamCatalogMatches:async ids=>{mappings++;assert.deepEqual([...ids],requested);return new Map(ids.map(id=>[id,{id}]));}},"@/lib/steam-library-input":{steamAppId,steamIdentity},"@/lib/recent-read":{recentRead:fn=>fn}};
 const context={exports:{},require:name=>deps[name]??{}};
 vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/app/actions/steam-library.ts",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
 const result=await context.exports.syncSteamPlaytime(requested);
 assert.equal(result.ok,true);assert.equal(result.updated,25);assert.equal(reads,2);assert.equal(writes,25);assert.equal(mappings,1);
});

test("Steam provider throttling retains Retry-After instead of becoming an unavailable-achievements cascade",async()=>{
 const context={exports:{},require:name=>({"@/lib/steam-achievement-cache":{cachedSteamAchievementRead:async(_key,_owner,_ttl,load)=>load()},"@/lib/steam-completion-ai":{readAiCompletionClassification:()=>assert.fail("Throttled reads must not classify achievements")}})[name]??{},process:{env:{STEAM_WEB_API_KEY:"fixture"}},URL,AbortSignal,fetch:async()=>new Response("",{status:429,headers:{"retry-after":"17"}})};
 vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/lib/steam-completion.ts",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
 await assert.rejects(context.exports.readSteamCompletions("owner","76561198000000000",100,null),/Too many requests\. Try again in 17 seconds\./);
});

test("completion skip recovery uses only the verified owner and does not write ratings",async()=>{
 let account=null,calls=[];
 const db={from(table){assert.equal(table,"games");return {select(){return this;},eq(){return this;},single:async()=>({data:{id:7},error:null}),in:async(_key,ids)=>({data:ids.map(id=>({slug:`game-${id}`,title:`Game ${id}`})),error:null})};}};
 const deps={"next/cache":{},"@/lib/owner":{getAccount:async()=>account},"@/lib/operation-limits":{checkOperationLimit:async()=>{},operationFailure:(_error,fallback)=>fallback},"@/lib/supabase/auth-admin":{createAuthAdmin:()=>({rpc:async(name,args)=>{calls.push([name,args]);return {data:name==="read_steam_completion_skips"?[7]:null,error:null};}})},"@/lib/recent-read":{recentRead:fn=>fn}};
 const context={exports:{},require:name=>deps[name]??{}};
 vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/app/actions/steam-library.ts",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
 const {restoreSteamCompletion,listSkippedSteamCompletionGames}=context.exports;
 assert.equal((await restoreSteamCompletion("game-7")).ok,false);assert.equal((await listSkippedSteamCompletionGames()).ok,false);assert.equal(calls.length,0);
 account={user:{id:"verified-owner"},profile:{id:2},supabase:db};
 assert.equal((await restoreSteamCompletion({slug:"game-7",owner:"forged"})).ok,false);assert.equal(calls.length,0);
 assert.equal((await restoreSteamCompletion("game-7")).ok,true);assert.equal(calls[0][0],"restore_steam_completion_game");assert.equal(calls[0][1].p_owner,"verified-owner");assert.equal(calls[0][1].p_game,7);
 const skipped=await listSkippedSteamCompletionGames();assert.equal(skipped.ok,true);assert.equal(skipped.games[0].slug,"game-7");assert.equal(calls[1][1].p_owner,"verified-owner");
});
