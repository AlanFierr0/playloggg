import {test} from "node:test";
import assert from "node:assert/strict";
import {rankingOrder} from "../src/lib/ranking-order.ts";
const games = [{slug:"a",score:95,logged:true},{slug:"b",score:90,logged:true},{slug:"c",score:80,logged:true},{slug:"d",score:70,logged:true}];
test("only manually positioned games stop following score changes", () => {
  assert.deepEqual(rankingOrder(games),["a","b","c","d"]);
  const manual={d:1};
  assert.deepEqual(rankingOrder(games,manual),["a","d","b","c"]);
  assert.deepEqual(rankingOrder(games.map(game => game.slug==="c" ? {...game,score:100} : game),manual),["c","d","a","b"]);
  assert.deepEqual(rankingOrder(games.filter(game=>game.slug!=="a"),{d:3}),["b","c","d"]);
  assert.deepEqual(rankingOrder(games,{missing:0}),["a","b","c","d"]);
});
