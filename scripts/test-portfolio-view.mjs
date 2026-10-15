import assert from "node:assert/strict";
import { test } from "node:test";
import { largestScoreGap, averageScore, filterRankings, getSearchMatches, groupTiers, loggedGames, ratedGames } from "../src/lib/portfolio-view.ts";

const game = (slug, score, tier = null) => ({ slug, title: slug, score, tier, cover: "/cover.jpg", year: null, keywords: "" });

test("ranking excludes unrated games, preserves zero and breaks score ties by slug", () => {
  const catalog = [game("z", 95), game("unrated", null), game("a", 95, "B"), game("zero", 0)];
  const ranked = ratedGames(catalog);
  assert.deepEqual(ranked.map(({ slug }) => slug), ["a", "z", "zero"]);
  assert.equal(catalog[0].slug, "z");
  assert.equal(averageScore(ranked), "63.3");
});

test("tiers use saved assignments independently of score and keep unassigned ratings", () => {
  const rated = ratedGames([game("high-b", 95, "B"), game("low-s", 10, "S"), game("unassigned", 93)]);
  const groups = groupTiers(rated);
  assert.equal(groups.find(({ tier }) => tier === "B").games[0].slug, "high-b");
  assert.equal(groups.find(({ tier }) => tier === "S").games[0].slug, "low-s");
  assert.equal(groups.find(({ tier }) => tier === null).games[0].slug, "unassigned");
  assert.equal(groups.reduce((sum, group) => sum + group.games.length, 0), rated.length);
});

test("filters respect exact thresholds and never invent a backlog", () => {
  const rated = ratedGames([game("90", 90), game("89", 89), game("75", 75), game("74", 74)]);
  assert.deepEqual(filterRankings(rated, "masterpieces").map(({ score }) => score), [90]);
  assert.deepEqual(filterRankings(rated, "recommended").map(({ score }) => score), [90, 89, 75]);
  assert.deepEqual(filterRankings(rated, "backlog"), []);
});

test("empty portfolios have no fabricated average or results", () => {
  assert.equal(averageScore([]), "—");
  assert.deepEqual(ratedGames([]), []);
  assert.ok(groupTiers([]).every(({ games }) => games.length === 0));
});

test("local search uses the catalog without substituting the selected profile for public results", () => {
  const portfolio = {
    profile: { id: "1", displayName: "Alex Vance", handle: "alexvance" },
    games: [{ ...game("catalog-only", null), title: "New Adventure", keywords: "space", genres: ["RPG"] }],
  };
  assert.equal(getSearchMatches(" ADVENTURE rpg ", portfolio).titles.length, 1);
  assert.equal(getSearchMatches("space", portfolio).titles[0].score, null);
  assert.equal("profiles" in getSearchMatches("alexvance", portfolio), false);
  assert.equal(getSearchMatches("Cyberpunk", portfolio).titles.length, 0);
});
test("real backlog includes unrated entries and responds to status changes without altering scored rankings", () => {
  const backlog = { ...game("next-game", null), status: "backlog", logged: true };
  const playing = { ...game("playing-game", null), status: "playing", logged: true };
  const zero = { ...game("zero", 0), status: "completed", logged: true };
  const catalog = [backlog, playing, zero, { ...game("catalog-only", null), logged: false }];
  assert.deepEqual(filterRankings(catalog, "backlog").map(g => g.slug), ["next-game"]);
  assert.deepEqual(filterRankings(catalog, "all").map(g => g.slug), ["zero"]);
  assert.equal(averageScore(ratedGames(catalog)), "0.0");
  assert.equal(loggedGames(catalog).length, 3);
  assert.equal(filterRankings([{ ...backlog, status: "playing" }], "backlog").length, 0);
});
test("tier board includes logged unrated games without pulling unlogged catalog into Unassigned", () => {
  const logged = { ...game("unrated-b", null, "B"), logged: true, status: "playing" };
  const backlog = { ...game("unassigned-backlog", null), logged: true, status: "backlog" };
  const groups = groupTiers([logged, backlog, { ...game("catalog-only", null), logged: false }]);
  assert.equal(groups.find(g => g.tier === "B").games[0].slug, "unrated-b");
  assert.deepEqual(groups.find(g => g.tier === null).games.map(g => g.slug), ["unassigned-backlog"]);
  assert.equal(groups.reduce((total,g) => total + g.games.length, 0), 2);
  assert.equal(averageScore(ratedGames([logged,backlog])), "—");
});

test("hot take selects the largest absolute gap, includes zero and single ratings, and breaks ties by slug", () => {
  const scores = new Map([["a", {average:80,count:1}], ["b", {average:20,count:2}], ["same", {average:50,count:1}]]);
  const games = [game("b",100),game("a",0),game("same",50),game("unrated",null),game("unknown",100)];
  assert.equal(largestScoreGap(games,scores).game.slug,"a");
  assert.equal(largestScoreGap(games,scores).difference,-80);
  assert.equal(largestScoreGap([game("b",100)],scores).difference,80);
  assert.equal(largestScoreGap([game("same",50),game("a",null),game("unknown",100)],scores),undefined);
});
