import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { profileSettings, publicProfilePath } from "../src/lib/profile-settings.ts";

const form = (values) => { const data = new FormData(); for (const [key, value] of Object.entries(values)) data.set(key, value); return data; };
function load(relative, dependencies) {
  const source = readFileSync(new URL(relative, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, require: (name) => { assert.ok(name in dependencies, `Unexpected dependency: ${name}`); return dependencies[name]; }, Date, process: { env: {} }, AbortSignal, fetch };
  vm.runInNewContext(compiled, context);
  return context.exports;
}

test("settings require explicit operations and whitelist names or visibility independently", () => {
  assert.deepEqual(profileSettings(form({ setting: "names", handle: "valid_user", displayName: "  Player  ", is_public: "true", owner_user_id: "other" })), { setting: "names", values: { handle: "valid_user", display_name: "Player" } });
  assert.deepEqual(profileSettings(form({ setting: "visibility", visibility: "private", handle: "overwrite" })), { setting: "visibility", values: { is_public: false } });
  assert.deepEqual(profileSettings(form({ setting: "visibility", visibility: "public" })), { setting: "visibility", values: { is_public: true } });
  for (const value of [{}, { setting: "visibility" }, { setting: "visibility", visibility: "true" }, { setting: "names", handle: "bad/path", displayName: "Player" }, { setting: "names", handle: "player", displayName: "\u0000" }]) assert.equal(profileSettings(form(value)), null);
  assert.equal(publicProfilePath("valid_user"), "/u/valid_user");
  for (const handle of ["../../login", "name?public=true", "a", "Name", "x".repeat(31)]) assert.equal(publicProfilePath(handle), null);
});

test("profile mutations verify Auth ownership, prevent sample edits and never trust submitted IDs", async () => {
  let account = null, adminCalls = 0, patch, constraints, result = { data: { handle: "player", is_public: true }, error: null };
  const invalidated = [];
  const query = { update(value) { patch = value; constraints = []; return this; }, eq(key, value) { constraints.push([key, value]); return this; }, select() { return this; }, async maybeSingle() { return result; } };
  const { updateProfile } = load("../src/app/actions/profile.ts", {
    "next/navigation": { redirect() { throw new Error("Unexpected redirect"); } },
    "next/cache": { revalidatePath: (...args) => invalidated.push(args) },
    "@/lib/owner": { getAccount: async () => account },
    "@/lib/steam-openid": {}, "@/lib/profile-settings": { profileSettings },
    "@/lib/supabase/auth-admin": { createAuthAdmin: () => { adminCalls++; return { from: (table) => { assert.equal(table, "profiles"); return query; } }; } },
  });
  const publish = form({ setting: "visibility", visibility: "public", id: "999", owner_user_id: "attacker", is_sample: "true" });
  assert.match((await updateProfile({}, publish)).message, /Sign in/);
  account = { user: { id: "verified-user" }, profile: null };
  assert.match((await updateProfile({}, publish)).message, /Sign in/);
  assert.equal(adminCalls, 0);
  account.profile = { id: 2, handle: "player" };
  assert.match((await updateProfile({}, publish)).message, /now public/);
  assert.deepEqual(JSON.parse(JSON.stringify(constraints)), [["id", 2], ["owner_user_id", "verified-user"], ["is_sample", false]]);
  assert.deepEqual(Object.keys(patch).sort(), ["is_public", "updated_at"]);
  assert.equal(patch.is_public, true);
  assert.equal(invalidated.length, 1);
  result = { data: null, error: null };
  assert.match((await updateProfile({}, publish)).message, /could not be updated/);
  assert.equal(invalidated.length, 1);
  result = { data: null, error: { code: "23505" } };
  assert.match((await updateProfile({}, form({ setting: "names", handle: "taken", displayName: "Player", is_public: "true" }))).message, /handle is taken/);
  assert.deepEqual(Object.keys(patch).sort(), ["display_name", "handle", "updated_at"]);
});

test("public portfolios use anonymous fresh reads, paginate entries and hide unpublished/unknown profiles", async () => {
  let published = true, lookups = 0;
  const calls = [];
  const profile = { id: 5, handle: "player", display_name: "Player", is_sample: false, is_public: true };
  const ratings = Array.from({ length: 501 }, (_, index) => ({ game_id: index + 1, score: index === 0 ? 0 : null }));
  const client = { from(table) {
    const filters = {}; let offset = 0, end = 999;
    const query = { select() { return this; }, eq(key, value) { filters[key] = value; return this; }, order() { return this; }, range(a, b) { offset = a; end = b; return this; }, async maybeSingle() {
      lookups++; assert.equal(filters.is_public, true);
      return { data: published && (!filters.handle || filters.handle === "player") ? profile : null, error: null };
    }, then(resolve) { calls.push({ table, filters, offset }); return Promise.resolve({ data: table === "ratings" ? ratings.slice(offset, end + 1) : [], error: null }).then(resolve); } };
    return query;
  } };
  const { getPublicPortfolio } = load("../src/lib/public-portfolio.ts", {
    "server-only": {}, "react": { cache: (fn) => fn },
    "@/lib/supabase/public": { createPublicClient: () => client },
    "@/lib/portfolio": { getCatalog: async () => [], portfolioGames: (_rows, entries) => entries },
    "@/lib/profile-settings": { publicProfilePath },
  });
  const portfolio = await getPublicPortfolio("player");
  assert.equal(portfolio.games.length, 501);
  assert.equal(portfolio.games[0].score, 0);
  assert.equal(portfolio.access.canEdit, false);
  assert.equal(portfolio.access.canImportCatalog, false);
  assert.equal(portfolio.profile.isPublic, true);
  assert.deepEqual(calls.filter((call) => call.table === "ratings").map((call) => call.offset), [0, 500]);
  assert.ok(calls.every((call) => call.filters.profile_id === 5));
  assert.equal(lookups, 2);
  published = false;
  assert.equal(await getPublicPortfolio("player"), null);
  assert.equal(await getPublicPortfolio("unknown"), null);
  assert.equal(await getPublicPortfolio("../../login"), null);
});
