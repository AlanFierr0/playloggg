import { test, expect } from "./test";

// Stable named fixture games, independent of production catalog contents.
test("catalog combines filters, paginates, clears and handles empty results", async ({ page }) => {
  await page.goto("/games");
  await expect(page.locator("[data-catalog-game]")).toHaveCount(24);
  await page.getByRole("button", { name: "Next →", exact: true }).click();
  await expect(page.getByText("Page 2 of 2", { exact: true })).toBeVisible();
  await page.getByLabel("Search titles").fill("Hades");
  await expect(page.locator("[data-catalog-game]")).toHaveCount(1);
  await page.getByRole("combobox", { name: "Genre", exact: true }).selectOption("Roguelike");
  await expect(page.getByRole("heading", { name: "Hades", exact: true })).toBeVisible();
  await page.getByLabel("Search titles").fill("absent-game");
  await expect(page.getByRole("heading", { name: "No games match these filters" })).toBeVisible();
  await page.getByRole("button", { name: "Show all games" }).click();
  await expect(page.locator("[data-catalog-game]")).toHaveCount(24);
  await expect(page.getByText("Page 1 of 2", { exact: true })).toBeVisible();
});

test("search supports keyboard selection and returns to its originating route", async ({ page }) => {
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
  for (const [name, path] of [["Games", "/games"], ["Rankings", "/profile"], ["Lists", "/tiers"], ["Compare", "/compare"], ["Discover", "/"]]) {
    await navigation.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path === "/" ? "/" : path}$`));
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test("sample actions are honest and guest Shelf requires sign-in", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Sample editorial selection. Scores and quotes on this page are illustrative.")).toBeVisible();
  await page.getByRole("link", { name: /Shelf/i }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/compare");
  await expect(page.getByText("Choose two published profiles to see their shared games and scores.")).toBeVisible();
  await expect(page.locator("footer").getByText("Privacy", { exact: true })).toHaveCount(0);
});


test("Share copies only the catalog URL and offers a fallback when clipboard is denied", async ({ page }) => {
  await page.goto("/");
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


test("Games URLs retain filters and pages through reload, sharing and history", async ({page}) => {
  await page.goto("/games?page=2");
  await expect(page.getByText("Page 2 of 2", {exact:true})).toBeVisible();
  await page.reload();
  await expect(page.locator("[data-catalog-game]")).toHaveCount(2);
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
