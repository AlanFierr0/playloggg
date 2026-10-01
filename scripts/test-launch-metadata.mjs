import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import ts from "typescript";
test("localized metadata preserves URL instances, canonical paths, booleans and user-independent image data",async()=>{
 const source=readFileSync(new URL("../src/lib/locale/server.ts",import.meta.url),"utf8");
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const deps={"server-only":{},react:{cache:fn=>fn},"next/headers":{cookies:async()=>({get:()=>({value:"es-AR"})})},"./preferences":{localeCookie:"locale",siteLocale:()=>"es-AR"},"./translate":{translateText:source=>`translated:${source}`}};
 const compiledModule={exports:{}};
 vm.runInNewContext(compiled,{module:compiledModule,exports:compiledModule.exports,URL,require:name=>{assert.ok(name in deps);return deps[name]}});
 const origin=new URL("https://playloggg.vercel.app");
 const result=await compiledModule.exports.localizeMetadata({metadataBase:origin,title:"Discover",robots:{index:false},alternates:{canonical:"https://playloggg.vercel.app/games"},openGraph:{url:origin,images:[{url:"https://images.igdb.com/cover.jpg",alt:"Hades"}]}});
 assert.equal(result.metadataBase,origin);assert.equal(result.openGraph.url,origin);assert.equal(result.title,"translated:Discover");assert.equal(result.robots.index,false);assert.equal(result.openGraph.images[0].alt,"Hades");assert.equal(result.alternates.canonical,"https://playloggg.vercel.app/games");
});
