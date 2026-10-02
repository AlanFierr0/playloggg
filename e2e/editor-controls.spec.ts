import { test, expect } from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Local fixture session only.
import { authCookie } from "./fixture-server.mjs";

test("score slider works on an unrated game and discard returns to profile without saving", async ({ page, context, request }) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  const slider = page.getByRole("slider", { name: "Numerical score from 0 to 100" });
  await expect(slider).toBeEnabled();
  const box = (await slider.boundingBox())!;
  await slider.click({ position: { x: box.width * 0.8, y: box.height / 2 } });
  const selected = Number(await slider.inputValue());
  expect(selected).toBeGreaterThan(70);
  expect(selected).toBeLessThan(90);
  await expect(page.locator("#score-display")).toHaveText(String(selected));
  const dragBox = (await slider.boundingBox())!;
  const thumbX = dragBox.x + 11 + (dragBox.width - 22) * selected / 100;
  await page.mouse.move(thumbX, dragBox.y + dragBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(dragBox.x + dragBox.width * 0.2, dragBox.y + dragBox.height / 2, { steps: 10 });
  await page.mouse.up();
  expect(Number(await slider.inputValue())).toBeGreaterThan(10);
  expect(Number(await slider.inputValue())).toBeLessThan(30);
  await page.locator("#dispatch-textarea").fill("Discard this unsaved review");
  await page.getByRole("button", { name: /Backlog$/ }).click();
  await page.locator("#hours-input").fill("12.5");
  await page.locator("#date-input").fill("2026-10-01");
  await page.locator("#discard-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.locator("#score-slider")).toHaveCount(0);
  await page.goto("/log?game=hades");
  await expect(page.locator("#score-display")).toHaveText("—");
  await expect(page.locator("#dispatch-textarea")).toHaveValue("");
  await expect(page.locator("#hours-input")).toHaveValue("");
  await expect(page.locator("#date-input")).toHaveValue("");
  await expect(page.getByRole("button", { name: /Backlog$/ })).toHaveAttribute("aria-pressed", "false");
  const state = await (await request.get("http://127.0.0.1:3101/__state")).json();
  expect(state.ratings.filter((row: { profile_id: number; game_id: number }) => row.profile_id === 2 && row.game_id === 1)).toEqual([]);
});

test("score keyboard controls and discard retain the last committed score", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  const slider = page.getByRole("slider", { name: "Numerical score from 0 to 100" });
  await slider.focus();
  await slider.press("Home");
  await expect(page.locator("#score-display")).toHaveText("0");
  await slider.press("End");
  await expect(page.locator("#score-display")).toHaveText("100");
  await page.locator("#dispatch-textarea").fill("Keep this saved review");
  await page.locator("#commit-rating").click();
  await expect(page.getByText(/^Entry saved:/)).toBeVisible();
  await slider.press("ArrowLeft");
  await expect(page.locator("#score-display")).toHaveText("99");
  await page.locator("#dispatch-textarea").fill("Discard this draft");
  await page.locator("#discard-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.locator("#score-slider")).toHaveCount(0);
  await page.goto("/log?game=hades");
  await expect(page.locator("#score-display")).toHaveText("100");
  await expect(page.locator("#dispatch-textarea")).toHaveValue("Keep this saved review");
  await page.reload();
  await expect(page.locator("#score-display")).toHaveText("100");
});

test("editor score and discard controls are accessible in both themes and languages", async ({ page, context }, testInfo) => {
  await context.addCookies([authCookie]);
  for (const locale of ["en", "es-AR"]) for (const theme of ["dark", "light"]) {
    await context.addCookies([
      { name: "playlogg_locale", value: locale, url: "http://127.0.0.1:3100" },
      { name: "playlogg_theme", value: theme, url: "http://127.0.0.1:3100" },
    ]);
    await page.goto("/log?game=hades");
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(result.violations).toEqual([]);
    await page.screenshot({ path: `e2e-artifacts/editor-${testInfo.project.name}-${locale}-${theme}.png`, fullPage: true });
  }
});
