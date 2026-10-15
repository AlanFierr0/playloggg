import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { maximumPlaytime, validateRating } from "../src/lib/rating-input.ts";

test("save uses the catalog release date, rejects earlier completion and permits unknown launch dates", async () => {
  let writes = 0, released_on = "2020-01-01", previous = null;
  const dependencies = {
    "next/cache": { revalidatePath() {} },
    "@/lib/rating-input": { maximumPlaytime, validateRating },
    "@/lib/owner": { getAccount: async () => ({ profile: { id: 2 }, supabase: { rpc: async () => { writes++; return {data: new Date().toISOString(), error:null}; }, from(table) {
      return table === "games" ? { select() { return this; }, eq() { return this; }, single: async () => ({ data: { id: 1, released_on }, error: null }) }
        : { select() { return this; }, eq() { return this; }, maybeSingle: async () => ({data: previous, error: null}) };
    } } }) },
  };
  const context = { exports: {}, require: name => dependencies[name], Date };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/app/actions/ratings.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  const input = { slug: "hades", score: null, tier: null, status: null, platform: null, tags: [], hoursPlayed: null, completedOn: "2019-12-31", review: "", released_on: "1900-01-01" };
  assert.equal((await context.exports.saveRating(input)).ok, false);
  assert.equal(writes, 0);
  assert.equal((await context.exports.saveRating({...input, completedOn: "2099-01-01"})).ok, false);
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
  released_on = "2020-01-01";
  previous = {hours_played: 1e12, completed_on: "2010-01-01", updated_at: "2026-10-12T00:00:00Z"};
  const legacy = {...input, score: 95, review: "Changed review only", hoursPlayed: previous.hours_played, completedOn: previous.completed_on, expectedUpdatedAt: previous.updated_at};
  assert.equal((await context.exports.saveRating(legacy)).ok, true, "Unchanged legacy dates and hours must not block a review edit");
  assert.equal((await context.exports.saveRating({...legacy, hoursPlayed: 2})).ok, true, "Correcting hours must preserve the unchanged legacy date");
  assert.equal((await context.exports.saveRating({...legacy, completedOn: "2021-01-01"})).ok, true, "Correcting completion must preserve unchanged legacy hours");
  assert.equal((await context.exports.saveRating({...legacy, hoursPlayed: 1e12 + 1})).ok, false);
  assert.equal((await context.exports.saveRating({...legacy, completedOn: "2000-01-01"})).ok, false);
  previous = {...previous, completed_on: "2099-01-01"};
  assert.equal((await context.exports.saveRating({...legacy, completedOn: previous.completed_on})).ok, true, "Unchanged legacy future date is preserved");
  assert.equal((await context.exports.saveRating({...legacy, completedOn: "2100-01-01"})).ok, false);

});
