import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import ts from "typescript";

test("single-review vote reads are bounded without changing profile-wide pagination",async()=>{
 const calls=[];
 const client={rpc(name,args){
  const call={name,args,offset:0,end:499};calls.push(call);
  return {order(){return this;},eq(key,value){call[key]=value;return this;},limit(value){call.limit=value;return this;},range(offset,end){call.offset=offset;call.end=end;return this;},then(resolve){
   const rows=Array.from({length:501},(_,index)=>({game_slug:index===0?"hades":`game-${index}`,upvotes:1,downvotes:0,viewer_vote:1}));
   const data=call.game_slug?rows.filter(row=>row.game_slug===call.game_slug).slice(0,call.limit):rows.slice(call.offset,call.end+1);
   return Promise.resolve({data,error:null}).then(resolve);
  }};
 }};
 const dependencies={"server-only":{},"react":{cache:fn=>fn},"@/lib/supabase/server":{createClient:async()=>client},"@/lib/owner":{getAccount:async()=>({profile:{id:2},supabase:client})}};
 const source=readFileSync(new URL("../src/lib/review-helpfulness.ts",import.meta.url),"utf8");
 const context={exports:{},require:name=>{assert.ok(name in dependencies);return dependencies[name];}};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
 const one=await context.exports.getReviewHelpfulness(3,"hades");
 assert.equal(calls.length,1);assert.equal(calls[0].game_slug,"hades");assert.equal(calls[0].limit,1);
 assert.deepEqual(Object.keys(one.reviews),["hades"]);assert.equal(one.canVote,true);
 calls.length=0;
 const all=await context.exports.getReviewHelpfulness(3);
 assert.equal(Object.keys(all.reviews).length,501);assert.deepEqual(calls.map(call=>call.offset),[0,500]);
});
