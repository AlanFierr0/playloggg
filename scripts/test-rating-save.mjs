import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { maximumPlaytime, validateRating } from "../src/lib/rating-input.ts";

test("save uses the catalog release date, rejects earlier completion and permits unknown launch dates", async () => {
  let writes = 0, released_on = "2020-01-01";
  const dependencies = {
    "next/cache": { revalidatePath() {} },
    "@/lib/rating-input": { maximumPlaytime, validateRating },
    "@/lib/owner": { getAccount: async () => ({ profile: { id: 2 }, supabase: { from(table) {
      return table === "games" ? { select() { return this; }, eq() { return this; }, single: async () => ({ data: { id: 1, released_on }, error: null }) }
        : { upsert: async () => { writes++; return { error: null }; } };
    } } }) },
  };
  const context = { exports: {}, require: name => dependencies[name], Date };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/app/actions/ratings.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  const input = { slug: "hades", score: null, tier: null, status: null, platform: null, tags: [], hoursPlayed: null, completedOn: "2019-12-31", review: "", released_on: "1900-01-01" };
  assert.equal((await context.exports.saveRating(input)).ok, false);
  assert.equal(writes, 0);
  assert.equal((await context.exports.saveRating({ ...input, completedOn: "2020-01-01" })).ok, true);
  assert.equal((await context.exports.saveRating({ ...input, completedOn: null })).ok, true);
  assert.equal((await context.exports.saveRating({ ...input, completedOn: null, hoursPlayed: 1e12 })).ok, false);
  assert.equal(writes, 2);
  assert.equal((await context.exports.saveRating({ ...input, completedOn: null, hoursPlayed: maximumPlaytime(released_on) })).ok, true);
  released_on = "9999-01-01";
  assert.equal((await context.exports.saveRating({ ...input, completedOn: null, hoursPlayed: 0.5 })).ok, false);
  assert.equal((await context.exports.saveRating({ ...input, completedOn: null, hoursPlayed: 0 })).ok, true);
  released_on = null;
  assert.equal((await context.exports.saveRating(input)).ok, true);
  assert.equal(writes, 5);
});
