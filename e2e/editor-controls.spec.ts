import { test, expect } from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Local fixture session only.
import { authCookie } from "./fixture-server.mjs";

test("PC stores persist independently and can be cleared without changing other entry data", async ({page,context,request}) => {
  await context.addCookies([authCookie]);
  for (const [value,label] of [["pc_battlenet","PC / Battle.net"],["pc_gog","PC / GOG"],["pc_epic","PC / Epic Games"],["pc_ea","PC / EA app"],["pc_ubisoft","PC / Ubisoft Connect"],["pc_xbox","PC / Xbox app"],["pc_other","PC / Other"]]) {
    await page.goto("/log?game=hades");
    const pc=page.getByRole("button",{name:"PC",exact:true});
    if(await pc.getAttribute("aria-pressed")!=="true") await pc.click();
    await page.getByRole("button",{name:label,exact:true}).click();
    await page.locator("#commit-rating").click();
    await expect(page).toHaveURL(/\/profile$/);
    await page.goto("/log?game=hades");
    await expect(page.getByRole("button",{name:label,exact:true})).toHaveAttribute("aria-pressed","true");
    const state=await (await request.get("http://127.0.0.1:3101/__state")).json();
    expect(state.ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===1)).toMatchObject({platform:value,score:null,tier:null,status:null});
  }
  await page.getByRole("button",{name:"PC / Other",exact:true}).click();
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/log?game=hades");
  await expect(page.locator("#platform-selector [aria-pressed=true]")).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("PC stores appear below main platforms and collapse for console selection",async({page,context},testInfo)=>{
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  const pc=page.getByRole("button",{name:"PC",exact:true});
  const stores=page.getByRole("group",{name:"PC store",exact:true});
  await expect(stores).toBeHidden();
  await pc.click();
  await expect(stores).toBeVisible();
  await expect(page.getByRole("button",{name:"PC / Steam",exact:true})).toHaveAttribute("aria-pressed","true");
  const main=await page.locator("#platform-selector").boundingBox();
  const submenu=await stores.boundingBox();
  expect(submenu!.y).toBeGreaterThanOrEqual(main!.y+main!.height);
  await page.locator("#pc-store-selector").screenshot({path:`e2e-artifacts/pc-stores-${testInfo.project.name}.png`});
  await page.getByRole("button",{name:"PC / GOG",exact:true}).click();
  await expect(pc).toHaveAttribute("aria-pressed","true");
  await page.getByRole("button",{name:"PlayStation",exact:true}).click();
  await page.getByRole("menuitemradio",{name:"PlayStation 5",exact:true}).click();
  await expect(stores).toBeHidden();
  await expect(pc).toHaveAttribute("aria-expanded","false");
  await expect(page.getByRole("button",{name:"PlayStation",exact:true})).toHaveAttribute("aria-pressed","true");
});

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
  await expect(page.locator("#score-display")).toHaveValue(String(selected));
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
  await expect(page.locator("#score-display")).toHaveValue("");
  await expect(page.locator("#dispatch-textarea")).toHaveValue("");
  await expect(page.locator("#hours-input")).toHaveValue("");
  await expect(page.locator("#date-input")).toHaveValue("");
  await expect(page.getByRole("button", { name: /Backlog$/ })).toHaveAttribute("aria-pressed", "false");
  const state = await (await request.get("http://127.0.0.1:3101/__state")).json();
  expect(state.ratings.filter((row: { profile_id: number; game_id: number }) => row.profile_id === 2 && row.game_id === 1)).toEqual([]);
});

test("editor tier dropdown matches the tier board colors in both themes", async ({ page, context }, testInfo) => {
  await context.addCookies([authCookie]);
  for (const theme of ["dark", "light"]) {
    await context.addCookies([{ name: "playlogg_theme", value: theme, url: "http://127.0.0.1:3100" }]);
    await page.goto("/log?game=hades");
    await page.locator("#tier-badge").click();
    const options = page.getByRole("menuitemradio");
    for (const [index, color] of ["rgb(255, 127, 127)", "rgb(255, 191, 127)", "rgb(255, 223, 127)", "rgb(255, 255, 127)", "rgb(191, 255, 127)", "rgb(127, 255, 127)"].entries()) {
      await expect(options.nth(index)).toHaveCSS("background-color", color);
      await expect(options.nth(index)).toHaveCSS("color", "rgb(0, 0, 0)");
    }
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `e2e-artifacts/editor-tiers-${testInfo.project.name}-${theme}.png`, fullPage: true });
    await options.nth(0).click();
    await expect(page.locator("#tier-badge")).toHaveCSS("background-color", "rgb(255, 127, 127)");
    await page.locator("#tier-badge").click();
    await expect(page.getByRole("menuitemradio").nth(0)).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Escape");
    await expect(page.locator("#tier-badge")).toBeFocused();
  }
});

test("score descriptions follow typing and sliding without numeric labels", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  const descriptions = page.locator("#score-descriptions");
  const active = descriptions.locator('[aria-current="true"]');
  await expect(descriptions.locator("span")).toHaveText(["Terrible", "Poor", "Average", "Great", "Masterpiece"]);
  const track = (await page.locator("#score-slider").boundingBox())!;
  for (const [index, value] of [0, 25, 50, 75, 100].entries()) {
    const label = (await descriptions.locator("span").nth(index).boundingBox())!;
    expect(Math.abs(label.x + label.width / 2 - (track.x + 11 + (track.width - 22) * value / 100))).toBeLessThan(1);
  }
  await expect(active).toHaveCount(0);
  for (const [value, label] of [["0", "Terrible"], ["24", "Terrible"], ["25", "Poor"], ["49", "Poor"], ["50", "Average"], ["74", "Average"], ["75", "Great"], ["99", "Great"], ["100", "Masterpiece"]]) {
    await page.locator("#score-display").fill(value);
    await expect(active).toHaveText(label);
    await expect(page.locator("#score-slider")).toHaveValue(value);
  }
  await page.locator("#score-slider").fill("50");
  await expect(active).toHaveText("Average");
  await expect(page.locator("#score-display")).toHaveValue("50");
  await page.locator("#score-display").fill("999");
  await expect(page.locator("#score-display")).toHaveValue("50");
  await expect(active).toHaveText("Average");
  await page.locator("#score-display").fill("");
  await expect(active).toHaveCount(0);
});

test("score keyboard controls and discard retain the last committed score", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  const slider = page.getByRole("slider", { name: "Numerical score from 0 to 100" });
  await slider.focus();
  await slider.press("Home");
  await expect(page.locator("#score-display")).toHaveValue("0");
  await slider.press("End");
  await expect(page.locator("#score-display")).toHaveValue("100");
  await page.locator("#dispatch-textarea").fill("Keep this saved review");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/log?game=hades");
  await slider.press("ArrowLeft");
  await expect(page.locator("#score-display")).toHaveValue("99");
  await page.locator("#dispatch-textarea").fill("Discard this draft");
  await page.locator("#discard-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.locator("#score-slider")).toHaveCount(0);
  await page.goto("/log?game=hades");
  await expect(page.locator("#score-display")).toHaveValue("100");
  await expect(page.locator("#dispatch-textarea")).toHaveValue("Keep this saved review");
  await page.reload();
  await expect(page.locator("#score-display")).toHaveValue("100");
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


test("typed scores sync with the slider, reject invalid values and persist zero", async ({page,context}) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  const input=page.getByRole("textbox", {name:"Numerical score from 0 to 100"});
  const slider=page.getByRole("slider", {name:"Numerical score from 0 to 100"});
  await input.fill("87");
  await expect(slider).toHaveValue("87");
  await expect(page.locator("#score-display")).toHaveValue("87");
  await slider.fill("100");
  await expect(input).toHaveValue("100");
  await input.fill("");
  await expect(page.locator("#score-display")).toHaveValue("");
  await expect(input).toHaveAttribute("maxlength","3");
  await expect(page.getByRole("spinbutton", {name:"Numerical score from 0 to 100"})).toHaveCount(0);
  await input.fill("87");
  for(const value of ["-1","12.5","abc","1e2","101","999"]){
    await input.fill(value);
    await expect(input).toHaveValue("87");
    await expect(slider).toHaveValue("87");
  }
  await input.fill("1000");
  await expect(input).toHaveValue("100");
  await input.pressSequentially("1");
  await expect(input).toHaveValue("100");
  await input.fill("101");
  await expect(input).toHaveValue("100");
  await expect(input).toHaveAttribute("aria-invalid","false");
  await expect(page.locator("#score-error")).toHaveCount(0);
  await input.fill("10");
  await input.pressSequentially("1");
  await expect(input).toHaveValue("10");
  await input.pressSequentially("0");
  await expect(input).toHaveValue("100");
  await input.fill("0");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/log?game=hades");
  await expect(input).toHaveValue("0");
  await expect(slider).toHaveValue("0");
});


test("completion calendar selects leap days, supports keyboard navigation and saves dates", async ({ page, context }, testInfo) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  const input = page.locator("#date-input");
  const trigger = page.getByRole("button", { name: "Choose completion date", exact: true });
  await input.fill("2024-02-28");
  await trigger.click();
  const calendar = page.getByRole("dialog", { name: "Completion date", exact: true });
  await expect(calendar).toBeVisible();
  const selected = calendar.getByRole("button", { name: "Wednesday, February 28, 2024", exact: true });
  await expect(selected).toBeFocused();
  await selected.press("ArrowRight");
  const leap = calendar.getByRole("button", { name: "Thursday, February 29, 2024", exact: true });
  await expect(leap).toBeFocused();
  await leap.press("Enter");
  await expect(calendar).toBeHidden();
  await expect(input).toHaveValue("2024-02-29");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(leap).toHaveAttribute("aria-pressed", "true");
  await calendar.screenshot({ path: `e2e-artifacts/completion-calendar-${testInfo.project.name}.png` });
  expect((await new AxeBuilder({ page }).include('dialog[open]').analyze()).violations).toEqual([]);
  await calendar.getByRole("button", { name: "Next month", exact: true }).click();
  await expect(calendar.getByRole("combobox", { name: "Month", exact: true })).toHaveValue("2");
  await calendar.getByRole("spinbutton", { name: "Year", exact: true }).fill("2023");
  await calendar.getByRole("combobox", { name: "Month", exact: true }).selectOption("1");
  await expect(calendar.getByRole("button", { name: /February 29, 2023/ })).toHaveCount(0);
  await calendar.press("Escape");
  await expect(input).toHaveValue("2024-02-29");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/log?game=hades");
  await expect(input).toHaveValue("2024-02-29");
  await trigger.click();
  await calendar.getByRole("button", { name: "Clear date", exact: true }).click();
  await expect(input).toHaveValue("");
  await trigger.click();
  await calendar.getByRole("button", { name: "Today", exact: true }).click();
  await expect(input).not.toHaveValue("");
  await trigger.click();
  await calendar.getByRole("button", { name: "Close calendar", exact: true }).click();
  await expect(calendar).toBeHidden();
  if (testInfo.project.name === "mobile") await page.getByRole("button", { name: "Navigation menu", exact: true }).click();
  await page.getByRole("button", { name: "Switch to light mode", exact: true }).click();
  if (testInfo.project.name === "mobile") await page.getByRole("button", { name: "Navigation menu", exact: true }).click();
  await trigger.click();
  expect((await new AxeBuilder({ page }).include('dialog[open]').analyze()).violations).toEqual([]);
  await calendar.screenshot({ path: `e2e-artifacts/completion-calendar-light-${testInfo.project.name}.png` });
  await calendar.press("Escape");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});


test("playtime rejects negative typing and pasted values while saving fractional hours", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  const hours = page.locator("#hours-input");
  await hours.press("-");
  await expect(hours).toHaveValue("");
  await hours.fill("12.5");
  await hours.fill("-5");
  await expect(hours).toHaveValue("12.5");
  await hours.fill("999999999");
  await expect(hours).toHaveValue("12.5");
  await hours.fill("1e12");
  await expect(hours).toHaveValue("12.5");
  await hours.fill(" -0.5");
  await expect(hours).toHaveValue("12.5");
  await hours.fill("0");
  await expect(hours).toHaveValue("0");
  await hours.fill("");
  await expect(hours).toHaveValue("");
  await hours.fill("0.5");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/log?game=hades");
  await expect(hours).toHaveValue("0.5");
});


test("console platform popups save specific consoles and preserve existing entry data", async ({ page, context }, testInfo) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=elden-ring-shadow-of-the-erdtree");
  for (const [family, consoleName] of [["PlayStation", "PlayStation 4"], ["Xbox", "Xbox Series S"]]) {
    const trigger = page.getByRole("button", { name: family, exact: true });
    await trigger.click();
    const menu = page.getByRole("menu", { name: `${family} console`, exact: true });
    await expect(menu).toBeVisible();
    await menu.getByRole("menuitemradio", { name: consoleName, exact: true }).click();
    await expect(menu).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#score-display")).toHaveValue("80");
    await page.locator("#commit-rating").click();
    await expect(page).toHaveURL(/\/profile$/);
    await page.goto("/log?game=elden-ring-shadow-of-the-erdtree");
    await trigger.click();
    await expect(menu.getByRole("menuitemradio", { name: consoleName, exact: true })).toHaveAttribute("aria-checked", "true");
    await menu.screenshot({ path: `e2e-artifacts/console-${family}-${testInfo.project.name}.png` });
    expect((await new AxeBuilder({ page }).include('[popover]:popover-open').analyze()).violations).toEqual([]);
    await menu.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  }
  await page.getByRole("button", { name: "Xbox", exact: true }).click();
  await page.getByRole("menuitemradio", { name: "Xbox Series S", exact: true }).press("Home");
  await expect(page.getByRole("menuitemradio", { name: "Xbox", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitemradio", { name: "Xbox 360", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Console: Xbox 360", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Xbox", exact: true }).click();
  await page.getByRole("menuitemradio", { name: "Xbox 360", exact: true }).click();
  await expect(page.locator("#platform-selector [aria-pressed=true]")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});


test("completion calendar blocks dates before launch and accepts launch day", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  const input = page.locator("#date-input");
  await expect(input).toHaveAttribute("min", "2020-01-01");
  await input.fill("2019-12-31");
  await page.getByRole("button", { name: "Choose completion date", exact: true }).click();
  await expect(input).toHaveValue("2019-12-31");
  await expect(input).toHaveAttribute("aria-invalid","true");
  await expect(page.getByText("Choose a completion date between release and today.", {exact:true})).toBeVisible();
  const calendar = page.getByRole("dialog", { name: "Completion date", exact: true });
  await expect(calendar.locator('[data-date="2019-12-31"]')).toBeDisabled();
  await expect(calendar.getByRole("button", { name: "Previous month", exact: true })).toBeDisabled();
  const launch = calendar.locator('[data-date="2020-01-01"]');
  await launch.press("ArrowLeft");
  await expect(launch).toBeFocused();
  await launch.click();
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/log?game=hades");
  await expect(input).toHaveValue("2020-01-01");
});
