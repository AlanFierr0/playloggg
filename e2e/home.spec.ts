import { test, expect } from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Fixture-only session.
import { authCookie } from "./fixture-server.mjs";

test("home uses owned entries, qualifying genre ratings and working filters", async ({ page, context }, testInfo) => {
  await context.addCookies([authCookie]);
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Your taste", exact: true })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Explore your taste", exact: true })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Continue playing" })).toContainText("Elden Ring: Shadow of the Erdtree");
  await page.goto("/log?game=elden-ring-shadow-of-the-erdtree");
  await page.getByRole("button", { name: "PC", exact: true }).click();
  await page.locator("#hours-input").fill("0");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  for (const [slug, score] of [["fixture-game-0", "90"], ["fixture-game-1", "80"], ["fixture-game-2", "70"]]) {
    await page.goto(`/log?game=${slug}`);
    await page.locator("#score-display").fill(score);
    await page.getByRole("button", { name: "Choose tier, currently unassigned" }).click();
    await page.getByRole("menuitemradio", { name: "S God", exact: true }).click();
    await page.getByRole("button", { name: /Completed$/ }).click();
    await page.locator("#add-tag").click();
    await page.getByLabel("Tag label", { exact: true }).fill("Co-op & friends");
    await page.locator("#confirm-tag").click();
    await page.locator("#commit-rating").click();
    await expect(page).toHaveURL(/\/profile$/);
    if (slug === "fixture-game-1") {
      await page.goto("/");
      await expect(page.getByRole("region", { name: "Your taste", exact: true })).toHaveCount(0);
    }
  }
  await page.goto("/");
  const playing = page.getByRole("region", { name: "Continue playing" });
  await expect(playing).toContainText("PC / Steam");
  await expect(playing).toContainText("0 hrs");
  const recent = page.getByRole("region", { name: "Recently updated" });
  await expect(recent.locator("article")).toHaveCount(3);
  await expect(recent).toContainText("90 / 100");
  await expect(recent).toContainText("S · God");
  await expect(recent).toContainText("Completed");
  await expect(recent).not.toContainText("Elden Ring");
  const taste = page.getByRole("region", { name: "Your taste", exact: true });
  await expect(taste).toContainText("80 / 100");
  await expect(taste).toContainText("3 Games rated");
  await expect(taste.getByRole("link", { name: "View stats" })).toHaveAttribute("href", "/profile/stats");
  const explore = page.getByRole("region", { name: "Explore your taste" });
  await expect(explore.locator("article")).toHaveCount(5);
  await expect(explore).toContainText("From your genres: Adventure");
  for (const slug of ["fixture-game-0", "fixture-game-1", "fixture-game-2", "elden-ring-shadow-of-the-erdtree"]) {
    await expect(explore.locator(`a[href="/game/${slug}"]`)).toHaveCount(0);
  }
  for (const locale of ["en", "es-AR"]) for (const theme of ["dark", "light"]) {
    await context.addCookies([
      { name: "playlogg_theme", value: theme, url: "http://127.0.0.1:3100" },
      { name: "playlogg_locale", value: locale, url: "http://127.0.0.1:3100" },
    ]);
    await page.reload();
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `e2e-artifacts/home-personal-${testInfo.project.name}-${locale}-${theme}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await context.addCookies([{ name: "playlogg_locale", value: "en", url: "http://127.0.0.1:3100" }]);
  await page.reload();
  if (testInfo.project.name === "mobile") {
    await page.setViewportSize({ width: 320, height: 812 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.setViewportSize(testInfo.project.use.viewport!);
  }
  await explore.getByRole("link", { name: "Co-op & friends", exact: true }).click();
  await expect(page).toHaveURL(/tag=Co-op/);
  await expect(page.locator("[data-catalog-game]")).toHaveCount(3);
  await page.goto("/");
  await taste.getByRole("link", { name: "Adventure", exact: true }).click();
  await expect(page).toHaveURL(/\/games\?genre=Adventure$/);
  await page.goto("/");
  await recent.getByRole("link", { name: "Edit log entry", exact: true }).first().click();
  await expect(page).toHaveURL(/\/log\?game=fixture-game-/);
  await context.clearCookies();
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Continue playing" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Your taste", exact: true })).toHaveCount(0);
  await expect(page.getByText("Co-op & friends", { exact: true })).toHaveCount(0);
});


test("home review carousel ranks net helpfulness and supports navigation", async ({ page, context, request }, testInfo) => {
  await request.post("http://127.0.0.1:3101/__best-reviews");
  await page.goto("/");
  const carousel = page.getByRole("region", { name: "Best reviews", exact: true });
  const cards = carousel.locator("article");
  await expect(cards).toHaveCount(10);
  await expect(cards.first()).toContainText("Carousel review 10");
  await expect(cards.nth(1)).toContainText("Carousel review 1");
  await expect(carousel).not.toContainText("Private fixture review");
  await expect(cards.first().getByRole("button", { name: /^Helpful/ })).toBeDisabled();
  const track=carousel.getByRole("group", {name:"Review carousel"});
  await carousel.getByRole("button",{name:"Next reviews"}).click();
  await expect.poll(()=>track.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
  await carousel.getByRole("button",{name:"Previous reviews"}).click();
  await expect.poll(()=>track.evaluate(element=>element.scrollLeft)).toBe(0);
  await context.addCookies([authCookie]);
  await page.reload();
  const up=cards.first().getByRole("button",{name:/^Helpful/});
  await up.click();
  await expect(up).toHaveAttribute("aria-pressed","true");
  await expect(up).toHaveText(/Helpful6/);
  expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await carousel.screenshot({path:`e2e-artifacts/review-carousel-${testInfo.project.name}.png`});
  await cards.first().getByRole("link",{name:"Read review"}).click();
  await expect(page).toHaveURL(/\/u\/fixture_public\/game\/fixture-game-7$/);
});
