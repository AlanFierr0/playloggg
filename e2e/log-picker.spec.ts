import { test, expect } from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Isolated local test identity.
import { authCookie } from "./fixture-server.mjs";

test("Log starts with game selection and opens options only after a choice", async ({ page, context }, testInfo) => {
  await context.addCookies([authCookie]);
  await page.goto("/profile");
  await page.getByRole("link", { name: "Log a game", exact: true }).click();
  await expect(page).toHaveURL(/\/log$/);
  await expect(page.getByRole("heading", { name: "Choose a game", exact: true })).toBeVisible();
  await expect(page.locator("#score-slider")).toHaveCount(0);
  await expect(page.getByText("Quick Commands", { exact: true })).toHaveCount(0);
  const search = page.getByRole("textbox", { name: "Search titles, profiles and commands" });
  await expect(search).toHaveValue("");
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]);
  await page.screenshot({ path: `e2e-artifacts/log-picker-${testInfo.project.name}.png`, fullPage: true });
  await search.fill("Hades");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/log\?game=hades$/);
  await expect(page.getByRole("heading", { name: "Hades", exact: true })).toBeVisible();
  await expect(page.locator("#score-slider")).toBeEnabled();
  await page.getByRole("link", { name: "Switch Game", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(page.getByRole("heading", { name: "Choose a game", exact: true })).toBeVisible();
  await search.fill("Elden Ring");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/log\?game=elden-ring-shadow-of-the-erdtree$/);
  await expect(page.getByRole("heading", { name: "Elden Ring: Shadow of the Erdtree", exact: true })).toBeVisible();
});

test("game picker can be cancelled and guest selection keeps save unavailable", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto("/log");
  await page.getByRole("dialog").press("Escape");
  await expect(page).toHaveURL(/\/profile$/);
  await context.clearCookies();
  await page.goto("/log");
  await page.getByRole("dialog").press("Escape");
  await expect(page).toHaveURL("http://127.0.0.1:3100/");
  await page.goto("/log");
  const search=page.getByRole("textbox", { name: "Search titles, profiles and commands" });
  await search.fill("Hades");
  await search.press("Enter");
  await expect(page.locator("#commit-rating")).toBeDisabled();
});
