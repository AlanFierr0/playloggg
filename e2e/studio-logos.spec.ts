import { test, expect } from "./test";
// @ts-expect-error Local fixture identity only.
import { authCookie } from "./fixture-server.mjs";

test("studio logos appear beside names in summaries, stats and game details in both themes", async ({ page, context, request }, info) => {
  await request.get("http://127.0.0.1:3101/__studio-logos");
  for (const theme of ["dark", "light"]) {
    await context.addCookies([{ name: "playlogg_theme", value: theme, url: "http://127.0.0.1:3100" }]);
    await page.goto("/u/fixture_public");
    const studios = page.getByRole("heading", { name: "Top-rated studios", exact: true }).locator("..");
    const logo = studios.locator('img[src="/images/studios/valve.svg"]');
    await expect(logo).toBeVisible();
    await expect.poll(() => logo.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(logo).toHaveCSS("filter", theme === "dark" ? "invert(1)" : "none");
    await expect(studios.getByText("Valve", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await studios.screenshot({ path: `e2e-artifacts/studio-logos-${theme}-${info.project.name}.png` });
  }
  await page.goto("/u/fixture_public/stats");
  const studios = page.getByRole("heading", { name: "Studio statistics", exact: true }).locator("..");
  await studios.getByRole("button", { name: "Load more — Studio statistics", exact: true }).click();
  await expect(studios.locator('img[src="/images/studios/valve.svg"]')).toBeVisible();
  await page.goto("/game/studio-logo-fixture-0");
  await expect(page.locator('main img[src="/images/studios/valve.svg"]')).toHaveCount(2);
  await expect(page.getByText("Valve", { exact: true }).first()).toBeVisible();
  await context.addCookies([authCookie]);
  await page.goto("/log?game=studio-logo-fixture-0");
  await expect(page.locator('main img[src="/images/studios/valve.svg"]')).toBeVisible();
});
