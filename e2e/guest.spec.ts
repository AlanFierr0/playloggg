import { test, expect } from "./test";

// Stable named fixture games, independent of production catalog contents.
test("catalog combines filters, loads more, clears and handles empty results", async ({ page }) => {
  await page.goto("/games");
  await expect(page.locator("[data-catalog-game]")).toHaveCount(25);
  const initial = await page.locator("[data-catalog-game]").first().getAttribute("data-catalog-game");
  await page.getByRole("button", { name: "Load more", exact: true }).click();
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
  await expect(page.getByRole("button", { name: "Load more", exact: true })).toBeVisible();
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
  for (const [name, path] of [["Games", "/games"], ["Profile", "/login"], ["Compare", "/compare"], ["Discover", "/"]]) {
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


test("Share copies only the catalog URL and offers a fallback when clipboard is denied", async ({ page }) => {
  await page.goto("/game/elden-ring-shadow-of-the-erdtree");
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, "writeText", { configurable: true, value: async (url: string) => { document.documentElement.dataset.copied = url; } });
  });
  await page.getByRole("button", { name: "Copy game link" }).click();
  await expect(page.getByText("Game link copied. Your profile visibility has not changed.")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-copied", "http://127.0.0.1:3100/game/elden-ring-shadow-of-the-erdtree");
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, "writeText", { configurable: true, value: async () => { throw new Error("Fixture clipboard denial"); } });
  });
  await page.getByRole("button", { name: "Copy game link" }).click();
  await expect(page.getByRole("textbox", { name: "Game link", exact: true })).toHaveValue("http://127.0.0.1:3100/game/elden-ring-shadow-of-the-erdtree");
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

test("Games amount selector supports 25, 50, 100 and all while retaining filters",async({page})=>{
  await page.goto("/games");
  const amount=page.getByRole("combobox",{name:"Games to show",exact:true});
  await expect(amount).toHaveValue("25");
  for(const size of [50,100]) {
    await amount.selectOption(String(size));
    await expect(page.locator("[data-catalog-game]")).toHaveCount(size);
    await expect(page.getByRole("button",{name:"Load more",exact:true})).toBeVisible();
    await page.getByRole("button",{name:"Load more",exact:true}).click();
    await expect(page.locator("[data-catalog-game]")).toHaveCount(Math.min(size*2,122));
  }
  await expect(page.getByRole("button",{name:"Load more",exact:true})).toHaveCount(0);
  await amount.selectOption("all");
  await expect(page).toHaveURL(/size=all$/);
  await expect(page.locator("[data-catalog-game]")).toHaveCount(122);
  await expect(page.getByRole("button",{name:"Load more",exact:true})).toHaveCount(0);
  await page.reload();await expect(amount).toHaveValue("all");
  await page.getByLabel("Search titles").fill("Hades");
  await expect(page.locator("[data-catalog-game]")).toHaveCount(1);
  await expect(amount).toHaveValue("all");
  await page.getByRole("button",{name:"Clear filters",exact:true}).click();
  await expect(page.locator("[data-catalog-game]")).toHaveCount(122);
  await amount.selectOption("25");
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
  await page.getByRole("combobox", {name: "Games to show", exact: true}).selectOption("all");
  await expect(page).toHaveURL(/size=all/);
  await expect(page.getByRole("heading", {name: "Hades", exact: true})).toBeVisible();
  await page.goto("/games?platform=Android");
  await expect(platform).toHaveValue("Android");
  await expect(platform.locator('option[value="Android"]')).toHaveAttribute("hidden", "");
  await expect(page.locator("[data-catalog-game]")).toHaveCount(1);
});
