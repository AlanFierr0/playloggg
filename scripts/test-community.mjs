import { test } from "node:test";
import assert from "node:assert/strict";
import {
  communityStats,
  tasteRecommendations,
  tasteNeighbors,
} from "../src/lib/community-stats.ts";
const row = (profile_id, game_id, score) => ({ profile_id, game_id, score });
test("community averages include one score, exclude null, deduplicate profiles and include zero", () => {
  const ratings = [
    ...Array.from({ length: 5 }, (_, i) => row(i, 1, i * 25)),
    row(0, 2, 100),
    row(1, 2, null),
    row(0, 1, 0),
  ];
  const stats = communityStats(ratings, []);
  assert.equal(stats.scores.length, 2);
  assert.equal(stats.scores[1].average, 100);
  assert.equal(stats.scores[1].count, 1);
  assert.equal(communityStats([row(0, 3, 0)], []).scores[0].average, 0);
  assert.equal(communityStats([row(0, 3, null)], []).scores.length, 0);
  assert.equal(stats.scores[0].count, 5);
  assert.equal(stats.scores[0].average, 50);
  assert.ok(Math.abs(stats.scores[0].deviation - Math.sqrt(1250)) < 1e-9);
});
test("trending counts distinct people, excludes ordinary updates, old and future events", () => {
  const now = Date.parse("2026-10-01T00:00:00Z");
  const event = (profile_id, occurred_at, score_changed = true) => ({
    profile_id,
    game_id: 1,
    occurred_at,
    score_changed,
  });
  const stats = communityStats(
    [],
    [
      event(1, "2026-09-25"),
      event(1, "2026-09-26"),
      event(2, "2026-08-01"),
      event(3, "2026-09-25", false),
      event(4, "2026-10-02"),
    ],
    now,
  );
  assert.deepEqual(stats.trending, [{ gameId: 1, count: 1 }]);
});
test("recommendations enforce overlap, match, source score and not-logged rules", () => {
  const own = [
    ...Array.from({ length: 5 }, (_, i) => row(1, i, 80)),
    row(1, 10, null),
  ];
  const other = [
    ...Array.from({ length: 5 }, (_, i) => row(2, i, 95)),
    row(2, 6, 90),
    row(2, 7, 89),
    row(2, 10, 100),
    ...Array.from({ length: 4 }, (_, i) => row(3, i, 80)),
    row(3, 8, 100),
    ...Array.from({ length: 5 }, (_, i) => row(4, i, 96)),
    row(4, 9, 100),
  ];
  const results = tasteRecommendations(own, other, 1);
  assert.equal(results.length, 1);
  assert.equal(results[0].gameId, 6);
  assert.equal(results[0].bestMatch, 85);
  assert.equal(tasteRecommendations(own.slice(0, 4), other, 1).length, 0);
});
test("taste neighbors report the actual overlap and exclude self, sparse and weak matches", () => {
  const own = Array.from({ length: 5 }, (_, i) => row(1, i, 80));
  const others = [
    ...own,
    ...Array.from({ length: 5 }, (_, i) => row(2, i, 95)),
    ...Array.from({ length: 4 }, (_, i) => row(3, i, 80)),
    ...Array.from({ length: 5 }, (_, i) => row(4, i, 96)),
  ];
  assert.deepEqual(tasteNeighbors(own, others, 1), [
    { profileId: 2, shared: 5, match: 85 },
  ]);
});
