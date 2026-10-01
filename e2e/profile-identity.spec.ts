import { test, expect } from "./test";
// @ts-expect-error Test-only fixture exports a fake session.
import { authCookie } from "./fixture-server.mjs";

test("owner favorites stay independent, feature atomically, persist and follow publication", async ({ page, context, browser, request }) => {
  await context.addCookies([authCookie]);
  await page.goto("/profile/favorites");
  await page.getByRole("button", { name: "Browse catalog", exact: true }).click();
  await page.getByLabel("Search games", { exact: true }).fill("Hades");
  const hades = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Hades", exact: true }) });
  await hades.getByRole("button", { name: "Add favorite", exact: true }).click();
  await expect(hades.getByRole("button", { name: "Remove favorite" })).toBeVisible();
  await hades.getByRole("combobox", { name: "Featured position" }).selectOption("1");
  await hades.getByRole("button", { name: "Save position" }).click();
  await expect(hades.getByText("Featured position #1", { exact: true })).toBeVisible();
  let state = await (await request.get("http://127.0.0.1:3101/__state")).json();
  expect(state.ratings.filter((r: { profile_id: number; game_id: number }) => r.profile_id === 2 && r.game_id === 1)).toEqual([]);
  await page.getByLabel("Search games", { exact: true }).fill("Elden Ring");
  const elden = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Elden Ring: Shadow of the Erdtree", exact: true }) });
  await elden.getByRole("button", { name: "Add favorite", exact: true }).click();
  await elden.getByRole("combobox", { name: "Featured position" }).selectOption("1");
  await elden.getByRole("button", { name: "Save position" }).click();
  await page.getByRole("button", { name: "Your favorites", exact: true }).click();
  await page.getByLabel("Search games", { exact: true }).fill("");
  await expect(hades.getByRole("combobox")).toHaveValue("");
  await expect(elden.getByText("Featured position #1", { exact: true })).toBeVisible();
  await page.reload();
  await expect(elden.getByText("Featured position #1", { exact: true })).toBeVisible();
  await request.post("http://127.0.0.1:3101/__fail-save");
  await hades.getByRole("button", { name: "Remove favorite" }).click();
  await expect(hades.getByRole("status")).toHaveText("Your favorites could not be saved. Please retry.");
  await expect(hades.getByRole("button", { name: "Remove favorite" })).toBeVisible();
  await page.goto("/settings");
  await page.getByLabel("Bio", { exact: true }).fill("I love RPGs. Mi nombre no se traduce.");
  await page.getByLabel("Location", { exact: true }).fill("Buenos Aires");
  await page.getByLabel("Platform preference", { exact: true }).fill("PC / Steam");
  await page.getByRole("button", { name: "Save profile details" }).click();
  await expect(page.getByText("Profile details saved.", { exact: true })).toBeVisible();
  const guest = await browser.newContext();
  try {
    const visitor = await guest.newPage();
    expect((await visitor.goto("http://127.0.0.1:3100/u/fixture_owner/favorites"))?.status()).toBe(404);
    await page.getByRole("button", { name: "Publish profile and lists" }).click();
    await expect(page.getByText("Your profile and curated lists are now public.")).toBeVisible();
    expect((await visitor.goto("http://127.0.0.1:3100/u/fixture_owner"))?.status()).toBe(200);
    await expect(visitor.getByText("I love RPGs. Mi nombre no se traduce.", { exact: true })).toBeVisible();
    await expect(visitor.getByRole("heading", { name: "Featured favorites" })).toBeVisible();
    await visitor.getByRole("link", { name: "All favorites", exact: true }).click();
    await expect(visitor.getByRole("heading", { name: "Hades", exact: true })).toBeVisible();
    await expect(visitor.getByRole("button", { name: "Remove favorite" })).toHaveCount(0);
    await expect(visitor.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await page.getByRole("button", { name: "Make profile private" }).click();
    await expect(page.getByText("Your profile and curated lists are now private.")).toBeVisible();
    expect((await visitor.reload())?.status()).toBe(404);
  } finally { await guest.close(); }
  state = await (await request.get("http://127.0.0.1:3101/__state")).json();
  expect(state.ratings.find((r: { profile_id: number; game_id: number }) => r.profile_id === 2 && r.game_id === 2)).toMatchObject({ score: 80, tier: "B", status: "playing" });
});

test("public profile sections use real zero scores, review text and independent favorites", async ({ page }) => {
  await page.goto("/u/fixture_public");
  await expect(page.getByRole("heading", { name: "Published Fixture", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Featured favorites" })).toBeVisible();
  const navigation = page.getByRole("navigation", { name: "Profile sections" });
  for (const [name, suffix] of [["Ranking", "ranking"], ["Reviews", "reviews"], ["Stats", "stats"], ["Tier List", "tiers"], ["Lists", "lists"]]) {
    await navigation.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/u/fixture_public/${suffix}$`));
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
  await navigation.getByRole("link", { name: "Stats", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Rating distribution" })).toBeVisible();
  await expect(page.getByText("1 (4.2%)", { exact: true })).toBeVisible();
  await navigation.getByRole("link", { name: "Reviews", exact: true }).click();
  await expect(page.getByText("Public fixture review", { exact: true })).toBeVisible();
});
