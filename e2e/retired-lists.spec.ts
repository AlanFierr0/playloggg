import { test, expect } from "./test";
// @ts-expect-error Test-only fixture exports a fake session.
import { authCookie } from "./fixture-server.mjs";

test("lists have no visible entry points and saved list pages are unavailable", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  for (const path of ["/profile", "/tiers", "/search?q=&from=/profile", "/log?game=hades", "/game/hades", "/u/fixture_public", "/"]) {
    await page.goto(path);
    await expect(page.locator('a[href="/lists"], a[href*="/lists/"]')).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Curated Lists/ })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Popular lists", exact: true })).toHaveCount(0);
  }
  for (const path of ["/lists", "/lists/10", "/u/fixture_public/lists", "/u/fixture_public/lists/10"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "This page isn’t available.", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Public fixture list", exact: true })).toHaveCount(0);
  }
});
