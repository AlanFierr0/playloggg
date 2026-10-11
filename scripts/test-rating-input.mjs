import test from "node:test";
import assert from "node:assert/strict";
import { maximumPlaytime, parseHours, validateRating } from "../src/lib/rating-input.ts";

const draft = { slug: "cyberpunk-2077", score: 95, tier: "B", status: null, tags: [], platform: null, hoursPlayed: null, completedOn: null, review: "  Independent tier.  " };
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
  assert.deepEqual(Object.keys(parsed).sort(), ["completedOn", "hoursPlayed", "platform", "review", "score", "slug", "status", "tags", "tier"]);
});
test("unrated backlog/playing entries preserve null instead of inserting score zero", () => {
  for (const status of ["backlog", "playing", "completed", "shelved", "active", "paused", "stopped", null]) {
    const parsed = validateRating({ ...draft, score: null, status });
    assert.equal(parsed.score, null);
    assert.equal(parsed.status, status);
    assert.equal(parsed.tier, "B");
  }
});

test("optional play details preserve null and supplied zero without requiring completed status", () => {
  assert.deepEqual(validateRating({ ...draft, platform: "steam_deck", hoursPlayed: 0, completedOn: "2024-02-29", status: "playing" }),
    { ...draft, platform: "steam_deck", hoursPlayed: 0, completedOn: "2024-02-29", status: "playing", review: "Independent tier." });
  for (const platform of ["pc", "pc_battlenet", "pc_gog", "pc_epic", "pc_ea", "pc_ubisoft", "pc_xbox", "pc_other", "ps1", "ps2", "ps3", "ps4", "ps5", "psp", "ps_vita", "xbox", "xbox_360", "xbox_one", "xbox_series_x", "xbox_series_s", "steam_deck", "nintendo_switch", "nintendo_switch_2", "nintendo_wii_u", "nintendo_wii", "nintendo_gamecube", "nintendo_64", "nintendo_snes", "nintendo_nes", "nintendo_3ds", "nintendo_ds", "nintendo_gba", "nintendo_gbc", "nintendo_gb", "other_dreamcast", "other_saturn", "other_genesis", "other_master_system", "other_game_gear", "other_android", "other_ios", "other_browser", "other_platform", null]) assert.equal(validateRating({ ...draft, platform }).platform, platform);
  assert.equal(validateRating({ ...draft, hoursPlayed: 78.45 }).hoursPlayed, 78.45);
});
test("reject invalid platforms, nonfinite/negative hours and impossible or timezone-bearing dates", () => {
  for (const platform of [undefined, "switch", "PC", "toString", "__proto__", [], 1]) assert.equal(validateRating({ ...draft, platform }), null);
  for (const hoursPlayed of [undefined, -1, NaN, Infinity, -Infinity, "0", true]) assert.equal(validateRating({ ...draft, hoursPlayed }), null);
  for (const completedOn of [undefined, "", "2023-02-29", "2024-02-30", "2024-13-01", "2024-04-31", "0000-01-01", "10000-01-01", "2024-01-01T00:00:00Z", "October 28, 2024", "9999-12-31", "2099-01-01"]) assert.equal(validateRating({ ...draft, completedOn }), null);
  for (const completedOn of ["0001-01-01", "0099-12-31", "2024-02-29"]) assert.equal(validateRating({ ...draft, completedOn }).completedOn, completedOn);
});
test("parse playtime explicitly so blanks and invalid text never silently become zero", () => {
  for (const text of ["", "   "]) assert.equal(parseHours(text), null);
  for (const [text,value] of [["0",0],["78.45",78.45],[" .5 ",0.5],["1.",1],["1e3",1000],["1e-7",0.0000001]]) assert.equal(parseHours(text), value);
  for (const text of ["-1", "NaN", "Infinity", "45 hrs", "1,5", "1e309", "9".repeat(400)]) assert.equal(parseHours(text), undefined);
});


test("live-service statuses are shared by full saves and catalog URLs", async()=>{
  const {parseGamesQuery}=await import("../src/lib/games-query.ts");
  const {filterGames}=await import("../src/lib/games-view.ts");
  for(const status of ["active","paused","stopped"]){
    const {filters}=parseGamesQuery(new URLSearchParams({status}));
    assert.equal(filters.status,status);
    assert.equal(filterGames([{...draft,logged:true,title:"Hades",keywords:"",genres:[],status}],filters).length,1);
  }
  for(const status of ["toString","__proto__",{},"unknown"]){
    assert.equal(validateRating({...draft,status}),null);
  }
});

 test("playtime ceiling uses elapsed hours, preserves fractions and clamps unreleased games to zero", () => {
  const now = Date.parse("2026-10-08T12:30:00Z");
  assert.equal(maximumPlaytime("2026-10-07", now), 36.5);
  assert.equal(maximumPlaytime("2026-10-08", now), 12.5);
  assert.equal(maximumPlaytime("2026-10-09", now), 0);
  assert.equal(maximumPlaytime(null, now), null);
});
