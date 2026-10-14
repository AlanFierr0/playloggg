import { test, expect } from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Test-only fixture exports a fake session.
import { authCookie } from "./fixture-server.mjs";

test("profile tools, section tabs and content stay separate and usable", async ({ page, context }, testInfo) => {
  await context.addCookies([authCookie]);
  await page.goto("/games");
  const profileLink = page.locator("header").getByRole("link", { name: "Your profile", exact: true });
  await expect(profileLink).toHaveAttribute("href", "/profile");
  await expect(page.locator("header").getByRole("link", { name: "Profile", exact: true })).toHaveCount(0);
  await profileLink.click();
  await expect(page).toHaveURL(/\/profile$/);
  const tools = page.getByRole("navigation", { name: "Profile tools" });
  const tabs = page.getByRole("navigation", { name: "Profile sections" });
  await expect(tools.getByRole("link")).toHaveCount(4);
  await expect(tools.getByRole("link", { name: "Activity feed", exact: true })).toHaveCount(0);
  await expect(tools.getByRole("link", { name: "Year in Gaming", exact: true })).toHaveCount(0);
  await expect(tools.getByRole("link", { name: "Quick rating", exact: true })).toHaveCount(0);
  await expect(tools.getByRole("link", { name: "Import from Steam", exact: true })).toHaveAttribute("href", "/profile/import/steam");
  await expect(tabs.getByRole("link")).toHaveCount(4);
  await expect(tabs.getByRole("link", { name: "Lists", exact: true })).toHaveCount(0);
  await expect(tabs.getByRole("link",{name:"Tier List",exact:true})).toHaveCount(0);
  await expect(tabs.getByRole("link", { name: "Overview", exact: true })).toHaveAttribute("aria-current", "page");
  const profileBox = (await tools.locator("xpath=ancestor::header").boundingBox())!;
  const tabsBox = (await tabs.boundingBox())!;
  expect(profileBox.y).toBeGreaterThan(tabsBox.y + tabsBox.height);
  for (const nav of [tools, tabs]) {
    const boxes = await nav.getByRole("link").evaluateAll(links => links.map(link => {
      const { x, y, width, height } = link.getBoundingClientRect();
      return { x, y, width, height };
    }));
    for (const [index, box] of boxes.entries()) {
      expect(box.height).toBeGreaterThanOrEqual(44);
      for (const other of boxes.slice(index + 1)) {
        expect(box.x + box.width <= other.x || other.x + other.width <= box.x || box.y + box.height <= other.y || other.y + other.height <= box.y).toBe(true);
      }
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `e2e-artifacts/profile-layout-${testInfo.project.name}.png`, fullPage: true });
  const recent = page.getByRole("heading", { name: "Recently updated entries", exact: true }).locator("..");
  for (const image of await recent.locator("img").all()) expect((await image.boundingBox())!.width).toBeLessThanOrEqual(96);
  for (const theme of ["dark", "light"]) {
    await context.addCookies([{ name: "playlogg_theme", value: theme, url: "http://127.0.0.1:3100" }]);
    await page.reload();
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `e2e-artifacts/profile-redesign-${theme}-${testInfo.project.name}.png`, fullPage: true });
  }
  await context.addCookies([{ name: "playlogg_theme", value: "dark", url: "http://127.0.0.1:3100" }]);
  await page.reload();
  if (testInfo.project.name === "desktop") {
    await page.setViewportSize({ width: 768, height: 1024 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: "e2e-artifacts/profile-layout-tablet.png", fullPage: true });
  }
  await tabs.getByRole("link", { name: "Stats", exact: true }).click();
  await expect(page).toHaveURL(/\/profile\/stats$/);
  await expect(page.getByRole("navigation", { name: "Profile sections" }).getByRole("link", { name: "Stats", exact: true })).toHaveAttribute("aria-current", "page");
  if (testInfo.project.name === "desktop") await page.setViewportSize({ width: 1440, height: 1000 });
  const distribution = page.getByRole("heading", { name: "Rating distribution", exact: true }).locator("..");
  const distributionBox = (await distribution.boundingBox())!;
  const statsTabsBox = (await page.getByRole("navigation", { name: "Profile sections" }).boundingBox())!;
  expect(distributionBox.x).toBeCloseTo(statsTabsBox.x, 0);
  expect(distributionBox.width).toBeCloseTo(statsTabsBox.width, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `e2e-artifacts/stats-layout-${testInfo.project.name}.png`, fullPage: true });
  const menu = page.getByRole("button", { name: "Navigation menu" });
  if (await menu.isVisible()) await menu.click();
  const tierLink=page.getByRole("navigation",{name:"Main navigation"}).filter({visible:true}).getByRole("link",{name:"Tier List",exact:true});
  await tierLink.click();
  await expect(page).toHaveURL(/\/tiers$/);
  if (await menu.isVisible()) await menu.click();
  await expect(tierLink).toHaveAttribute("aria-current","page");
  await expect(page.getByRole("navigation",{name:"Profile sections"})).toHaveCount(0);
});


test("stats hide small groups until each section loads more", async ({ page }) => {
  await page.goto("/u/fixture_public/stats");
  for (const label of ["Genre statistics", "Studio statistics", "Publisher statistics"]) {
    const section = page.getByRole("heading", { name: label, exact: true }).locator("..");
    const rows = section.locator("tbody tr");
    for (const row of await rows.all()) {
      expect(Number(await row.locator("td").first().innerText())).toBeGreaterThanOrEqual(5);
    }
    const before = await rows.count();
    await section.getByRole("button", { name: `Load more — ${label}`, exact: true }).click();
    expect(await rows.count()).toBeGreaterThan(before);
    const counts = await rows.locator("td:first-of-type").allTextContents();
    expect(counts.some(count => Number(count) < 5)).toBe(true);
    await expect(section.getByRole("button")).toHaveCount(0);
  }
});


test("recent profile entries fill the sidebar height without stretching the overview",async({page,context,request},info)=>{
  await context.addCookies([authCookie]);
  await request.post("http://127.0.0.1:3101/__tier-drag-board");
  await page.goto("/profile");
  const recent=page.getByRole("heading",{name:"Recently updated entries",exact:true}).locator("..");
  const summary=recent.locator("..").locator(":scope > div").first();
  if(info.project.name==="desktop"){
    const left=(await summary.boundingBox())!,right=(await recent.boundingBox())!;
    expect(right.y).toBeCloseTo(left.y,0);
    expect(right.y+right.height).toBeCloseTo(left.y+left.height,0);
    const lastPanel=(await summary.locator(":scope > *").last().boundingBox())!;
    expect(right.y+right.height).toBeCloseTo(lastPanel.y+lastPanel.height,0);
    await expect(recent.getByRole("link")).toHaveCount(16);
    const list=recent.locator(":scope > div");
    expect(await list.evaluate(node=>node.scrollHeight>node.clientHeight&&node.clientHeight>0)).toBe(true);
    await recent.getByRole("link").last().scrollIntoViewIfNeeded();
    const last=(await recent.getByRole("link").last().boundingBox())!;
    const scrolledPanel=(await recent.boundingBox())!;
    expect(last.y).toBeGreaterThanOrEqual(scrolledPanel.y);
    expect(last.y+last.height).toBeLessThanOrEqual(scrolledPanel.y+scrolledPanel.height);
    await list.evaluate(node=>{node.scrollTop=0;});
    await page.evaluate(()=>window.scrollTo(0,0));
  }else{
    await expect(recent.getByRole("link")).toHaveCount(6);
    const left=(await summary.boundingBox())!,right=(await recent.boundingBox())!;
    expect(right.y).toBeGreaterThanOrEqual(left.y+left.height);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`e2e-artifacts/profile-recent-height-${info.project.name}.png`,fullPage:true});
});
