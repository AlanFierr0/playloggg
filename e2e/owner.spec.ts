import { test, expect } from "./test";
import AxeBuilder from "@axe-core/playwright";
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
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.locator("#commit-rating")).toHaveCount(0);
  await page.goto("/log?game=hades");
  await expect(page.getByRole("button", { name: /Backlog$/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#score-display")).toHaveValue("");
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
  await page.getByRole("button", { name: /^Choose tier, currently / }).click();
  await page.getByRole("menuitemradio", { name: "S God", exact: true }).click();
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.locator("#commit-rating")).toHaveCount(0);
  await page.goto("/log?game=hades");
  await expect(page.locator("#score-display")).toHaveValue("0");
  await expect(page.getByRole("button", { name: "Choose tier, currently S" })).toBeVisible();
  const state = await (await fetch("http://127.0.0.1:3101/__state")).json();
  expect(state.ratings.filter((row: { profile_id: number }) => row.profile_id === 2 && "game_id" in row && row.game_id === 1)).toMatchObject([{ score: 0, tier: "S", status: "backlog", hours_played: 0 }]);
  await context.clearCookies();
  await page.goto("/log?game=hades");
  await expect(page.locator("#commit-rating")).toBeDisabled();
});

test("private and unknown nested profiles return 404; published entries are readable and list pages are retired", async ({ page }) => {
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
  await expect(page.getByRole("heading", { name: "Public fixture list", exact: true })).toHaveCount(0);
  await expect(page.getByText("Fixture-only saved review", { exact: true })).toHaveCount(0);
});


test("live-service statuses save, reload and filter without changing scores or tiers",async({page,context,request},info)=>{
 await context.addCookies([authCookie]);
 for(const [status,label] of [["active","Currently playing"],["paused","Paused"],["stopped","Stopped playing"]]){
   await page.goto("/log?game=elden-ring-shadow-of-the-erdtree");
   await page.getByRole("group",{name:"Playback status",exact:true}).getByRole("button",{name:label,exact:true}).click();
   await page.locator("#commit-rating").click();
   await expect(page).toHaveURL(/\/profile$/);
   const state=await (await request.get("http://127.0.0.1:3101/__state")).json();
   expect(state.ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===2)).toMatchObject({status,score:80,tier:"B"});
   await page.goto("/log?game=elden-ring-shadow-of-the-erdtree");
   await page.reload();
   await expect(page.getByRole("group",{name:"Playback status",exact:true}).getByRole("button",{name:label,exact:true})).toHaveAttribute("aria-pressed","true");
   await page.goto(`/games?status=${status}`);
   await expect(page.locator('[data-catalog-game="elden-ring-shadow-of-the-erdtree"]')).toBeVisible();
   await expect(page.getByRole("button",{name:"Remove filter: Playback status",exact:true})).toContainText(label);
 }
 await page.goto("/log?game=elden-ring-shadow-of-the-erdtree");
 await page.getByRole("group",{name:"Playback status",exact:true}).scrollIntoViewIfNeeded();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`e2e-artifacts/live-service-status-${info.project.name}.png`});
});


test("404 offers accessible recovery in both languages and themes", async ({ page, context }, testInfo) => {
  for (const locale of ["en", "es-AR"]) for (const theme of ["dark", "light"]) {
    await context.addCookies([
      { name: "playlogg_locale", value: locale, url: "http://127.0.0.1:3100" },
      { name: "playlogg_theme", value: theme, url: "http://127.0.0.1:3100" },
    ]);
    expect((await page.goto("/missing-fixture-page"))?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(locale === "en" ? "You took a wrong warp." : "Tomaste el portal equivocado.");
    const content = page.locator("#main-content");
    await expect(content.getByRole("link", { name: locale === "en" ? "Go home" : "Volver al inicio", exact: true })).toHaveAttribute("href", "/");
    await expect(content.getByRole("link", { name: locale === "en" ? "Search games" : "Buscar juegos", exact: true })).toHaveAttribute("href", "/search?q=&from=/");
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `e2e-artifacts/404-${testInfo.project.name}-${locale}-${theme}.png`, fullPage: true });
  }
  if (testInfo.project.name === "mobile") {
    await page.setViewportSize({ width: 320, height: 812 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.locator("#main-content").getByRole("link", { name: "Buscar juegos", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL("http://127.0.0.1:3100/");
  await page.goto("/missing-fixture-page");
  await page.locator("#main-content").getByRole("link", { name: "Volver al inicio", exact: true }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3100/");
});
