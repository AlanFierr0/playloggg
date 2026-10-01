import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
function load(file, imports, globals = {}) {
  const compiledModule = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { module: compiledModule, exports: compiledModule.exports, require: (id) => imports[id] ?? {}, ...globals });
  return compiledModule.exports;
}
const { readProfileRatings } = load("../src/lib/profile-ratings.ts", {});
function client(rows, failAt = -1) {
  const requests = [];
  return { requests, from(table) { assert.equal(table, "ratings"); return {
    select(fields) { assert.ok(fields.includes("score")); return this; },
    eq(field, value) { assert.equal(field, "profile_id"); assert.equal(value, 7); return this; },
    order(field) { assert.equal(field, "game_id"); return this; },
    range(start, end) { requests.push([start, end]); return { data: start === failAt ? null : rows.slice(start, end + 1), error: start === failAt ? { message: "Failed page" } : null }; },
  }; } };
}
for (const count of [0, 500, 1001, 1501]) test(`selected profile loads all ${count} ratings with stable 500-row pages`, async () => {
  const rows = Array.from({ length: count }, (_, i) => ({ game_id: i + 1, score: i === count - 1 ? 0 : null, tier: null, review: "Owned review", status: "backlog", platform: null, hours_played: 0, completed_on: null, tags: [] }));
  const db = client(rows);
  const result = await readProfileRatings(db, 7);
  assert.equal(result.length, count);
  assert.equal(new Set(result.map((row) => row.game_id)).size, count);
  if (count) { assert.equal(result.at(-1).score, 0); assert.equal(result.at(-1).hours_played, 0); }
  assert.equal(db.requests.length, Math.floor(count / 500) + 1);
});
test("a failed later rating page fails the read rather than returning a partial portfolio", async () => {
  const db = client(Array.from({ length: 1001 }, (_, i) => ({ game_id: i + 1 })), 500);
  await assert.rejects(readProfileRatings(db, 7), /ratings could not be loaded/);
});
test("published sample ratings above 1000 retain the sample filter on every page", async () => {
  const calls = [];
  const rows = Array.from({ length: 1001 }, (_, i) => ({ id: i + 1, slug: `game-${i}`, title: `Game ${i}`, cover_url: "/icon.svg", release_year: 2020, released_on: null, genres: [], artwork_image_ids: [], screenshot_image_ids: [], search_keywords: "", is_sample: true, igdb_metadata: {}, igdb_url: null }));
  const ratings = rows.map((row) => ({ game_id: row.id, score: row.id === 1001 ? 0 : null, tier: null, review: null, status: "backlog", platform: null, hours_played: 0, completed_on: null, tags: [] }));
  const { getPortfolio } = load("../src/lib/portfolio.ts", { react: { cache: (fn) => fn }, "@/lib/owner": { getAccount: async () => null }, "@/lib/collections": { getLists: async () => [] } }, {
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: "https://fixture.invalid", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "local-test" } }, AbortSignal,
    fetch: async (input) => {
      const url = new URL(input); const offset = Number(url.searchParams.get("offset") ?? 0); const limit = Number(url.searchParams.get("limit") ?? 500);
      let data;
      if (url.pathname.endsWith("/profiles")) data = [{ id: 7, handle: "alexvance", display_name: "Sample", is_sample: true, is_public: true }];
      else if (url.pathname.endsWith("/ratings")) { assert.equal(url.searchParams.get("profiles.handle"), "eq.alexvance"); assert.equal(url.searchParams.get("order"), "game_id.asc"); calls.push(offset); data = ratings.slice(offset, offset + limit); }
      else data = rows.slice(offset, offset + limit);
      return { ok: true, json: async () => data };
    },
  });
  const portfolio = await getPortfolio();
  assert.equal(portfolio.games.filter((game) => game.logged).length, 1001);
  assert.equal(portfolio.games.find((game) => game.slug === "game-1000").score, 0);
  assert.deepEqual(calls, [0, 500, 1000]);
});
