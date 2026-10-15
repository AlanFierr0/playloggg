import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTags } from "../src/lib/collection-input.ts";
import { filterRankings } from "../src/lib/portfolio-view.ts";
test("tags normalize spacing and casing duplicates, preserve labels and clear", () => {
  assert.deepEqual(normalizeTags(["  Favorites ", "favorites", "Steam Deck"]), ["Favorites", "Steam Deck"]);
  assert.deepEqual(normalizeTags([]), []);
  for (const value of [null, [null], [""], ["  "], ["a\nb"], ["a".repeat(49)], Array(21).fill("tag")]) assert.equal(normalizeTags(value), null);
});
test("tag filters include logged unscored games and combine with playback/score filters", () => {
  const games = [{ slug: "a", title: "A", keywords: "", score: null, logged: true, status: "playing", tags: ["Favorites"] }, { slug: "b", title: "B", keywords: "", score: 95, logged: true, tags: ["Favorites"] }, { slug: "c", title: "C", keywords: "", score: null, logged: false, tags: [] }];
  assert.deepEqual(filterRankings(games, "all", "favorites").map(g => g.slug), ["b", "a"]);
  assert.deepEqual(filterRankings(games, "masterpieces", "Favorites").map(g => g.slug), ["b"]);
  assert.deepEqual(filterRankings(games, "backlog", "Favorites"), []);
});
