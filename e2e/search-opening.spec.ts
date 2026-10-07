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
