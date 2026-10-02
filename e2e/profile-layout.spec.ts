import { test, expect } from "./test";
// @ts-expect-error Test-only fixture exports a fake session.
import { authCookie } from "./fixture-server.mjs";

test("profile tools, section tabs and content stay separate and usable", async ({ page, context }, testInfo) => {
  await context.addCookies([authCookie]);
  await page.goto("/profile");
  const tools = page.getByRole("navigation", { name: "Profile tools" });
  const tabs = page.getByRole("navigation", { name: "Profile sections" });
  await expect(tools.getByRole("link")).toHaveCount(6);
  await expect(tabs.getByRole("link")).toHaveCount(6);
  await expect(tabs.getByRole("link", { name: "Overview", exact: true })).toHaveAttribute("aria-current", "page");
  const toolsBox = (await tools.boundingBox())!;
  const tabsBox = (await tabs.boundingBox())!;
  expect(tabsBox.y).toBeGreaterThan(toolsBox.y + toolsBox.height);
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
  if (testInfo.project.name === "desktop") {
    await page.setViewportSize({ width: 768, height: 1024 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: "e2e-artifacts/profile-layout-tablet.png", fullPage: true });
  }
  await tabs.getByRole("link", { name: "Stats", exact: true }).click();
  await expect(page).toHaveURL(/\/profile\/stats$/);
  await expect(page.getByRole("navigation", { name: "Profile sections" }).getByRole("link", { name: "Stats", exact: true })).toHaveAttribute("aria-current", "page");
});
