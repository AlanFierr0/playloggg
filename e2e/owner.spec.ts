import { test, expect } from "./test";
// @ts-expect-error This Node-only fixture file exports a plain cookie descriptor.
import { authCookie } from "./fixture-server.mjs";

test("authenticated unscored Backlog persists, failed saves retain the draft, and guests cannot edit", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  await expect(page.locator("#commit-rating")).toBeEnabled();
  await page.getByRole("button", { name: /Backlog$/ }).click();
  await page.locator("#hours-input").fill("0");
  await page.locator("#dispatch-textarea").fill("Fixture-only saved review");
  await page.locator("#commit-rating").click();
  await expect(page.getByText(/^Entry saved:/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: /Backlog$/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#score-display")).toHaveText("—");
  await expect(page.locator("#hours-input")).toHaveValue("0");
  await expect(page.locator("#dispatch-textarea")).toHaveValue("Fixture-only saved review");
  await page.getByRole("button", { name: "Add score", exact: true }).click();
  await fetch("http://127.0.0.1:3101/__fail-save", { method: "POST" });
  await page.locator("#dispatch-textarea").fill("Unsaved draft");
  await page.locator("#commit-rating").click();
  await expect(page.getByText(/Your rating could not be saved/)).toBeVisible();
  await expect(page.locator("#dispatch-textarea")).toHaveValue("Unsaved draft");
  await page.reload();
  await expect(page.locator("#dispatch-textarea")).toHaveValue("Fixture-only saved review");
  await page.getByRole("button", { name: "Add score", exact: true }).click();
  await page.getByRole("button", { name: "Choose tier, currently unassigned" }).click();
  await page.getByRole("menuitemradio", { name: "S Apex Masterpiece", exact: true }).click();
  await page.locator("#commit-rating").click();
  await expect(page.getByText(/^Entry saved:/)).toBeVisible();
  await page.reload();
  await expect(page.locator("#score-display")).toHaveText("0");
  await expect(page.getByRole("button", { name: "Choose tier, currently S" })).toBeVisible();
  const state = await (await fetch("http://127.0.0.1:3101/__state")).json();
  expect(state.ratings.filter((row: { profile_id: number }) => row.profile_id === 2 && "game_id" in row && row.game_id === 1)).toMatchObject([{ score: 0, tier: "S", status: "backlog", hours_played: 0 }]);
  await context.clearCookies();
  await page.goto("/log?game=hades");
  await expect(page.locator("#commit-rating")).toBeDisabled();
});

test("private and unknown nested profiles return 404; published entries and lists are readable", async ({ page }) => {
  for (const handle of ["fixture_owner", "missing_fixture"]) {
    for (const suffix of ["", "/game/hades", "/lists", "/lists/10", "/tiers"]) {
      const response = await page.goto(`/u/${handle}${suffix}`);
      expect(response?.status()).toBe(404);
      await expect(page.getByText("Fixture Owner", { exact: true })).toHaveCount(0);
      await expect(page.getByText("Private fixture review", { exact: true })).toHaveCount(0);
    }
  }
  await page.goto("/u/fixture_public/game/hades");
  await expect(page.getByText("Public fixture review", { exact: true })).toBeVisible();
  await page.goto("/u/fixture_public/lists/10");
  await expect(page.getByRole("heading", { name: "Public fixture list", exact: true })).toBeVisible();
  await expect(page.getByText("Fixture-only saved review", { exact: true })).toHaveCount(0);
});
