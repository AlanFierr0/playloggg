import { test, expect } from "./test";
// @ts-expect-error Local fixture session only.
import { authCookie } from "./fixture-server.mjs";

// Stable named fixture games, independent of production catalog contents.
test("catalog combines filters, loads more, clears and handles empty results", async ({ page }) => {
  await page.goto("/games");
  await expect(page.locator("[data-catalog-game]")).toHaveCount(25);
  const initial = await page.locator("[data-catalog-game]").first().getAttribute("data-catalog-game");
  await page.locator("[data-infinite-scroll]").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-catalog-game]")).toHaveCount(50);
  await expect(page.locator(`[data-catalog-game="${initial}"]`)).toBeVisible();
  await page.getByLabel("Search titles").fill("Hades");
  await expect(page.locator("[data-catalog-game]")).toHaveCount(1);
  await page.getByRole("combobox", { name: "Genre", exact: true }).selectOption("Roguelike");
  await expect(page.getByRole("heading", { name: "Hades", exact: true })).toBeVisible();
  await page.getByLabel("Search titles").fill("absent-game");
  await expect(page.getByRole("heading", { name: "No games match these filters" })).toBeVisible();
  await page.getByRole("button", { name: "Show all games" }).click();
  await expect(page.locator("[data-catalog-game]")).toHaveCount(25);
  await expect(page.locator("[data-infinite-scroll]")).toHaveCount(1);
});

test("search supports keyboard selection and returns to its originating route", async ({ page }) => {
  await page.goto("/games");
  await expect(page.getByText("⌘K", {exact:true})).toHaveCount(0);
  await page.keyboard.press("Control+k");
  await expect(page).toHaveURL(/\/games$/);
  await page.keyboard.press("Meta+k");
  await expect(page).toHaveURL(/\/games$/);
  await page.goto("/games");
  await page.getByRole("link", { name: "Open game search" }).filter({ visible: true }).click();
  await expect(page.getByRole("dialog", { name: "Search the game catalog" })).toBeVisible();
  await page.getByRole("textbox", { name: "Search titles, profiles and commands" }).fill("Hades");
  await page.getByRole("textbox", { name: "Search titles, profiles and commands" }).press("Enter");
  await expect(page).toHaveURL(/\/game\/hades$/);
  await expect(page.getByRole("heading", { name: "Hades", exact: true })).toBeVisible();
  await page.goto("/search?q=&from=/games");
  await page.getByRole("dialog").press("Escape");
  await expect(page).toHaveURL(/\/games$/);
});

test("theme and Argentine Spanish persist across navigation and reload", async ({ page, context }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.getByRole("button", { name: "Switch to Spanish (Argentina)" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");
  await page.getByRole("navigation", { name: "Navegación principal" }).filter({ visible: true }).getByRole("link", { name: "Juegos", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");
  await expect(page.getByRole("button", { name: "Cambiar a inglés" })).toBeVisible();
  const cookies = await context.cookies();
  expect(cookies.find((cookie) => cookie.name === "playlogg_theme")?.value).toBe("light");
  expect(cookies.find((cookie) => cookie.name === "playlogg_locale")?.value).toBe("es-AR");
});

test("navigation stays usable and layouts avoid horizontal page overflow", async ({ page }) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Main navigation" }).filter({ visible: true });
  await expect(navigation.getByRole("link", { name: "Profile", exact: true })).toHaveCount(0);
  await page.locator("header").getByRole("link", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  for (const [name, path] of [["Games", "/games"], ["Compare", "/compare"], ["Discover", "/"]]) {
    await navigation.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path === "/" ? "/" : path}$`));
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test("homepage omits the spotlight and links to the game catalog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Editor's Spotlight", {exact:true})).toHaveCount(0);
  await expect(page.getByRole("heading", {name:"Build your gaming identity.", exact:true})).toBeVisible();
  const hero=await page.locator("main header").boundingBox();const catalog=await page.locator("main section").filter({has:page.getByRole("heading",{name:"Games worth exploring",exact:true})}).boundingBox();expect(hero!.x).toBe(catalog!.x);expect(hero!.width).toBe(catalog!.width);
  await page.getByRole("link", {name:"Explore All Games", exact:true}).click();
  await expect(page).toHaveURL(/\/games$/);
  await page.goto("/compare");
  await expect(page.getByText("Choose two published profiles to see their shared games and scores.")).toBeVisible();
  await expect(page.locator("footer").getByText("Privacy", { exact: true })).toHaveCount(0);
});



test("Games URLs retain filters and loaded results through reload, sharing and history", async ({page}) => {
  await page.goto("/games?page=2");
  await expect(page.locator("[data-catalog-game]")).toHaveCount(50);
  await page.reload();
  await expect(page.locator("[data-catalog-game]")).toHaveCount(50);
  await page.getByLabel("Search titles").fill("Hades");
  await expect(page).toHaveURL(/q=Hades$/);
  await expect(page.getByRole("heading",{name:"Hades",exact:true})).toBeVisible();
  await page.getByRole("combobox",{name:"Genre",exact:true}).selectOption("Roguelike");
  await expect(page).toHaveURL(/q=Hades&genre=Roguelike$/);
  await page.reload();
  await expect(page.getByLabel("Search titles")).toHaveValue("Hades");
  await expect(page.getByRole("combobox",{name:"Genre",exact:true})).toHaveValue("Roguelike");
  await page.getByRole("link",{name:"Open game search"}).filter({visible:true}).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("dialog").press("Escape");
  await expect(page).toHaveURL(/q=Hades&genre=Roguelike$/);
  await page.getByRole("button",{name:"Clear filters"}).click();
  await expect(page).toHaveURL(/\/games$/);
  await page.goBack();
  await expect(page.getByLabel("Search titles")).toHaveValue("Hades");
  await page.goForward();
  await expect(page.getByLabel("Search titles")).toHaveValue("");
  await page.goto("/games?genre=Unknown&sort=invalid&page=-1");
  await expect(page.getByRole("heading",{name:"No games match these filters"})).toBeVisible();
  await expect(page.getByRole("combobox",{name:"Genre",exact:true})).toHaveValue("Unknown");
});

test("Games automatically append batches on scroll and reset with filters",async({page,request})=>{
  const catalogSize=(await (await request.get("http://127.0.0.1:3101/__state")).json()).games.length;
  await page.goto("/games");
  await expect(page.getByRole("combobox",{name:"Games to show",exact:true})).toHaveCount(0);
  await expect(page.locator("[data-catalog-game]")).toHaveCount(25);
  await page.locator("[data-infinite-scroll]").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-catalog-game]")).toHaveCount(50);
  await expect(page).toHaveURL(/page=2$/);
  const slugs=await page.locator("[data-catalog-game]").evaluateAll(nodes=>nodes.map(node=>node.getAttribute("data-catalog-game")));
  expect(new Set(slugs).size).toBe(slugs.length);
  await page.reload();
  await expect(page.locator("[data-catalog-game]")).toHaveCount(50);
  while(await page.locator("[data-catalog-game]").count()<catalogSize){
    const before=await page.locator("[data-catalog-game]").count();
    await page.locator("[data-infinite-scroll]").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-catalog-game]")).toHaveCount(Math.min(before+25,catalogSize));
  }
  await expect(page.locator("[data-infinite-scroll]")).toHaveCount(0);
  await page.getByLabel("Search titles").fill("Hades");
  await expect(page.locator("[data-catalog-game]")).toHaveCount(1);
  await expect(page).toHaveURL(/q=Hades$/);
  await page.getByRole("button",{name:"Clear filters",exact:true}).click();
  await page.evaluate(()=>window.scrollTo(0,0));
  await expect(page.locator("[data-catalog-game]")).toHaveCount(25);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});


test("platform filter shows main families and groups the remaining platforms under Other", async ({page}) => {
  await page.goto("/games");
  const platform = page.getByRole("combobox", {name: "Platform", exact: true});
  await expect(platform.locator("option")).toHaveText(["All platforms", "PC", "PlayStation", "Xbox", "Nintendo", "Other"]);
  for (const family of ["PlayStation", "Xbox", "Nintendo"]) {
    await platform.selectOption(family);
    await expect(page.locator("[data-catalog-game]")).toHaveCount(1);
    await expect(page.getByRole("heading", {name: "Elden Ring: Shadow of the Erdtree", exact: true})).toBeVisible();
  }
  await platform.selectOption("Other");
  await expect(page.locator("[data-catalog-game]")).toHaveCount(2);
  await expect(page.getByRole("heading", {name: "Hades", exact: true})).toBeVisible();
  await page.reload(); await expect(platform).toHaveValue("Other");
  await platform.selectOption("PC");
  await expect(page).toHaveURL(/platform=PC/);
  await expect(page.locator("[data-catalog-game]")).toHaveCount(25);
  await expect(page.getByRole("heading", {name: "Fixture Game 01", exact: true})).toBeVisible();
  await expect(page.getByRole("heading", {name: "Hades", exact: true})).toHaveCount(0);
  while(await page.getByRole("heading", {name: "Hades", exact: true}).count()===0){
    const before=await page.locator("[data-catalog-game]").count();
    await page.locator("[data-infinite-scroll]").scrollIntoViewIfNeeded();
    await expect.poll(()=>page.locator("[data-catalog-game]").count()).toBeGreaterThan(before);
  }
  await expect(page.getByRole("heading", {name: "Hades", exact: true})).toBeVisible();
  await page.goto("/games?platform=Android");
  await expect(platform).toHaveValue("Android");
  await expect(platform.locator('option[value="Android"]')).toHaveAttribute("hidden", "");
  await expect(page.locator("[data-catalog-game]")).toHaveCount(1);
});


test("saved tags link game details and catalog cards to a persistent combined filter",async({page,context})=>{
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  await page.locator("#add-tag").click();
  await page.getByLabel("Tag label",{exact:true}).fill("Co-op & friends");
  await page.locator("#confirm-tag").click();
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/game/hades");
  await page.getByRole("link",{name:"Co-op & friends",exact:true}).click();
  await expect(page).toHaveURL(/tag=Co-op/);
  await expect(page.locator("[data-catalog-game]")).toHaveCount(1);
  const filter=page.getByRole("combobox",{name:"Tag",exact:true});
  await expect(filter).toHaveValue("Co-op & friends");
  await page.reload();await expect(filter).toHaveValue("Co-op & friends");
  await page.getByLabel("Search titles").fill("missing-title");
  await expect(page.locator("[data-catalog-game]")).toHaveCount(0);
  await page.getByRole("button",{name:"Clear filters",exact:true}).click();
  await expect(filter).toHaveValue("");
  await page.getByLabel("Search titles").fill("Hades");
  await page.locator('[data-catalog-game="hades"]').getByRole("link",{name:"Co-op & friends",exact:true}).click();
  await expect(filter).toHaveValue("Co-op & friends");
  await expect(page.getByLabel("Search titles")).toHaveValue("Hades");
  await expect(page.locator("[data-catalog-game]")).toHaveCount(1);
});
