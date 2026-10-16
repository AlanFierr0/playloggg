import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import vm from "node:vm";
import ts from "typescript";
import {reviewParts,hasReviewProse} from "../src/lib/review-text.ts";
test("DeepL preserves exact source URLs, skips link-only reviews and validates provider responses",async()=>{
 let calls=0,body,key="test-key:fx",bad=false;
 const dependencies={"server-only":{},"node:crypto":{createHash},"@/lib/supabase/auth-admin":{createAuthAdmin(){throw new Error("Unused");}},"@/lib/operation-limits":{},"@/lib/review-text":{reviewParts,hasReviewProse}};
 const context={exports:{},require:name=>dependencies[name],process:{env:{get DEEPL_API_KEY(){return key;}}},AbortSignal,fetch:async(url,input)=>{
  calls++;assert.equal(url,"https://api-free.deepl.com/v2/translate");body=JSON.parse(input.body);assert.ok(!input.body.includes("youtube.com"));
  return Response.json({translations:bad?[]:body.text.map(()=>({text:"Reseña traducida",detected_source_language:"EN"}))});
 }};
 vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/lib/review-translation.ts",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
 const translate=context.exports.translateReview;
 const url="https://www.youtube.com/watch?v=GrHk_mNkgSI&t=637s";
 assert.equal(await translate(url,"ES"),null);assert.equal(calls,0);
 const result=await translate(`Original review\n${url}\nAnother paragraph`,"ES");
 assert.equal(result.text,`Reseña traducida\n${url}\nReseña traducida`);assert.equal(result.sourceLanguage,"EN");assert.equal(body.target_lang,"ES");
 bad=true;await assert.rejects(translate("Original review","ES"),/unavailable/);
 key=undefined;assert.equal(await translate("Original review","ES"),null);assert.equal(calls,2);
});
import {randomUUID} from "node:crypto";
test("cold servers share translation claims and only one provider call is charged",async()=>{
 let calls=0,reservations=0,stored=null,held=null,finish;
 const wait=new Promise(resolve=>{finish=resolve;});
 const admin={rpc:async(name,args)=>{
  if(name==="read_review_translation")return {data:stored,error:null};
  if(name==="claim_review_translation"){if(held||stored)return {data:false,error:null};held=args.p_token;return {data:true,error:null};}
  if(name==="release_review_translation"){if(held===args.p_token)held=null;return {error:null};}
  if(name==="reserve_review_translation"){reservations++;return {data:true,error:null};}
  assert.equal(name,"store_review_translation");stored={text:args.p_translation,sourceLanguage:args.p_source_language};return {data:true,error:null};
 }};
 function server(){const context={exports:{},require:name=>({"server-only":{},"node:crypto":{createHash,randomUUID},"@/lib/supabase/auth-admin":{createAuthAdmin:()=>admin},"@/lib/operation-limits":{checkOperationLimit:async()=>{}},"@/lib/review-text":{reviewParts,hasReviewProse}})[name],process:{env:{DEEPL_API_KEY:"fixture:fx"}},AbortSignal,fetch:async()=>{calls++;await wait;return Response.json({translations:[{text:"Traducido",detected_source_language:"EN"}]});}};
 vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/lib/review-translation.ts",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);return context.exports.getReviewTranslation;}
 const first=server()(2,3,"Original review","ES");
 while(!calls)await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(await server()(2,3,"Original review","ES"),null);assert.equal(calls,1);
 finish();assert.equal((await first).text,"Traducido");assert.equal(held,null);
 assert.equal((await server()(2,3,"Original review","ES")).text,"Traducido");assert.equal(calls,1);assert.equal(reservations,1);
});
