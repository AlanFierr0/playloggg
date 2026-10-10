import { test, expect } from "./test";
// @ts-expect-error Local fixture identity only.
import { authCookie } from "./fixture-server.mjs";

test("search opens and keeps typed input while ratings are still loading", async ({ page, context, request }) => {
  await context.addCookies([authCookie]);
  await page.goto("/login");
  await request.get("http://127.0.0.1:3101/__reset-request-counts");
  await request.post("http://127.0.0.1:3101/__slow-ratings");
  await page.getByRole("link", { name: "Open game search" }).filter({ visible: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("textbox")).toBeVisible({ timeout: 2000 });
  await expect(dialog.getByRole("status")).toHaveText("Loading…");
  await dialog.getByRole("textbox").fill("Elden");
  await expect(dialog.locator('[data-search-result][href="/game/elden-ring-shadow-of-the-erdtree"]')).toBeVisible();
  await expect(dialog.getByRole("textbox")).toHaveValue("Elden");
  await expect(dialog).toContainText("80");
  const state = await (await request.get("http://127.0.0.1:3101/__state")).json();
  expect(state.requestCounts["GET /rest/v1/profile_favorites"] ?? 0).toBe(0);
  expect(state.requestCounts["GET /rest/v1/profile_rankings"] ?? 0).toBe(0);
});


test("search starts with a small batch and still finds games outside it", async ({page, request}) => {
  const initial = await request.get("/api/games/search?q=");
  expect(initial.ok()).toBeTruthy();
  const batch = await initial.json();
  expect(batch.games).toHaveLength(24);
  expect(batch.hasMore).toBe(true);
  expect(batch.games.every((game: {review: string | null; screenshots: string[]}) => game.review === null && game.screenshots.length === 0)).toBe(true);
  await page.goto("/search?q=");
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator('[data-search-result][href^="/game/"]')).toHaveCount(24);
  await dialog.getByRole("button", {name: "Load more", exact: true}).click();
  await expect(dialog.locator('[data-search-result][href^="/game/"]')).toHaveCount(48);
  await dialog.getByRole("textbox").fill("Fixture Game 119");
  await expect(dialog.locator('[data-search-result][href="/game/fixture-game-119"]')).toBeVisible();
  await expect(dialog.locator('[data-search-result][href^="/game/"]')).toHaveCount(1);
  await dialog.getByRole("textbox").fill("Adventure");
  await expect(dialog.locator('[data-search-result][href^="/game/"]')).toHaveCount(24);
  await dialog.getByRole("textbox").fill("");
  await expect(dialog.locator('[data-search-result][href^="/game/"]')).toHaveCount(24);
  await expect(dialog.locator('[data-search-result][href="/game/hades"]')).toBeVisible();
  await dialog.getByRole("button", {name: "Load more", exact: true}).click();
  await expect(dialog.locator('[data-search-result][href^="/game/"]')).toHaveCount(48);
  let fail = true;
  await page.route("**/api/games/search?q=Fixture%20Game%20118&offset=0", async route => {
    if (fail) {fail = false; await route.abort("failed");}
    else await route.continue();
  });
  await dialog.getByRole("textbox").fill("Fixture Game 118");
  await expect(dialog.getByText("Game search could not be loaded.", {exact: true})).toBeVisible();
  await dialog.getByRole("button", {name: "Retry search", exact: true}).click();
  await expect(dialog.locator('[data-search-result][href="/game/fixture-game-118"]')).toBeVisible();
  expect((await request.get("/api/games/search?offset=-1")).status()).toBe(400);
});
