import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultGamesFilters, filterGames, validScoreRange } from "../src/lib/games-view.ts";

const game = (slug, values = {}) => ({ slug, title: slug, score: null, year: null, keywords: "", cover: "/cover.jpg", logged: false, ...values });
const catalog = [
  game("space", { title: "Space Adventure", genres: ["RPG"], platforms: ["PC", "Switch"], year: 2024, releasedOn: "2024-10-01" }),
  game("backlog", { title: "Unscored RPG", logged: true, status: "backlog", genres: ["RPG"], platforms: ["PC"], year: 2024 }),
  game("zero", { title: "Zero", logged: true, score: 0, tier: "S", status: "completed", platforms: ["PC"], year: 2000 }),
  game("high", { title: "High", logged: true, score: 95, tier: "B", status: "playing", platforms: ["Switch"], year: 2024, releasedOn: "2024-01-01" }),
  game("unset", { title: "Unset status", logged: true, score: null, platform: "pc", year: null }),
];
const select = (filters = {}) => filterGames(catalog, { ...defaultGamesFilters, ...filters }).map((game) => game.slug);

test("full catalog includes unlogged titles; search/genre/platform/year compose", () => {
  assert.equal(select().length, 5);
  assert.deepEqual(select({ query: " SPACE rpg ", genre: "RPG", platform: "Switch", year: "2024" }), ["space"]);
  assert.deepEqual(select({ query: "space", library: "logged" }), []);
  assert.deepEqual(select({ year: "unknown" }), ["unset"]);
  // A chosen played platform does not fabricate catalog platform support.
  assert.ok(!select({ platform: "PC" }).includes("unset"));
});

test("personal statuses/tier assignments are independent from scores and unlogged games", () => {
  assert.deepEqual(select({ status: "backlog", rating: "unrated" }), ["backlog"]);
  assert.deepEqual(select({ status: "unset" }), ["unset"]);
  assert.deepEqual(select({ library: "unlogged" }), ["space"]);
  assert.deepEqual(select({ tier: "S" }), ["zero"]);
  assert.deepEqual(select({ tier: "B", minScore: "90" }), ["high"]);
});

test("score range preserves zero, excludes null scores and validates reversed/out-of-bounds input", () => {
  assert.deepEqual(select({ minScore: "0", maxScore: "0" }), ["zero"]);
  assert.deepEqual(select({ rating: "rated" }), ["high", "zero"]);
  assert.deepEqual(select({ minScore: "0" }), ["high", "zero"]);
  for (const bounds of [{ minScore: "90", maxScore: "10" }, { maxScore: "101" }, { minScore: "-1" }, { minScore: "abc" }, { minScore: "0.5" }]) {
    assert.equal(validScoreRange({ ...defaultGamesFilters, ...bounds }), false);
    assert.deepEqual(select(bounds), []);
  }
});

test("sorts put unknown scores/dates last in either direction without mutating the catalog", () => {
  const before = [...catalog];
  assert.deepEqual(select({ sort: "score-desc" }).slice(0, 2), ["high", "zero"]);
  assert.deepEqual(select({ sort: "score-asc" }).slice(0, 2), ["zero", "high"]);
  assert.equal(select({ sort: "newest" })[0], "space");
  assert.equal(select({ sort: "oldest" })[0], "zero");
  assert.equal(select({ sort: "newest" }).at(-1), "unset");
  assert.equal(select({ sort: "oldest" }).at(-1), "unset");
  assert.deepEqual(catalog, before);
});
