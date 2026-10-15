import { test, expect } from "./test";
// @ts-expect-error Isolated local fixture identity.
import { authCookie } from "./fixture-server.mjs";

const game = "elden-ring-shadow-of-the-erdtree";

test("save, remove and Back return through the originating game and filtered collection", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  const origin = "/games?q=Elden&library=logged&size=50";
  await page.goto(origin);
  await page.getByRole("link", {name: "Elden Ring: Shadow of the Erdtree", exact: true}).first().click();
  await expect(page).toHaveURL(`/game/${game}`);
  await page.getByRole("link", {name: "Edit log entry", exact: true}).click();
  await page.locator("#score-display").fill("88");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(`/game/${game}`);
  await expect(page.getByText("88 / 100", {exact: true}).first()).toBeVisible();
  await page.getByRole("link", {name: "Edit log entry", exact: true}).click();
  await page.getByRole("button", {name: "Remove log", exact: true}).click();
  await page.getByRole("button", {name: "Remove permanently", exact: true}).click();
  await expect(page).toHaveURL(`/game/${game}`);
  await expect(page.getByRole("link", {name: "Log this game", exact: true})).toBeVisible();
  await page.getByRole("link", {name: "← Back", exact: true}).click();
  await expect(page).toHaveURL(origin);
});

test("closing and discarding an editor keep the origin after a refresh", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto(`/game/${game}`);
  await page.getByRole("link", {name: "Edit log entry", exact: true}).click();
  await expect(page).toHaveURL(`/log?game=${game}`);
  await expect(page.locator("#score-display")).toBeVisible();
  await page.reload();
  await page.getByRole("link", {name: "Close modal", exact: true}).click();
  await expect(page).toHaveURL(`/game/${game}`);
  await page.getByRole("link", {name: "Edit log entry", exact: true}).click();
  await page.locator("#score-display").fill("12");
  await page.locator("#discard-rating").click();
  await expect(page).toHaveURL(`/game/${game}`);
  await page.getByRole("link", {name: "Edit log entry", exact: true}).click();
  await expect(page.locator("#score-display")).not.toHaveValue("12");
});

test("saving after picking and switching games returns to the original profile tab", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto("/profile/stats");
  await page.getByRole("link", {name: "Log a game", exact: true}).click();
  const search = page.getByRole("textbox", {name: "Search titles and profiles"});
  await search.fill("Hades");
  await page.locator('[data-search-result][href="/log?game=hades"]').click();
  await page.getByRole("link", {name: "Switch Game", exact: true}).click();
  await search.fill("Fixture Game 00");
  await page.locator('[data-search-result][href="/log?game=fixture-game-0"]').click();
  await page.locator("#score-display").fill("71");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL("/profile/stats");
});

test("search, settings and import Back controls follow the preceding page", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto("/profile/ranking");
  await page.getByRole("link", {name: "Open game search", exact: true}).filter({visible: true}).first().click();
  await page.getByRole("button", {name: "Close search", exact: true}).click();
  await expect(page).toHaveURL("/profile/ranking");
  await page.locator('a[href="/settings"]').first().click();
  await page.getByRole("link", {name: "Import from Steam", exact: true}).click();
  await page.getByRole("link", {name: "← Back", exact: true}).click();
  await expect(page).toHaveURL("/settings");
  await page.getByRole("link", {name: "← Back", exact: true}).click();
  await expect(page).toHaveURL("/profile/ranking");
});

test("direct editor visits keep the safe profile fallback", async ({ page, context }) => {
  await context.addCookies([authCookie]);
  await page.goto(`/log?game=${game}`);
  await page.getByRole("link", {name: "Close modal", exact: true}).click();
  await expect(page).toHaveURL("/profile");
});

test("finishing imported ratings returns to the page that opened the import", async ({page, context, request}) => {
  await context.addCookies([authCookie]);
  await request.post("http://127.0.0.1:3101/__steam-user");
  await page.goto("/settings");
  await page.getByRole("link", {name: "Import from Steam", exact: true}).click();
  await page.getByRole("checkbox", {name: "Select game Hades", exact: true}).check();
  await page.getByRole("button", {name: "Import selected games (1)", exact: true}).click();
  const dialog = page.getByRole("dialog", {name: "Rate imported games", exact: true});
  await dialog.getByRole("button", {name: "Skip this game", exact: true}).click();
  await dialog.getByRole("button", {name: "Done", exact: true}).click();
  await expect(page).toHaveURL("/settings");
});
