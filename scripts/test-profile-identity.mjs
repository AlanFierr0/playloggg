import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { favoriteInput } from "../src/lib/favorite-input.ts";
import { profileSettings } from "../src/lib/profile-settings.ts";
const form = values => { const data = new FormData(); for (const [key, value] of Object.entries(values)) data.set(key, value); return data; };
function load(path, deps) {
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const compiledModule = { exports: {} };
  vm.runInNewContext(code, { module: compiledModule, exports: compiledModule.exports, require: id => { assert.ok(id in deps, `Unexpected dependency ${id}`); return deps[id]; } });
  return compiledModule.exports;
}
test("identity drafts whitelist optional public fields, trim blanks and reject invalid lengths/control characters", () => {
  assert.deepEqual(profileSettings(form({ setting: "identity", bio: "  RPGs\nForever  ", location: " Buenos Aires ", platformPreference: "PC", owner_user_id: "forged", is_public: "true" })), { setting: "identity", values: { bio: "RPGs\nForever", location: "Buenos Aires", platform_preference: "PC" } });
  assert.deepEqual(profileSettings(form({ setting: "identity", bio: "", location: " ", platformPreference: "" })).values, { bio: null, location: null, platform_preference: null });
  for (const patch of [{ bio: "x".repeat(501) }, { location: "x".repeat(81) }, { platformPreference: "x".repeat(81) }, { bio: "unsafe\u0000" }]) assert.equal(profileSettings(form({ setting: "identity", bio: "", location: "", platformPreference: "", ...patch })), null);
});
test("favorite input ignores submitted identity, preserves explicit positions and rejects invalid operations", () => {
  assert.deepEqual(favoriteInput(form({ slug: "hades", operation: "add", profile_id: "999", score: "100" })), { slug: "hades", favorite: true, featuredSlot: null });
  assert.deepEqual(favoriteInput(form({ slug: "hades", operation: "feature", slot: "4" })), { slug: "hades", favorite: true, featuredSlot: 4 });
  assert.equal(favoriteInput(form({ slug: "hades", operation: "remove" })).favorite, false);
  for (const patch of [{ slug: "../hades" }, { operation: "toggle" }, { operation: "feature", slot: "5" }, { operation: "feature", slot: "1.5" }]) assert.equal(favoriteInput(form({ slug: "hades", operation: "add", ...patch })), null);
});
test("favorite action verifies account and trusted catalog ID, uses the owner-derived RPC and preserves failed saves", async () => {
  let account = null, rpcCalls = [], error = null, invalidations = 0;
  const client = { from(table) { assert.equal(table, "games"); return { select() { return this; }, eq(key, value) { assert.equal(key, "slug"); assert.equal(value, "hades"); return this; }, async maybeSingle() { return { data: { id: 7 }, error: null }; } }; }, async rpc(name, args) { rpcCalls.push([name, args]); return { error }; } };
  const { updateFavorite } = load("../src/app/actions/favorites.ts", { "next/cache": { revalidatePath: () => invalidations++ }, "@/lib/owner": { getAccount: async () => account }, "@/lib/favorite-input": { favoriteInput } });
  const draft = form({ slug: "hades", operation: "feature", slot: "2", game_id: "999", profile_id: "999" });
  assert.match((await updateFavorite({}, draft)).message, /Sign in/); assert.equal(rpcCalls.length, 0);
  account = { profile: { id: 2 }, supabase: client };
  assert.match((await updateFavorite({}, draft)).message, /independently/);
  assert.deepEqual(JSON.parse(JSON.stringify(rpcCalls[0])), ["set_profile_favorite", { p_game_id: 7, p_favorite: true, p_featured_slot: 2 }]);
  assert.equal(invalidations, 1); error = { code: "42501" };
  assert.match((await updateFavorite({}, draft)).message, /could not be saved/); assert.equal(invalidations, 1);
});
test("favorite reads paginate beyond 1000 and scope every request to the selected profile", async () => {
  const offsets = [];
  const rows = Array.from({ length: 1001 }, (_, i) => ({ game_id: i + 1, games: { slug: `game-${i}` }, featured_slot: i === 1000 ? 4 : null, created_at: "2026-10-01T00:00:00Z" }));
  const { readFavorites } = load("../src/lib/favorites.ts", { "server-only": {} });
  const client = { from(table) { assert.equal(table, "profile_favorites"); return { select() { return this; }, eq(key, value) { assert.equal(key, "profile_id"); assert.equal(value, 42); return this; }, order(key) { assert.equal(key, "game_id"); return this; }, range(start, end) { offsets.push(start); return { data: rows.slice(start, end + 1), error: null }; } }; } };
  const result = await readFavorites(client, 42);
  assert.equal(result.length, 1001); assert.deepEqual(offsets, [0, 500, 1000]); assert.equal(result.at(-1).featuredSlot, 4);
});
