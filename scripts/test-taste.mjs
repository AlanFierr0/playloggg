import { test } from "node:test";
import assert from "node:assert/strict";
import { tasteStats } from "../src/lib/taste.ts";
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
