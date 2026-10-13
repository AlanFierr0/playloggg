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
