import { test, expect } from "./test";
// @ts-expect-error Isolated local fixture identity.
import { authCookie } from "./fixture-server.mjs";

function destination(href: string) {
  return new URL(href, "http://127.0.0.1:3100").searchParams.get("next");
}

test("guest header and catalog sign-in preserve filters through email authentication", async ({ page }) => {
  const origin = "/games?q=Hades&genre=Roguelike&sort=score-desc&size=50";
  await page.goto(origin);
  const signIn = page.locator("header").getByRole("link", { name: "Sign in", exact: true });
  await expect(signIn).toBeVisible();
  expect(destination((await signIn.getAttribute("href"))!)).toBe(origin);
  await signIn.focus();
  await expect(signIn).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const catalog = page.getByRole("link", { name: "Sign in to search more games and import a game.", exact: true });
  expect(destination((await catalog.getAttribute("href"))!)).toBe(origin);
  await catalog.click();
  await expect(page).toHaveURL(/\/login\?next=/);
  for (const input of await page.locator('input[name="next"]').all()) await expect(input).toHaveValue(origin);
  await page.getByLabel("Email", { exact: true }).fill("owner@fixture.test");
  await page.getByLabel("Password", { exact: true }).fill("fixture-password-123");
  await page.getByRole("button", { name: "Sign in with email", exact: true }).click();
  await expect(page).toHaveURL(origin);
  await expect(page.locator("header").getByRole("link", { name: "Your profile", exact: true })).toBeVisible();
});

test("protected pages and review voting retain their actual destination", async ({ page }) => {
  for (const origin of ["/tiers", "/profile/ranking", "/profile/reviews", "/profile/stats", "/profile/timeline", "/profile/favorites", "/profile/social", "/settings", "/profile/import/steam", "/profile"]) {
    await page.goto(origin);
    await expect(page).toHaveURL(/\/login\?next=/);
    expect(destination(page.url())).toBe(origin);
    await expect(page.locator('form[action="/auth/steam"] input[name="next"]')).toHaveValue(origin);
  }
  const origin = "/u/fixture_public/reviews?page=1";
  await page.goto(origin);
  const vote = page.getByRole("link", { name: "Sign in to vote on reviews.", exact: true }).first();
  expect(destination((await vote.getAttribute("href"))!)).toBe(origin);
  await vote.click();
  await expect(page).toHaveURL(/\/login\?next=/);
  expect(destination(page.url())).toBe(origin);
});

test("guest sign-in remains accessible in Spanish and light mode", async ({ page, context }) => {
  await context.addCookies([
    { name: "playlogg_locale", value: "es-AR", url: "http://127.0.0.1:3100" },
    { name: "playlogg_theme", value: "light", url: "http://127.0.0.1:3100" },
  ]);
  await page.goto("/compare?left=fixture_public&right=fixture_peer");
  const link = page.locator("header").getByRole("link", { name: "Iniciar sesión", exact: true });
  await expect(link).toBeVisible();
  expect(destination((await link.getAttribute("href"))!)).toBe("/compare?left=fixture_public&right=fixture_peer");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("profile statistics use neutral tracking and accommodate large hour totals", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto("/profile");
  const stat = page.locator("header dl dd").last();
  await expect(stat).toHaveCSS("letter-spacing", "normal");
  await stat.locator("span").first().evaluate(element => { element.textContent = "11,590.81"; });
  const bounds = await stat.locator("span").first().boundingBox();
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
});
