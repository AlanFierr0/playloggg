import test from "node:test";
import assert from "node:assert/strict";
import { validateRating } from "../src/lib/rating-input.ts";

const draft = { slug: "cyberpunk-2077", score: 95, tier: "B", review: "  Independent tier.  " };
test("zero, null tier, and empty review are valid; scores do not dictate tiers", () => {
  assert.deepEqual(validateRating(draft), { ...draft, review: "Independent tier." });
  assert.deepEqual(validateRating({ ...draft, score: 0, tier: null, review: "" }), { ...draft, score: 0, tier: null, review: "" });
});
test("reject invalid and unbounded input before attempting writes", () => {
  for (const score of [-1, 101, 99.5, "95", NaN, null]) assert.equal(validateRating({ ...draft, score }), null);
  for (const tier of ["E", "s", undefined, 1]) assert.equal(validateRating({ ...draft, tier }), null);
  for (const slug of ["", "../profiles", "slug?select=*", "a".repeat(201)]) assert.equal(validateRating({ ...draft, slug }), null);
  assert.equal(validateRating({ ...draft, review: "x".repeat(20001) }), null);
  assert.equal(validateRating({ ...draft, review: null }), null);
});
test("client-supplied identity fields cannot select a different profile or game ID", () => {
  const parsed = validateRating({ ...draft, profile_id: 1, game_id: 2, owner_user_id: "forged" });
  assert.deepEqual(Object.keys(parsed).sort(), ["review", "score", "slug", "tier"]);
});
