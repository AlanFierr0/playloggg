import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import {gamesQuery,parseGamesQuery} from "../src/lib/games-query.ts";
const code=ts.transpileModule(readFileSync(new URL("../src/app/search/page.tsx",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const dependencies={"@/lib/games-query":{gamesQuery,parseGamesQuery},"@/lib/locale/server":{},"@/components/screens/search-screen":{},"@/lib/portfolio":{getCatalogGame:async()=>({id:1})},"react/jsx-runtime":{}};
const context={exports:{},require:name=>dependencies[name],URLSearchParams,URL};
vm.runInNewContext(code+"\nexports.returnPath=safeReturnPath",context);
test("search returns to public profiles, personal subpages, directory filters and comparison handles",async()=>{
 for(const path of ["/u/tiempo_de_videojuegos","/u/fixture_public/ranking","/profile/stats","/profile/timeline","/profile/import/steam","/settings","/people?q=Tiempo&page=2","/compare?left=fixture_owner&right=fixture_public&page=2"])
  assert.equal(await context.exports.returnPath(path),path);
});

test("search return paths stay internal and discard unsupported parameters",async()=>{
 for(const path of ["https://evil.test","//evil.test","/\\evil.test","/auth/confirm?token_hash=secret","/lists","/u/ab","/api/share/profile"])
  assert.equal(await context.exports.returnPath(path),"/");
 assert.equal(await context.exports.returnPath("/compare?left=fixture_owner&right=fixture_public&token=secret"),"/compare?left=fixture_owner&right=fixture_public");
 assert.equal(await context.exports.returnPath("/profile/stats?token=secret"),"/profile/stats");
 assert.equal(await context.exports.returnPath("/log?game=hades"),"/log?game=hades");
});
