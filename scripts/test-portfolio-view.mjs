import assert from "node:assert/strict";
import { test } from "node:test";
import { averageScore, filterRankings, getSearchMatches, groupTiers, ratedGames } from "../src/lib/portfolio-view.ts";

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

test("search uses the supplied catalog and profile, including unrated titles", () => {
  const portfolio = {
    profile: { id: "1", displayName: "Alex Vance", handle: "alexvance" },
    games: [{ ...game("catalog-only", null), title: "New Adventure", keywords: "space", genres: ["RPG"] }],
  };
  assert.equal(getSearchMatches(" ADVENTURE rpg ", portfolio).titles.length, 1);
  assert.equal(getSearchMatches("space", portfolio).titles[0].score, null);
  assert.equal(getSearchMatches("alexvance", portfolio).profiles.length, 1);
  assert.equal(getSearchMatches("kojima", portfolio).profiles.length, 0);
  assert.equal(getSearchMatches("Cyberpunk", portfolio).titles.length, 0);
  assert.equal(getSearchMatches("", portfolio).listMatches, false);
});
