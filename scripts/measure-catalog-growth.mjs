import { gamesPage } from '../src/lib/games-page.ts';
import { defaultGamesFilters } from '../src/lib/games-view.ts';
import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
const source=fs.readFileSync('src/lib/portfolio.ts','utf8');const mod={exports:{}};
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:mod,exports:mod.exports,require:id=>id==='react'?{cache:f=>f}:{}});
const result=[];
for(const count of [100,1000,5000]){
 const rows=Array.from({length:count},(_,i)=>({id:i+1,slug:`game-${i}`,title:`Game ${i}`,cover_url:`https://images.igdb.com/cover-${i}.jpg`,release_year:2024,released_on:'2024-03-01',genres:['Action RPG'],search_keywords:`game ${i}`,artwork_image_ids:['artwork'],screenshot_image_ids:['a','b','c','d','e','f'],is_sample:false,igdb_url:'https://www.igdb.com/games/example',igdb_metadata:{summary:'A game description. '.repeat(80),platforms:['PC','PlayStation 5','Xbox Series X|S'],developers:['Studio'],publishers:['Publisher']}}));
 const games=mod.exports.portfolioGames(rows,[]);const full=Buffer.byteLength(JSON.stringify(games));
 const compact=games.map(({slug,title,cover,year,releasedOn,genres,keywords,score,tier,status,logged,platforms})=>({slug,title,cover,year,releasedOn,genres,keywords,score,tier,status,logged,platforms}));
 result.push({games:count,fullJsonBytes:full,compactJsonBytes:Buffer.byteLength(JSON.stringify(compact)),serverPageJsonBytes:Buffer.byteLength(JSON.stringify(gamesPage(games,defaultGamesFilters,1))),catalogPageRequests:Math.floor(count/500)+1});
}
console.log(JSON.stringify(result,null,2));
