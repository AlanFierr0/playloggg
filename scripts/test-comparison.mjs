import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import {compareGames} from "../src/lib/comparison.ts";
const game=(slug,score,tier=null,logged=true)=>({slug,title:slug,cover:"cover",year:null,keywords:"",score,tier,logged});
test("affinity uses absolute score differences, includes zero and ignores independent tiers",()=>{
 const left=Array.from({length:5},(_,i)=>game(`g${i}`,i===0 ? 0 : 80,"S"));
 const right=left.map((g,i)=>game(g.slug,i===0 ? 10 : 90,"F"));
 const result=compareGames(left,right);
 assert.equal(result.affinity,90);assert.equal(result.scored,5);
 assert.equal(compareGames(right,left).affinity,90);
 assert.equal(compareGames(left,left).affinity,100);
 assert.equal(compareGames(left,left.map(g=>({...g,score:100}))).affinity,64);
});
test("unrated overlap stays visible, unlogged games excluded and small overlap has no percentage",()=>{
 const result=compareGames([game("a",null,"S"),game("b",0),game("c",99,null,false)],[game("a",0),game("b",0),game("c",99)]);
 assert.equal(result.shared.length,2);assert.equal(result.scored,1);assert.equal(result.unrated,1);assert.equal(result.affinity,null);
 assert.equal(result.shared[0].difference,null);assert.equal(result.shared[1].difference,0);
 assert.equal(compareGames([],[]).affinity,null);
});
test("ties use stable slugs and shared masterpieces require both scores, independently of tiers",()=>{
 const left=[game("z",90,"F"),game("a",100),game("b",40)];const right=[game("a",90),game("z",100),game("b",50)];
 const snapshot=JSON.stringify([left,right]);const result=compareGames(left,right);
 assert.deepEqual(result.divergences.map(e=>e.game.slug),["a","b"]);
 assert.deepEqual(result.masterpieces.map(e=>e.game.slug),["a","z"]);
 assert.equal(JSON.stringify([left,right]),snapshot);
});
function loader({hidden=false,unpublish=false,fail=false}={}){
 let ratingReads=0,checks=0,created=0;
 const rows=Array.from({length:1001},(_,i)=>({id:i+1,slug:`g${i}`,title:`G${i}`,cover_url:"cover",release_year:null}));
 const entries=rows.map(row=>({game_id:row.id,score:0,tier:null,status:"backlog"}));
 const db={from(table){assert.ok(["profiles","ratings"].includes(table));let filters=[],fields="";return{
 select(value){fields=value;return this},eq(key,value){filters.push([key,value]);return this},order(key){assert.equal(key,"game_id");return this},
 async maybeSingle(){assert.ok(filters.some(([key,value])=>key==="is_public"&&value===true));const handle=filters.find(([key])=>key==="handle")[1];if(fields==="id"){checks++;return{data:unpublish ? null : {id:handle==="left_user"?1:2},error:null}}return{data:hidden&&handle==="right_user" ? null : {id:handle==="left_user"?1:2,handle,display_name:handle,is_sample:false,is_public:true},error:null}},
 async range(start,end){assert.equal(fields,"game_id,score,tier,status");assert.ok(filters.some(([key])=>key==="profile_id"));ratingReads++;return{data:fail&&start===500 ? null : entries.slice(start,end+1),error:fail&&start===500 ? {} : null}}
 }}};
 const source=readFileSync(new URL("../src/lib/public-comparison.ts",import.meta.url),"utf8");
 const dependencies={"server-only":{},"@/lib/supabase/public":{createPublicClient:()=>{created++;return db}},"@/lib/profile-settings":{publicProfilePath:handle=>/^[a-z0-9_]{3,30}$/.test(handle)?`/u/${handle}`:null},"@/lib/portfolio":{getCatalog:async()=>rows}};
 const compiledModule={exports:{}};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:compiledModule,exports:compiledModule.exports,require:name=>{assert.ok(name in dependencies);return dependencies[name]}});
 return {read:compiledModule.exports.getPublicComparison,state:()=>({ratingReads,checks,created})};
}
test("comparison reads only anonymous scoped data, paginates above 1000 and rechecks both profiles",async()=>{
 const l=loader();const result=await l.read("left_user","right_user");assert.equal(result.left.games.length,1001);assert.equal(result.right.games.at(-1).score,0);assert.equal(l.state().ratingReads,6);assert.equal(l.state().checks,2);
 assert.ok(!("review" in result.left.games[0]));
});
test("invalid, private, unpublished and same-profile pairs never produce comparison data",async()=>{
 const invalid=loader();assert.equal(await invalid.read("../../login","right_user"),null);assert.equal(await invalid.read("left_user","left_user"),null);assert.equal(invalid.state().created,0);
 assert.equal(await loader({hidden:true}).read("left_user","right_user"),null);
 assert.equal(await loader({unpublish:true}).read("left_user","right_user"),null);
 await assert.rejects(loader({fail:true}).read("left_user","right_user"),/entries could not be loaded/);
});
