import { test, expect } from "./test";
import AxeBuilder from "@axe-core/playwright";
async function openNavigation(page: import("@playwright/test").Page) {
  const menu = page.getByRole("button", { name: /Navigation menu|Menú de navegación/ });
  if (await menu.isVisible() && await page.locator("header details").getAttribute("open") === null) await menu.click();
}
// @ts-expect-error Local fixture identity only.
import { authCookie } from "./fixture-server.mjs";

test("find a friend, follow persistently and compare saved games with your own profile first", async ({ page, context }, testInfo) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  await page.getByRole("slider", { name: "Numerical score from 0 to 100" }).focus();
  await page.getByRole("slider").press("End");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await openNavigation(page);
  await page.getByRole("navigation", { name: "Main navigation" }).filter({ visible: true }).getByRole("link", { name: "Profiles", exact: true }).click();
  await page.getByLabel("Find profiles", { exact: true }).fill("@FIXTURE_PUBLIC");
  await expect(page).toHaveURL(/q=%40FIXTURE_PUBLIC/);
  await expect(page.getByLabel("Find profiles", { exact: true })).toBeFocused();
  const friend = page.getByRole("article").filter({ hasText: "Published Fixture" });
  await expect(friend).toHaveCount(1);
  await friend.getByRole("button", { name: "Follow", exact: true }).click();
  await expect(friend.getByRole("button", { name: "Unfollow", exact: true })).toBeVisible();
  await page.reload();
  await expect(friend.getByRole("button", { name: "Unfollow", exact: true })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `e2e-artifacts/friends-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole("navigation", { name: "Profile navigation" }).getByRole("link", { name: "Following", exact: true }).click();
  await expect(page.getByRole("link", { name: "Compare games Published Fixture", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Compare games Published Fixture", exact: true }).click();
  await expect(page.getByLabel("First profile handle")).toHaveValue("fixture_owner");
  await expect(page.getByLabel("First profile handle")).toBeEditable();
  await expect(page.getByLabel("Second profile handle")).toHaveValue("fixture_public");
  await expect(page.getByRole("table")).toContainText("Hades");
  await expect(page.getByRole("table")).toContainText("Score: 100");
  await expect(page.getByRole("table")).toContainText("Score: 0");
  await page.goto("/compare");
  await page.getByRole("region",{name:"Choose profiles",exact:true}).getByRole("link",{name:"Published Fixture",exact:true}).click();
  await expect(page.getByLabel("First profile handle")).toHaveValue("fixture_owner");
  await expect(page.getByLabel("Second profile handle")).toHaveValue("fixture_public");
  await expect(page.getByRole("table")).toContainText("Hades");

  await page.goto("/profile/social");
  await page.getByRole("button", { name: "Unfollow", exact: true }).click();
  await expect(page.getByRole("link", { name: "Compare games Published Fixture", exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("You are not following anyone yet. Find a friend to get started.")).toBeVisible();
});

test("friend search finds public link-only profiles, keeps private profiles hidden and omits blocking controls", async ({ page, context }) => {
  await page.goto("/people?q=fixture_owner");
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Follow", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Sign in to follow profiles", exact: true })).toBeVisible();
  await page.goto("/people?q=fixture_peer");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("Published Peer");
  await context.addCookies([authCookie]);
  await page.goto("/people?q=Published");
  await expect(page.getByRole("article")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Block", exact: true })).toHaveCount(0);
  await page.goto("/profile/social");
  await expect(page.getByRole("link", { name: "Compare games Published Fixture", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Blocked profiles", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Unblock", exact: true })).toHaveCount(0);
  await context.addCookies([{ name: "playlogg_locale", value: "es-AR", url: "http://127.0.0.1:3100" }]);
  await page.goto("/people?q=fixture_public");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Seguir", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Comparar juegos Published Fixture", exact: true })).toBeVisible();
});

test("live friend search uses the latest text, clears and reloads without exposing private profiles", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto("/people?page=2");
  const search = page.getByLabel("Find profiles", { exact: true });
  await search.fill("no match");
  await expect(page.getByText("No profiles match this search.", { exact: true })).toBeVisible();
  await search.fill("fixture_owner");
  await search.fill("fixture_peer");
  await expect(page).toHaveURL(/\/people\?q=fixture_peer$/);
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("Published Peer");
  await expect(page.getByRole("button", { name: "Follow", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Compare games Published Peer", exact: true })).toBeVisible();
  await expect(search).toBeFocused();
  await page.reload();await expect(search).toHaveValue("fixture_peer");
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(page).toHaveURL(/\/people\?q=$/);
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("Published Fixture");
  await search.fill("fixture_owner");
  await expect(page).toHaveURL(/q=fixture_owner/);
  await expect(page.getByRole("article")).toHaveCount(0);
});
