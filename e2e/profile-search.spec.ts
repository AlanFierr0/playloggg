import { test, expect } from "./test";
// @ts-expect-error Local fixture identity only.
import { authCookie } from "./fixture-server.mjs";

test("global search finds public profiles live and opens the matching account", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto("/search?q=Published");
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: /^Profiles/ }).click();
  await expect(dialog.locator('[data-search-result][href="/u/fixture_public"]')).toBeVisible();
  await expect(dialog.locator('[data-search-result][href="/u/fixture_peer"]')).toBeVisible();
  await expect(dialog).not.toContainText("80.0 avg score");
  const input = dialog.getByRole("textbox");
  await input.fill("fixture_owner");
  await expect(dialog.getByText("No profiles match this search.", { exact: true })).toBeVisible();
  await input.fill("@FIXTURE_PEER");
  const peer = dialog.locator('[data-search-result][href="/u/fixture_peer"]');
  await expect(peer).toBeVisible();
  await expect(dialog.locator('[data-search-result][href="/u/fixture_public"]')).toHaveCount(0);
  await peer.click();
  await expect(page).toHaveURL(/\/u\/fixture_peer$/);
  await expect(page.getByRole("heading", { name: "Published Peer", exact: true })).toBeVisible();
  await context.clearCookies();
  await page.goto("/search?q=fixture_peer");
  await page.getByRole("button", { name: /^Profiles/ }).click();
  await expect(peer).toBeVisible();
});
