import { test } from "node:test";
import assert from "node:assert/strict";
import { verifySteam, steamLoginUrl, steamSite, profileNames, steamEndpoint } from "../src/lib/steam-openid.ts";
const site = "https://playloggg.vercel.app", state = "a".repeat(64), id = "76561198000000001";
function assertion() {
  return new URLSearchParams({ state, "openid.ns": "http://specs.openid.net/auth/2.0", "openid.mode": "id_res", "openid.op_endpoint": steamEndpoint, "openid.return_to": `${site}/auth/steam/callback?state=${state}`, "openid.claimed_id": `https://steamcommunity.com/openid/id/${id}`, "openid.identity": `https://steamcommunity.com/openid/id/${id}`, "openid.response_nonce": `${new Date().toISOString().replace(/\.\d{3}Z/, "Z")}random`, "openid.assoc_handle": "association", "openid.signed": "op_endpoint,claimed_id,identity,return_to,response_nonce,assoc_handle", "openid.sig": "signature" });
}
test("Steam assertions require matching state, signed identity, exact endpoint/return URL and fresh nonce before network access", async () => {
  let calls = 0;
  const send = async () => { calls++; return new Response("is_valid:true\n"); };
  assert.equal(await verifySteam(assertion(), undefined, site, send), null);
  assert.equal(await verifySteam(assertion(), "b".repeat(64), site, send), null);
  for (const [key, value] of [["openid.mode", "cancel"], ["openid.op_endpoint", "https://evil.test"], ["openid.return_to", "https://evil.test"], ["openid.identity", `https://steamcommunity.com/openid/id/76561198000000002`], ["openid.signed", "identity"], ["openid.response_nonce", "2020-01-01T00:00:00Zold"], ["openid.claimed_id", `https://evil.test/openid/id/${id}`]]) {
    const p = assertion(); p.set(key, value); assert.equal(await verifySteam(p, state, site, send), null);
  }
  const duplicate = assertion(); duplicate.append("openid.sig", "another");
  assert.equal(await verifySteam(duplicate, state, site, send), null);
  assert.equal(calls, 0);
});
test("positive assertions are verified directly with Steam; invalid/error/redirect responses never grant identity", async () => {
  assert.equal(await verifySteam(assertion(), state, site, async (url, init) => {
    assert.equal(url, steamEndpoint); assert.equal(init.method, "POST"); assert.equal(init.redirect, "error");
    assert.equal(init.body.get("openid.mode"), "check_authentication"); assert.equal(init.body.has("state"), false);
    return new Response("ns:http://specs.openid.net/auth/2.0\nis_valid:true\n");
  }), id);
  for (const text of ["is_valid:false", "not_is_valid:true", "is_valid:true\nis_valid:false", "is_valid:true-extra"]) assert.equal(await verifySteam(assertion(), state, site, async () => new Response(text)), null);
  assert.equal(await verifySteam(assertion(), state, site, async () => new Response("is_valid:true", { status: 500 })), null);
  await assert.rejects(verifySteam(assertion(), state, site, async () => { throw new Error("Network error"); }));
});
test("login URLs use configured origin, not browser input; onboarding whitelists names", () => {
  assert.equal(steamSite(site), site); assert.throws(() => steamSite("http://evil.test")); assert.throws(() => steamSite("https://user:pass@evil.test"));
  const url = new URL(steamLoginUrl(site, state)); assert.equal(url.origin, "https://steamcommunity.com"); assert.equal(url.searchParams.get("openid.return_to"), `${site}/auth/steam/callback?state=${state}`);
  assert.deepEqual(profileNames({ handle: " Player_1 ", displayName: " Player One ", owner_user_id: "forged", is_public: true }), { handle: "player_1", display_name: "Player One" });
  for (const handle of ["a", "../owner", "player name", "a".repeat(31)]) assert.equal(profileNames({ handle, displayName: "Name" }), null);
  assert.equal(profileNames({ handle: "player", displayName: "\n" }), null);
});
