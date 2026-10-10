import { test, expect } from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Isolated local test identity.
import { authCookie } from "./fixture-server.mjs";

test("Log starts with game selection and opens options only after a choice", async ({ page, context }, testInfo) => {
  await context.addCookies([authCookie]);
  await page.goto("/profile");
  await page.getByRole("link", { name: "Log a game", exact: true }).click();
  await expect(page).toHaveURL(/\/log$/);
  await expect(page.getByRole("heading", { name: "Choose a game", exact: true })).toBeVisible();
  await expect(page.locator("#score-slider")).toHaveCount(0);
  await expect(page.getByText("Quick Commands", { exact: true })).toHaveCount(0);
  const search = page.getByRole("textbox", { name: "Search titles and profiles" });
  await expect(search).toHaveValue("");
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]);
  await page.screenshot({ path: `e2e-artifacts/log-picker-${testInfo.project.name}.png`, fullPage: true });
  await search.fill("Hades");
  await expect(page.locator('[data-search-result][href="/log?game=hades"]')).toBeVisible();
  await search.press("Enter");
  await expect(page).toHaveURL(/\/log\?game=hades$/);
  await expect(page.getByRole("heading", { name: "Hades", exact: true })).toBeVisible();
  await expect(page.locator("#score-slider")).toBeEnabled();
  await page.getByRole("link", { name: "Switch Game", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(page.getByRole("heading", { name: "Choose a game", exact: true })).toBeVisible();
  await search.fill("Elden Ring");
  await expect(page.getByText("Loading…", { exact: true })).toHaveCount(0);
  await expect(page.locator('[data-search-result][href="/log?game=elden-ring-shadow-of-the-erdtree"]')).toHaveCount(0);
  await search.fill("Fixture Game 00");
  await expect(page.locator('[data-search-result][href="/log?game=fixture-game-0"]')).toBeVisible();
  await search.press("Enter");
  await expect(page).toHaveURL(/\/log\?game=fixture-game-0$/);
  await expect(page.getByRole("heading", { name: "Fixture Game 00", exact: true })).toBeVisible();
});

test("game picker can be cancelled and guest selection keeps save unavailable", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto("/log");
  await page.getByRole("dialog").press("Escape");
  await expect(page).toHaveURL(/\/profile$/);
  await context.clearCookies();
  await page.goto("/log");
  await page.getByRole("dialog").press("Escape");
  await expect(page).toHaveURL("http://127.0.0.1:3100/");
  await page.goto("/log");
  const search=page.getByRole("textbox", { name: "Search titles and profiles" });
  await search.fill("Hades");
  await expect(page.locator('[data-search-result][href="/log?game=hades"]')).toBeVisible();
  await search.press("Enter");
  await expect(page.locator("#commit-rating")).toBeDisabled();
});


test("log search hides personal scores including zero but keeps unscored logs and normal search", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  await page.getByRole("button", { name: /Backlog$/ }).click();
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/search?q=Hades&mode=log");
  await expect(page.locator('[data-search-result][href="/log?game=hades"]')).toBeVisible();
  await page.goto("/log?game=hades");
  await page.locator("#score-display").fill("0");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/log");
  await expect(page.locator('[data-search-result][href="/log?game=fixture-game-0"]')).toBeVisible();
  await expect(page.locator('[data-search-result][href="/log?game=hades"], [data-search-result][href="/log?game=elden-ring-shadow-of-the-erdtree"]')).toHaveCount(0);
  const batch = await (await page.request.get("/api/games/search?mode=log")).json();
  expect(batch.games).toHaveLength(24);
  expect(batch.games.every((game: {score: number | null}) => game.score === null)).toBe(true);
  await page.getByRole("textbox", { name: "Search titles and profiles" }).fill("Hades");
  await expect.poll(async () => (await (await page.request.get("/api/games/search?q=Hades&mode=log")).json()).games.length).toBe(0);
  await page.waitForTimeout(1200);
  await expect(page.locator('[data-search-result]')).toHaveCount(0);
  await page.goto("/search?q=Hades");
  await expect(page.locator('[data-search-result][href="/game/hades"]')).toBeVisible();
});
