import { test, expect } from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error The fake session is exported by the Node-only fixture server.
import { authCookie } from "./fixture-server.mjs";

test("profile preview, responsive menu and catalog disclosure work in both themes", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("figure", { name: "Profile preview" })).toBeVisible();
  await expect(page.getByText("Illustrative layout. Your profile starts empty and private.")).toBeVisible();
  const hero = page.locator("main header");
  await expect(hero.getByRole("link", {name:"Create your profile", exact:true})).toHaveAttribute("href", "/login?mode=register");
  await expect(hero.getByRole("figure").getByRole("link")).toHaveCount(4);
  await page.screenshot({path: `e2e-artifacts/ui-home-${testInfo.project.name}.png`, fullPage: true});
  const menu = page.getByRole("button", {name: "Navigation menu"});
  if (await menu.isVisible()) {
    await menu.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("header details")).toHaveAttribute("open", "");
    await expect(page.getByRole("navigation",{name:"Main navigation"}).filter({visible:true}).getByRole("link",{name:"Compare",exact:true})).toBeVisible();
    expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
    await menu.press("Escape");
    await expect(menu).toBeFocused();
    await expect(page.locator("header details")).not.toHaveAttribute("open", "");
    await menu.click();
  }
  await page.getByRole("button", {name:"Switch to light mode"}).click();
  await page.getByRole("button", {name:"Switch to Spanish (Argentina)"}).click();
  await expect(page.getByRole("figure", {name:"Vista previa del perfil"})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Construí tu identidad gamer."})).toBeVisible();
  if (await page.locator("header summary").isVisible()) await page.locator("header summary").press("Escape");
  await page.screenshot({path: `e2e-artifacts/ui-home-light-es-${testInfo.project.name}.png`, fullPage: true});
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({width,height:1000});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize(testInfo.project.use.viewport!);
  await page.goto("/games");
  const filters = page.getByRole("button", {name:/Filtros y orden/});
  if (testInfo.project.use.viewport!.width < 1024) {
    await expect(filters).toBeVisible();
    await expect(page.locator("#games-genre")).toBeHidden();
    await filters.click();
  }
  await page.locator("#games-genre").selectOption("Roguelike");
  await expect(page).toHaveURL(/genre=Roguelike/);
  await expect(page.getByRole("heading",{name:"Hades",exact:true})).toBeVisible();
  await page.reload();
  if (testInfo.project.use.viewport!.width < 1024) {
    await expect(filters).toBeVisible();
    await expect(filters).toContainText("(1)");
    await filters.click();
  }
  await expect(page.locator("#games-genre")).toHaveValue("Roguelike");
  await expect(page.locator("[data-catalog-game]").getByText("No registrado",{exact:true})).toHaveCount(0);
  await page.screenshot({path: `e2e-artifacts/ui-catalog-${testInfo.project.name}.png`, fullPage: true});
  expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
});

test("profile creation preserves registration intent and ordinary sign-in", async ({page,context}) => {
  await page.goto("/");
  await page.locator("main header").getByRole("link", {name:"Create your profile",exact:true}).click();
  await expect(page).toHaveURL(/\/login\?mode=register$/);
  await expect(page.getByRole("heading",{name:"Create account",exact:true})).toBeVisible();
  await expect(page.getByRole("button",{name:"Create account",exact:true}).first()).toHaveAttribute("aria-pressed","true");
  await expect(page.getByLabel("Password",{exact:true})).toHaveAttribute("autocomplete","new-password");
  await page.goto("/login");
  await expect(page.getByRole("heading",{name:"Sign in",exact:true})).toBeVisible();
  await expect(page.getByRole("button",{name:"Sign in",exact:true})).toHaveAttribute("aria-pressed","true");
  await expect(page.getByLabel("Password",{exact:true})).toHaveAttribute("autocomplete","current-password");
  await context.addCookies([authCookie]);
  await page.goto("/");
  await expect(page.locator("main header").getByRole("link",{name:"Open your profile",exact:true})).toHaveAttribute("href","/profile");
});

test("comparison and game details prioritize useful actions without inventing data", async ({page},testInfo) => {
  await page.goto("/compare");
  await expect(page.getByRole("region",{name:"What a comparison shows"})).toBeVisible();
  await expect(page.getByLabel("First profile handle")).toHaveCSS("border-top-style","solid");
  await page.getByLabel("First profile handle").fill("fixture_public");
  await page.getByLabel("Second profile handle").fill("fixture_peer");
  await page.getByRole("button",{name:"Compare profiles"}).click();
  await expect(page.getByRole("table")).toContainText("Fixture Game 00");
  await expect(page.getByRole("region",{name:"What a comparison shows"})).toHaveCount(0);
  await page.goto("/game/hades");
  await expect(page.getByRole("link",{name:"Log this game",exact:true})).toBeVisible();
  await expect(page.getByText("Your score",{exact:true})).toHaveCount(0);
  await expect(page.getByText("Community score",{exact:true})).toBeVisible();
  await page.screenshot({path: `e2e-artifacts/ui-game-${testInfo.project.name}.png`, fullPage:true});
});
