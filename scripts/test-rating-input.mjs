import test from "node:test";
import assert from "node:assert/strict";
import { parseHours, validateRating } from "../src/lib/rating-input.ts";

const draft = { slug: "cyberpunk-2077", score: 95, tier: "B", status: null, platform: null, hoursPlayed: null, completedOn: null, review: "  Independent tier.  " };
test("zero, null tier, and empty review are valid; scores do not dictate tiers", () => {
  assert.deepEqual(validateRating(draft), { ...draft, review: "Independent tier." });
  assert.deepEqual(validateRating({ ...draft, score: 0, tier: null, review: "" }), { ...draft, score: 0, tier: null, review: "" });
});
test("reject invalid and unbounded input before attempting writes", () => {
  for (const score of [-1, 101, 99.5, "95", NaN, undefined]) assert.equal(validateRating({ ...draft, score }), null);
  for (const status of ["done", "Playing", 1, undefined]) assert.equal(validateRating({ ...draft, status }), null);
  for (const tier of ["E", "s", undefined, 1]) assert.equal(validateRating({ ...draft, tier }), null);
  for (const slug of ["", "../profiles", "slug?select=*", "a".repeat(201)]) assert.equal(validateRating({ ...draft, slug }), null);
  assert.equal(validateRating({ ...draft, review: "x".repeat(20001) }), null);
  assert.equal(validateRating({ ...draft, review: null }), null);
});
test("client-supplied identity fields cannot select a different profile or game ID", () => {
  const parsed = validateRating({ ...draft, profile_id: 1, game_id: 2, owner_user_id: "forged" });
  assert.deepEqual(Object.keys(parsed).sort(), ["completedOn", "hoursPlayed", "platform", "review", "score", "slug", "status", "tier"]);
});
test("unrated backlog/playing entries preserve null instead of inserting score zero", () => {
  for (const status of ["backlog", "playing", "completed", "shelved", null]) {
    const parsed = validateRating({ ...draft, score: null, status });
    assert.equal(parsed.score, null);
    assert.equal(parsed.status, status);
    assert.equal(parsed.tier, "B");
  }
});

test("optional play details preserve null and supplied zero without requiring completed status", () => {
  assert.deepEqual(validateRating({ ...draft, platform: "steam_deck", hoursPlayed: 0, completedOn: "2024-02-29", status: "playing" }),
    { ...draft, platform: "steam_deck", hoursPlayed: 0, completedOn: "2024-02-29", status: "playing", review: "Independent tier." });
  for (const platform of ["pc", "ps5", "xbox_series_x", "steam_deck", null]) assert.equal(validateRating({ ...draft, platform }).platform, platform);
  assert.equal(validateRating({ ...draft, hoursPlayed: 78.45 }).hoursPlayed, 78.45);
});
test("reject invalid platforms, nonfinite/negative hours and impossible or timezone-bearing dates", () => {
  for (const platform of [undefined, "switch", "PC", [], 1]) assert.equal(validateRating({ ...draft, platform }), null);
  for (const hoursPlayed of [undefined, -1, NaN, Infinity, -Infinity, "0", true]) assert.equal(validateRating({ ...draft, hoursPlayed }), null);
  for (const completedOn of [undefined, "", "2023-02-29", "2024-02-30", "2024-13-01", "2024-04-31", "0000-01-01", "10000-01-01", "2024-01-01T00:00:00Z", "October 28, 2024"]) assert.equal(validateRating({ ...draft, completedOn }), null);
  for (const completedOn of ["0001-01-01", "0099-12-31", "2024-02-29", "9999-12-31"]) assert.equal(validateRating({ ...draft, completedOn }).completedOn, completedOn);
});
test("parse playtime explicitly so blanks and invalid text never silently become zero", () => {
  for (const text of ["", "   "]) assert.equal(parseHours(text), null);
  for (const [text,value] of [["0",0],["78.45",78.45],[" .5 ",0.5],["1.",1],["1e3",1000],["1e-7",0.0000001]]) assert.equal(parseHours(text), value);
  for (const text of ["-1", "NaN", "Infinity", "45 hrs", "1,5", "1e309", "9".repeat(400)]) assert.equal(parseHours(text), undefined);
});
