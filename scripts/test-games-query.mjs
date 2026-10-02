import { test } from "node:test";
import assert from "node:assert/strict";
import { parseGamesQuery, gamesQuery } from "../src/lib/games-query.ts";
import { filterGames, validScoreRange } from "../src/lib/games-view.ts";
test("a shared catalog URL retains combined filters, zero score and page", () => {
  const state = parseGamesQuery(new URLSearchParams("q=Hades&genre=Action+RPG&platform=PC&year=unknown&library=logged&status=backlog&tier=S&rating=rated&minScore=0&maxScore=0&sort=score-desc&page=42&size=100"));
  assert.equal(state.filters.minScore, "0"); assert.equal(state.page, 42);
  assert.deepEqual(parseGamesQuery(new URLSearchParams(gamesQuery(state.filters, state.page, state.pageSize))), state);
  const games = [{ slug: "hades", title: "Hades", cover: "", keywords: "", year: null, genres: ["Action RPG"], platforms: ["PC"], score: 0, tier: "S", logged: true, status: "backlog" }];
  assert.equal(filterGames(games, state.filters).length, 1);
});
test("forged enums, malformed pages and unbounded query input are normalized", () => {
  const { filters, page } = parseGamesQuery(new URLSearchParams("library=someone-else&sort=drop-table&tier=Z&status=invalid&year=Infinity&page=-2&q=" + "x".repeat(500)));
  assert.equal(filters.query.length, 100); assert.equal(filters.library, "all"); assert.equal(filters.sort, "title"); assert.equal(filters.year, ""); assert.equal(page, 1);
  assert.equal(parseGamesQuery(new URLSearchParams("page=9999999")).page, 1_000_000);
});
test("invalid score bounds explain an empty result instead of broadening the search", () => {
  for (const search of ["minScore=101", "minScore=abc", "minScore=90&maxScore=10"]) {
    const { filters } = parseGamesQuery(new URLSearchParams(search));
    assert.equal(validScoreRange(filters), false);
    assert.deepEqual(filterGames([{ slug: "g", title: "G", score: 100, keywords: "" }], filters), []);
  }
  assert.equal(gamesQuery(parseGamesQuery(new URLSearchParams()).filters), "");
});

import { gamesPage } from "../src/lib/games-page.ts";
test("load more retains previous cards, clamps to matches and keeps payloads compact", () => {
  const games = Array.from({length:5000}, (_,i) => ({slug:`game-${String(i).padStart(4,"0")}`,title:`Game ${i}`,cover:"cover",year:2024,score:null,keywords:"",genres:["RPG"],platforms:["PC"],review:"private long review",summary:"long description",screenshots:["image"]}));
  const filters = parseGamesQuery(new URLSearchParams()).filters;
  const first = gamesPage(games,filters,1);
  assert.equal(first.games.length,25); assert.equal(first.total,5000); assert.equal(first.pageCount,200);
  const next = gamesPage(games,filters,2);
  assert.equal(next.games.length,50);assert.deepEqual(next.games.slice(0,25),first.games);
  assert.equal(new Set(next.games.map(game=>game.slug)).size,50);
  assert.ok(!("review" in first.games[0]));assert.ok(!("summary" in first.games[0]));assert.ok(!("screenshots" in first.games[0]));
  for (const size of [25,50,100,"all"]) {
    const page=gamesPage(games,filters,1,size);
    assert.equal(page.games.length,size==="all"?5000:size);
    assert.equal(page.pageSize,size);
  }
  const last = gamesPage(games,filters,999999);
  assert.equal(last.games.length,5000); assert.equal(last.offset,0); assert.equal(last.page,200);
  const all = gamesPage(games,filters,999999,"all");assert.equal(all.page,1);assert.equal(all.pageCount,1);
  const empty = gamesPage(games,{...filters,genre:"Unknown genre"},2);
  assert.equal(empty.games.length,0); assert.equal(empty.page,1); assert.equal(empty.pageCount,1);
});
test("only supported batch sizes are accepted and survive shared URLs",()=>{
  for(const size of [25,50,100,"all"]) {
    const state=parseGamesQuery(new URLSearchParams(`size=${size}`));assert.equal(state.pageSize,size);
    assert.deepEqual(parseGamesQuery(new URLSearchParams(gamesQuery(state.filters,state.page,state.pageSize))),state);
  }
  for(const value of ["0","-25","1000","25.5","ALL","garbage"]) assert.equal(parseGamesQuery(new URLSearchParams(`size=${value}`)).pageSize,25);
  assert.equal(gamesQuery(parseGamesQuery(new URLSearchParams()).filters,99,"all"),"size=all");
});


test("catalog platform families include generations, separate other platforms and preserve exact URLs", () => {
  const platforms = [["PC (Microsoft Windows)", "Android"], ["PlayStation 5", "PlayStation Vita"], ["Xbox Series X|S"], ["Nintendo Switch 2", "Game Boy", "Wii"], ["Dreamcast"], [], ["Mac", "Linux", "DOS"]];
  const games = platforms.map((platforms, i) => ({slug: String(i), title: String(i), cover: "", year: null, score: null, keywords: "", platforms}));
  const filters = parseGamesQuery(new URLSearchParams()).filters;
  for (const [platform, expected] of [["PC", ["0", "6"]], ["PlayStation", ["1"]], ["Xbox", ["2"]], ["Nintendo", ["3"]], ["Other", ["0", "4"]], ["Android", ["0"]]]) {
    assert.deepEqual(filterGames(games, {...filters, platform}).map(game => game.slug), expected);
  }
  assert.deepEqual(gamesPage(games, {...filters, platform: "Android"}, 1).platforms, ["PC", "PlayStation", "Xbox", "Nintendo", "Other"]);
  assert.equal(filterGames(games, filters).length, 7);
});


test("personal tags filter exactly without case sensitivity and retain safe URLs and card tags",()=>{
  const games=[
    {slug:"one",title:"One",score:0,year:2024,keywords:"",cover:"",logged:true,tags:["Co-op & friends", "Favorites"]},
    {slug:"two",title:"Two",score:null,year:2024,keywords:"",cover:"",logged:true,tags:["favorites"]},
    {slug:"unlogged",title:"Unlogged",score:null,year:null,keywords:"",cover:"",logged:false,tags:["Favorites"]},
  ];
  const filters={...parseGamesQuery(new URLSearchParams()).filters,tag:"FAVORITES"};
  assert.deepEqual(filterGames(games,filters).map(game=>game.slug),["one","two"]);
  assert.deepEqual(filterGames(games,{...filters,tag:"favorite"}),[]);
  assert.deepEqual(filterGames(games,{...filters,rating:"rated"}).map(game=>game.slug),["one"]);
  const facet=gamesPage(games,filters,1);assert.deepEqual(facet.tags,["Co-op & friends","Favorites"]);
  assert.deepEqual(facet.games[0].tags,["Co-op & friends","Favorites"]);
  const tagged={...filters,tag:"Co-op & friends"};
  assert.equal(parseGamesQuery(new URLSearchParams(gamesQuery(tagged,2))).filters.tag,tagged.tag);
  assert.equal(parseGamesQuery(new URLSearchParams('tag='+('x'.repeat(100)))).filters.tag.length,48);
});
