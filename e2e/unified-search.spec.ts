import { test, expect } from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Local fixture identity only.
import { authCookie } from "./fixture-server.mjs";

test("one search deduplicates stored games and hides stale or failed provider results", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto("/log");
  const dialog = page.getByRole("dialog");
  const search = page.getByRole("textbox", { name: "Search titles, profiles and commands" });
  await expect(dialog).not.toContainText(/IGDB|Saved catalog|Catalog entry/i);
  await search.fill("Hades");
  await expect(dialog.locator('[data-search-result][href="/log?game=hades"]')).toHaveCount(1);
  await expect(dialog.getByText("Searching games…", { exact: true })).toHaveCount(0);
  await page.waitForTimeout(1000);
  await expect(dialog.locator('[data-search-result][href="/log?game=hades"]')).toHaveCount(1);
  await expect(dialog.getByRole("button", { name: /^Import Hades/ })).toHaveCount(0);
  await search.fill("Slow");
  await expect(dialog.getByText("Searching games…", { exact: true })).toBeVisible();
  await search.fill("Hades");
  await page.waitForTimeout(1200);
  await expect(dialog.getByText("Stale Query Candidate")).toHaveCount(0);
  await search.fill("Unavailable");
  await expect(dialog.getByRole("button", { name: "Retry search", exact: true })).toBeVisible();
  await expect(dialog).not.toContainText(/IGDB/i);
  await search.fill("Hades");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/log\?game=hades$/);
});

test("a missing game imports from the same search and opens the chosen editor", async ({ page, context, request }, testInfo) => {
  const mobile = testInfo.project.name === "mobile";
  const title = mobile ? "Unified Mobile Adventure" : "Unified Fixture Adventure";
  const providerId = mobile ? 9003 : 9001;
  const slug = mobile ? "unified-mobile-adventure" : "unified-fixture-adventure";
  await context.addCookies([authCookie]);
  await page.goto("/log");
  await page.getByRole("textbox", { name: "Search titles, profiles and commands" }).fill(mobile ? "Unified Mobile" : "Unified");
  const dialog = page.getByRole("dialog");
  const importButton = dialog.getByRole("button", { name: `Import ${title} (2020)`, exact: true });
  await expect(importButton).toBeVisible();
  await expect(importButton).toHaveText("Import");
  await expect(dialog.getByRole("heading", { name: title, exact: true })).toHaveCount(1);
  await expect(dialog).not.toContainText(/IGDB|Find on|Saved catalog/i);
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.screenshot({ path: `e2e-artifacts/unified-search-${testInfo.project.name}.png`, fullPage: true });
  await importButton.click();
  await expect(page).toHaveURL(new RegExp(`/log\\?game=${slug}-igdb-${providerId}$`));
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  await expect(page.locator("#commit-rating")).toBeEnabled();
  const state = await (await request.get("http://127.0.0.1:3101/__state")).json();
  const imported = state.games.filter((game: { igdb_id: number }) => game.igdb_id === providerId);
  expect(imported).toHaveLength(1);
  await page.goto(`/search?q=${encodeURIComponent(title)}&mode=log`);
  await expect(page.locator(`[data-search-result][href="/log?game=${imported[0].slug}"]`)).toHaveCount(1);
  await page.waitForTimeout(1000);
  await expect(page.getByRole("button", { name: `Import ${title} (2020)`, exact: true })).toHaveCount(0);
  expect(state.ratings.filter((row: { game_id: number }) => row.game_id === imported[0].id)).toEqual([]);
});
