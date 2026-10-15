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
    await page.getByRole("button", { name: "Publish profile" }).click();
    await expect(page.getByText("Your profile is now public.")).toBeVisible();
    expect((await visitor.goto("http://127.0.0.1:3100/u/fixture_owner"))?.status()).toBe(200);
    await expect(visitor.getByText("I love RPGs. Mi nombre no se traduce.", { exact: true })).toBeVisible();
    await expect(visitor.getByRole("heading", { name: "Featured favorites" })).toBeVisible();
    await visitor.getByRole("link", { name: "All favorites", exact: true }).click();
    await expect(visitor.getByRole("heading", { name: "Hades", exact: true })).toBeVisible();
    await expect(visitor.getByRole("button", { name: "Remove favorite" })).toHaveCount(0);
    await expect(visitor.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await page.getByRole("button", { name: "Make profile private" }).click();
    await expect(page.getByText("Your profile is now private.")).toBeVisible();
    expect((await visitor.reload())?.status()).toBe(404);
  } finally { await guest.close(); }
  state = await (await request.get("http://127.0.0.1:3101/__state")).json();
  expect(state.ratings.find((r: { profile_id: number; game_id: number }) => r.profile_id === 2 && r.game_id === 2)).toMatchObject({ score: 80, tier: "B", status: "playing" });
});

test("public profile sections use real zero scores, review text and independent favorites", async ({ page, context }, testInfo) => {
  await page.goto("/u/fixture_public");
  await expect(page.getByRole("heading", { name: "Published Fixture", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Featured favorites" })).toBeVisible();
  await page.screenshot({ path: `e2e-artifacts/public-profile-redesign-${testInfo.project.name}.png`, fullPage: true });
  const viewedProfile = page.getByRole("link", { name: "Viewing profile Published Fixture", exact: true });
  await expect(viewedProfile).toHaveCount(0);
  const navigation = page.getByRole("navigation", { name: "Profile sections" });
  for (const [name, suffix] of [["Ranking", "ranking"], ["Reviews", "reviews"], ["Stats", "stats"], ["Tier List", "tiers"]]) {
    await navigation.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/u/fixture_public/${suffix}$`));
    await expect(viewedProfile).toBeVisible();
    await expect(viewedProfile).toContainText("@fixture_public");
    await expect(viewedProfile).toHaveAttribute("href", "/u/fixture_public");
    const identityBox = (await viewedProfile.boundingBox())!;
    const tabsBox = (await navigation.boundingBox())!;
    expect(tabsBox.y + tabsBox.height).toBeLessThan(identityBox.y);
    expect(identityBox.x + identityBox.width).toBeCloseTo(tabsBox.x + tabsBox.width, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
  await navigation.getByRole("link", { name: "Overview", exact: true }).click();
  await expect(viewedProfile).toHaveCount(0);
  await navigation.getByRole("link", { name: "Ranking", exact: true }).click();
  await expect(viewedProfile).toBeVisible();
  await context.addCookies([authCookie]);
  await page.reload();
  await expect(viewedProfile).toContainText("Published Fixture");
  await expect(viewedProfile).not.toContainText("Fixture Owner");
  await page.screenshot({ path: `e2e-artifacts/viewed-profile-${testInfo.project.name}.png` });
  await navigation.getByRole("link", { name: "Stats", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Rating distribution" })).toBeVisible();
  await expect(page.getByText("1 (4.2%)", { exact: true })).toBeVisible();
  const distributionBox = (await page.getByRole("heading", { name: "Rating distribution", exact: true }).locator("..").boundingBox())!;
  const statsTabsBox = (await navigation.boundingBox())!;
  expect(distributionBox.x).toBeCloseTo(statsTabsBox.x, 0);
  expect(distributionBox.width).toBeCloseTo(statsTabsBox.width, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `e2e-artifacts/public-stats-layout-${testInfo.project.name}.png`, fullPage: true });
  await navigation.getByRole("link", { name: "Reviews", exact: true }).click();
  await expect(page.getByText("Public fixture review", { exact: true })).toBeVisible();
});


test("profile total hours includes unscored games and updates after saving playtime",async({page,context},info)=>{
 await context.addCookies([authCookie]);await page.goto("/profile");
 const stat=page.locator("dl > div").filter({has:page.locator("dt").filter({hasText:/^Total hours played$/})});
 await expect(stat.locator("dd > span").first()).toHaveText("—");
 for(const [slug,hours,total] of [["hades","12.5","12.5"],["elden-ring-shadow-of-the-erdtree","3.25","15.75"]]){
  await page.goto(`/log?game=${slug}`);await page.getByLabel("Hours played",{exact:true}).fill(hours);
  await page.locator("#commit-rating").click();await expect(page).toHaveURL(/\/profile$/);
  await expect(stat.locator("dd > span").first()).toHaveText(total);
 }
 await page.reload();await expect(stat.locator("dd > span").first()).toHaveText("15.75");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator("header dl").screenshot({path:`e2e-artifacts/profile-hours-${info.project.name}.png`});
 await page.goto("/u/fixture_public");await expect(stat.locator("dd > span").first()).toHaveText("0");
});
