import test from "node:test";
import assert from "node:assert/strict";
import { catalogQuery, igdbId, normalizeImport, normalizeMatch, searchBody } from "../src/lib/catalog-input.ts";
import { createIgdbHttp } from "../src/lib/igdb-http.ts";

test("bounded search and numeric IDs reject malformed/forged inputs", () => {
  assert.equal(catalogQuery("  Halo  "), "Halo");
  for (const input of [null, {}, "a", " ", "x".repeat(101), "halo\nfields *;"]) assert.equal(catalogQuery(input), null);
  for (const id of ["123", 0, -1, 1.5, NaN, Infinity, 2147483648, { id: 123 }]) assert.equal(igdbId(id), false);
  assert.equal(igdbId(123), true);
  const attack = 'Halo"; fields *; search "\\';
  assert.ok(searchBody(attack).startsWith(`search ${JSON.stringify(attack)}; fields id,name,`));
});

test("imports whitelist public metadata, use trusted image URLs and preserve no-release/no-cover", () => {
  const row = normalizeImport({ id: 123, name: "  Pok\u00e9mon  ", slug: "pokémon", cover: { image_id: "../../evil" }, first_release_date: 0,
    genres: [{ name: "RPG" }], platforms: [{ name: "PC" }], summary: "Real overview", url: "https://evil.test/", access_token: "never-store",
    involved_companies: [{ developer: true, company: { name: "Studio" } }], artworks: [{ image_id: "valid_1" }, { image_id: "https://evil.test" }] });
  assert.equal(row.slug, "pokemon-igdb-123");
  assert.equal(row.release_year, null);
  assert.equal(row.released_on, null);
  assert.equal(row.cover_url, "/images/missing-cover.svg");
  assert.equal(row.igdb_url, null);
  assert.deepEqual(row.artwork_image_ids, ["valid_1"]);
  assert.deepEqual(row.igdb_metadata.developers, ["Studio"]);
  assert.ok(!JSON.stringify(row).includes("never-store"));
  for (const column of ["is_sample", "created_at", "updated_at"]) assert.ok(!(column in row));
  assert.ok(!("score" in row));
});

test("matches identify editions/platforms, handle absent metadata and reject invalid records", () => {
  assert.equal(normalizeMatch({ id: 1 }), null);
  assert.equal(normalizeImport({ id: -1, name: "Forged" }), null);
  const game = normalizeMatch({ id: 7, name: "Halo: Remastered", first_release_date: 1609459200, game_type: { type: "Remaster" }, platforms: [{ name: "PC" }, { name: "PC" }], cover: { image_id: "co123" } });
  assert.equal(game.year, 2021);
  assert.equal(game.type, "Remaster");
  assert.deepEqual(game.platforms, ["PC"]);
  assert.equal(game.cover, "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co123.jpg");
  assert.notEqual(normalizeImport({ id: 1, name: "Same", slug: "same" }).slug, normalizeImport({ id: 2, name: "Same", slug: "same" }).slug);
});

const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
test("provider serializes concurrent searches, authenticates once and caches its token", async () => {
  let auth = 0, calls = 0, active = 0, maxActive = 0;
  const request = async (url, init) => {
    if (String(url).includes("oauth2/token")) { auth++; assert.ok(init.body instanceof URLSearchParams); return json({ access_token: "test-token", expires_in: 3600 }); }
    active++; maxActive = Math.max(maxActive, active); calls++;
    assert.equal(init.headers.Authorization, "Bearer test-token");
    await new Promise((resolve) => setTimeout(resolve, 5)); active--;
    return json([{ id: calls, name: "Halo" }]);
  };
  const query = createIgdbHttp("fixture-id", "fixture-secret", request);
  await Promise.all([query("first"), query("second"), query("third")]);
  assert.equal(auth, 1); assert.equal(calls, 3); assert.equal(maxActive, 1);
});

test("expired provider authentication is retried once with a new token", async () => {
  let auth = 0, games = 0;
  const query = createIgdbHttp("fixture", "fixture", async (url) => String(url).includes("oauth2/token") ? json({ access_token: `token-${++auth}`, expires_in: 3600 }) : ++games === 1 ? json({}, 401) : json([{ id: 1 }]));
  assert.deepEqual(await query("x"), [{ id: 1 }]);
  assert.equal(auth, 2); assert.equal(games, 2);
});

test("429 imposes cooldown; failed requests do not leak credentials/provider bodies", async () => {
  let calls = 0;
  const query = createIgdbHttp("secret-client", "secret-password", async (url) => {
    calls++;
    return String(url).includes("oauth2/token") ? json({ access_token: "secret-token", expires_in: 3600 }) : new Response("secret-provider-body", { status: 429, headers: { "retry-after": "60" } });
  });
  await assert.rejects(query("x"), /IGDB is busy/);
  const before = calls;
  await assert.rejects(query("y"), /IGDB is busy/);
  assert.equal(calls, before);
});

test("failed provider responses recover without poisoning the request queue", async () => {
  let games = 0;
  const query = createIgdbHttp("fixture", "fixture", async (url) => String(url).includes("oauth2/token") ? json({ access_token: "token", expires_in: 3600 }) : ++games === 1 ? json({ error: "private-provider-details" }) : json([]));
  await assert.rejects(query("x"), /invalid response/);
  assert.deepEqual(await query("y"), []);
});
