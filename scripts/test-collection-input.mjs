import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTags, validateList } from "../src/lib/collection-input.ts";
import { filterRankings, getSearchMatches } from "../src/lib/portfolio-view.ts";
test("tags normalize spacing and casing duplicates, preserve labels and clear", () => {
  assert.deepEqual(normalizeTags(["  Favorites ", "favorites", "Steam Deck"]), ["Favorites", "Steam Deck"]);
  assert.deepEqual(normalizeTags([]), []);
  for (const value of [null, [null], [""], ["  "], ["a\nb"], ["a".repeat(49)], Array(21).fill("tag")]) assert.equal(normalizeTags(value), null);
});
test("list drafts preserve custom order, trim names and discard forged identity", () => {
  const draft = { id: null, revision: null, name: "  Favorites ", slugs: ["b", "a"], profile_id: 123 };
  assert.deepEqual(validateList(draft), { description:"",isPublic:false,isRanked:true,id: null, revision: null, name: "Favorites", slugs: ["b", "a"] });
  assert.ok(validateList({ ...draft, id: 1, revision: 2, slugs: [] }));
  for (const change of [{ name: "" }, { name: "x".repeat(81) }, { name: "a\nb" }, { id: 1 }, { revision: 1 }, { id: -1 }, { slugs: ["a", "a"] }, { slugs: ["../game"] }, { slugs: Array.from({ length: 501 }, (_, i) => `game-${i}`) }]) assert.equal(validateList({ ...draft, ...change }), null);
});
test("tag filters include logged unscored games and combine with playback/score filters", () => {
  const games = [{ slug: "a", title: "A", keywords: "", score: null, logged: true, status: "playing", tags: ["Favorites"] }, { slug: "b", title: "B", keywords: "", score: 95, logged: true, tags: ["Favorites"] }, { slug: "c", title: "C", keywords: "", score: null, logged: false, tags: [] }];
  assert.deepEqual(filterRankings(games, "all", "favorites").map(g => g.slug), ["b", "a"]);
  assert.deepEqual(filterRankings(games, "masterpieces", "Favorites").map(g => g.slug), ["b"]);
  assert.deepEqual(filterRankings(games, "backlog", "Favorites"), []);
  const matches = getSearchMatches("favorites", { games, profile: { displayName: "Owner", handle: "owner" }, lists: [{ id: 4, name: "Favorites", revision: 1 }] });
  assert.equal(matches.titles.length, 2); assert.equal(matches.lists[0].id, 4);
});
