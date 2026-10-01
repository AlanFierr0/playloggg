import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./test";
// @ts-expect-error The fake session is exported by the Node-only fixture server.
import { authCookie } from "./fixture-server.mjs";

for (const locale of ["en", "es-AR"]) for (const theme of ["dark", "light"]) {
  test(`accessibility audit: ${locale}, ${theme}`, async ({ page, context }, testInfo) => {
    test.setTimeout(120000);
    await context.addCookies([
      { name: "playlogg_locale", value: locale, url: "http://127.0.0.1:3100" },
      { name: "playlogg_theme", value: theme, url: "http://127.0.0.1:3100" },
    ]);
    const failures: { path: string; rule: string; targets: string[][]; summary: string[] }[] = [];
    for (const path of ["/", "/games", "/profile", "/tiers", "/lists", "/compare", "/game/hades", "/game/elden-ring-shadow-of-the-erdtree", "/search?q=Hades&from=/games", "/login", "/u/fixture_public", "/u/fixture_public/tiers", "/u/fixture_public/game/hades", "/u/fixture_public/lists/10", "/u/missing_fixture"]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      for (const violation of results.violations) failures.push({ path, rule: violation.id, targets: violation.nodes.map((node) => node.target as string[]), summary: violation.nodes.map((node) => node.failureSummary ?? "") });
    }
    await context.addCookies([authCookie]);
    for (const path of ["/settings", "/log?game=hades", "/lists"]) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      for (const violation of results.violations) failures.push({ path, rule: violation.id, targets: violation.nodes.map((node) => node.target as string[]), summary: violation.nodes.map((node) => node.failureSummary ?? "") });
    }
    await testInfo.attach("accessibility-audit", { body: JSON.stringify(failures, null, 2), contentType: "application/json" });
    expect(failures).toEqual([]);
  });
}

test("Spanish HTML and metadata are translated before JavaScript runs", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await context.addCookies([{ name: "playlogg_locale", value: "es-AR", url: "http://127.0.0.1:3100" }]);
  const page = await context.newPage();
  for (const route of ["/", "/games", "/login", "/game/hades", "/u/fixture_public"]) {
    await page.goto(`http://127.0.0.1:3100${route}`);
    await expect(page.getByRole("navigation", { name: "Navegación principal" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Descubrir", exact: true }).first()).toBeVisible();
    await expect(page.locator('meta[name="description"]')).not.toHaveAttribute("content", /Browse|personal gaming|Game details|Public game/);
  }
  await page.goto("http://127.0.0.1:3100/games");
  await expect(page).toHaveTitle("Juegos | Playlogg");
  await context.close();
});

test("language changes preserve catalog filters and an owner’s unsaved review", async ({ page, context }) => {
  await page.goto("/games");
  await page.locator("#games-query").fill("Hades");
  await page.getByRole("button", { name: "Switch to Spanish (Argentina)" }).click();
  await expect(page.getByRole("navigation", { name: "Navegación principal" }).first()).toBeVisible();
  await expect(page.locator("#games-query")).toHaveValue("Hades");
  await expect(page.locator("[data-catalog-game]")).toHaveCount(1);
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  await page.locator("#dispatch-textarea").fill("Private English review: Games and Discover stay exactly as written.");
  await page.locator("#hours-input").fill("0");
  await page.getByRole("button", { name: "Cambiar a inglés" }).click();
  await expect(page.getByRole("navigation", { name: "Main navigation" }).first()).toBeVisible();
  await expect(page.locator("#dispatch-textarea")).toHaveValue("Private English review: Games and Discover stay exactly as written.");
  await expect(page.locator("#hours-input")).toHaveValue("0");
});

test("keyboard focus, search trapping and reduced motion remain usable", async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/games");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await page.goto("/search?q=Hades&from=/games");
  const dialog = page.getByRole("dialog");
  const first = dialog.locator('button:not([disabled]), a[href], input, [tabindex="0"]').first();
  const last = dialog.locator('button:not([disabled]), a[href], input, [tabindex="0"]').last();
  await first.focus(); await first.press("Shift+Tab"); await expect(last).toBeFocused();
  await last.press("Tab"); await expect(first).toBeFocused();
  await expect(page.locator("[inert]")).toHaveCount(1);
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  const hours = page.locator("#hours-input"); await hours.focus();
  expect(await hours.evaluate((node) => getComputedStyle(node).outlineStyle)).toBe("solid");
  const pulse = page.locator(".animate-pulse").first();
  expect(await pulse.evaluate((node) => getComputedStyle(node).animationIterationCount)).toBe("1");
  const tier = page.getByRole("button", { name: /^Choose tier/ });
  await tier.click();
  await page.keyboard.press("ArrowDown"); await page.keyboard.press("Escape");
  await expect(tier).toBeFocused();
});
