import { test } from "node:test";
import assert from "node:assert/strict";
import { tasteStats } from "../src/lib/taste.ts";
import { gamingYear, yearGames } from "../src/lib/gaming-year.ts";
const game = (slug, score, extra = {}) => ({
  slug,
  title: slug,
  cover: "",
  year: 2020,
  score,
  keywords: "",
  logged: true,
  ...extra,
});
test("taste groups count multi-genre games once, include zero and require three ratings for preferences", () => {
  const games = [
    game("a", 0, { genres: ["RPG", "RPG", "Action"], developers: ["Studio"] }),
    game("b", 100, { genres: ["RPG"], developers: ["Studio"] }),
    game("c", 50, { genres: ["RPG"], developers: ["Studio"] }),
    game("d", null, { genres: ["Action"] }),
    game("e", 100, { genres: ["RPG"], logged: false }),
  ];
  const stats = tasteStats(games);
  assert.equal(stats.rated, 3);
  assert.equal(stats.average, 50);
  assert.deepEqual(
    stats.preferredGenres.map((g) => g.name),
    ["RPG"],
  );
  assert.equal(stats.preferredGenres[0].average, 50);
  assert.equal(stats.genres.find((g) => g.name === "Action").count, 1);
  assert.equal(stats.studios[0].count, 3);
  assert.equal(tasteStats([]).completionRate, null);
});
test("year summaries use recorded score/completion changes, exclude reviews and don't fabricate past years", () => {
  const events = [
    {
      game_id: 1,
      kind: "entry",
      score: 90,
      score_changed: true,
      completion_changed: false,
      occurred_at: "2026-01-01T00:00:00Z",
    },
    {
      game_id: 1,
      kind: "entry",
      score: 95,
      score_changed: true,
      completion_changed: true,
      occurred_at: "2026-02-01T00:00:00Z",
    },
    {
      game_id: 2,
      kind: "entry",
      score: 80,
      score_changed: false,
      completion_changed: false,
      occurred_at: "2026-03-01T00:00:00Z",
    },
  ];
  const summary = gamingYear(events, 2026);
  assert.equal(summary.scored, 1);
  assert.equal(summary.average, 95);
  assert.equal(summary.completed, 1);
  assert.equal(gamingYear(events, 2025).scored, 0);
});
test("year game summaries do not reuse today's completion status or platform for old years", () => {
  const summary = gamingYear(
    [
      {
        game_id: 1,
        kind: "entry",
        score: 80,
        score_changed: true,
        completion_changed: false,
        occurred_at: "2025-06-01T00:00:00Z",
      },
    ],
    2025,
  );
  const [entry] = yearGames(
    summary,
    [{ id: 1, slug: "a" }],
    [game("a", 99, { status: "completed", platform: "pc" })],
  );
  assert.equal(entry.score, 80);
  assert.equal(entry.status, null);
  assert.equal(entry.platform, null);
});

test("completion excludes ongoing statuses without treating unlogged games as entries", () => {
  const stats=tasteStats([
    game("done",80,{status:"completed"}),game("backlog",null,{status:"backlog"}),
    game("active",90,{status:"active"}),game("paused",85,{status:"paused"}),
    game("stopped",70,{status:"stopped"}),game("not-logged",null,{status:"active",logged:false}),
  ]);
  assert.equal(stats.ongoing,3);
  assert.equal(stats.finishable,2);
  assert.equal(stats.completed,1);
  assert.equal(stats.completionRate,50);
  assert.equal(tasteStats([game("only",null,{status:"active"})]).completionRate,null);
  assert.equal(tasteStats([game("zero",null,{status:null})]).completionRate,0);
});
