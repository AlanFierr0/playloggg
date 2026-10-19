import { test } from "node:test";
import assert from "node:assert/strict";
import { loginHref, navigationPath, previousPage, restoreNavigation, visitPage } from "../src/lib/return-navigation.ts";

test("return navigation accepts only internal app pages and safe query state", () => {
  for (const value of ["https://evil.test", "//evil.test", "/\\evil.test", "/%2f%2fevil.test", "/auth/confirm?token_hash=secret", "/login", "/api/profile/export", "javascript:alert(1)", null]) assert.equal(navigationPath(value), null);
  assert.equal(navigationPath("/games?q=Hades&size=50&token=secret"), "/games?q=Hades&size=50");
  assert.equal(navigationPath("/profile/stats?code=secret"), "/profile/stats");
  assert.equal(navigationPath("/compare?left=one&right=two"), "/compare?left=one&right=two");
});

test("save skips the log picker and switched drafts, but returns to a game or browse search", () => {
  const log = "/log?game=hades", other = "/log?game=portal";
  assert.equal(previousPage(["/profile/stats", "/log", log, "/search?mode=log", other], other, "/profile"), "/profile/stats");
  assert.equal(previousPage(["/search?q=Hades", "/game/hades", log], log, "/profile"), "/game/hades");
  assert.equal(previousPage(["/search?q=Hades", log], log, "/profile"), "/search?q=Hades");
  assert.equal(previousPage([log, "/search?mode=log"], "/search?mode=log", "/"), log);
  assert.equal(previousPage([log], log, "/profile"), "/profile");
  assert.equal(previousPage([], log, "//evil.test"), "/");
});

test("back navigation truncates the trail rather than creating return loops", () => {
  const history = ["/profile/stats", "/game/hades", "/log?game=hades"];
  assert.deepEqual(visitPage(history, "/game/hades"), ["/profile/stats", "/game/hades"]);
  assert.equal(previousPage(visitPage(history, "/game/hades"), "/game/hades", "/games"), "/profile/stats");
  assert.deepEqual(visitPage(history, null), []);
  assert.equal(visitPage(Array.from({length: 50}, (_, index) => `/games?page=${index+1}`), "/settings").length, 50);
});

test("refresh restores this page's history; direct entries and corrupt storage use a fallback", () => {
  const history = ["/games?library=logged&size=50", "/log?game=hades"];
  assert.deepEqual(restoreNavigation(JSON.stringify(history), history[1]), history);
  for (const stored of [null, "broken", '{}', '["//evil.test","/log?game=hades"]', '["/login","/log?game=hades"]']) assert.deepEqual(restoreNavigation(stored, history[1]), [history[1]]);
  assert.deepEqual(restoreNavigation(JSON.stringify(history), "/settings"), ["/settings"]);
});

 test("sign-in destinations preserve allowed state without exposing tokens or accepting redirects", () => {
   const destination = "/games?q=Hades&genre=Adventure&sort=score-desc&size=50";
   assert.equal(new URL(loginHref(destination), "https://playlogg.test").searchParams.get("next"), destination);
   assert.equal(new URL(loginHref("/u/fixture_public/reviews?page=2&token=secret"), "https://playlogg.test").searchParams.get("next"), "/u/fixture_public/reviews?page=2");
   for (const path of ["//evil.test", "https://evil.test", "/auth/confirm?token_hash=secret", "/login?next=/login"]) assert.equal(loginHref(path), "/login?next=%2F");
 });
