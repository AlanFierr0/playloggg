import { test } from "node:test";
import assert from "node:assert/strict";
import { parseGamesQuery, gamesQuery } from "../src/lib/games-query.ts";
import { filterGames, validScoreRange } from "../src/lib/games-view.ts";
test("a shared catalog URL retains combined filters, zero score and page", () => {
  const state = parseGamesQuery(new URLSearchParams("q=Hades&genre=Action+RPG&platform=PC&year=unknown&library=logged&status=backlog&tier=S&rating=rated&minScore=0&maxScore=0&sort=score-desc&page=42"));
  assert.equal(state.filters.minScore, "0"); assert.equal(state.page, 42);
  assert.deepEqual(parseGamesQuery(new URLSearchParams(gamesQuery(state.filters, state.page))), state);
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
test("large catalogs ship only 24 cards and retain the last page", () => {
  const games = Array.from({length:5000}, (_,i) => ({slug:`game-${String(i).padStart(4,"0")}`,title:`Game ${i}`,cover:"cover",year:2024,score:null,keywords:"",genres:["RPG"],platforms:["PC"],review:"private long review",summary:"long description",screenshots:["image"]}));
  const filters = parseGamesQuery(new URLSearchParams()).filters;
  const first = gamesPage(games,filters,1);
  assert.equal(first.games.length,24); assert.equal(first.total,5000); assert.equal(first.pageCount,209);
  assert.ok(first.games.every(game => !("review" in game) && !("summary" in game) && !("screenshots" in game)));
  const last = gamesPage(games,filters,999999);
  assert.equal(last.page,209); assert.equal(last.games.length,8);
  assert.equal(last.offset+last.games.length,5000);
  const empty = gamesPage(games,{...filters,genre:"Unknown genre"},2);
  assert.equal(empty.matched,0); assert.equal(empty.page,1); assert.ok(empty.genres.includes("Unknown genre"));
});
