import { test, expect } from "./test";
// @ts-expect-error Node-only fixture exports a cookie descriptor.
import { authCookie } from "./fixture-server.mjs";
import { readFile } from "node:fs/promises";
test("quick rating retains drafts, retries failures and saves twenty entries without full editors", async ({
  page,
  context,
}) => {
  await context.addCookies([authCookie]);
  await page.goto("/quick-rate");
  await page.getByLabel("Search titles", { exact: true }).fill("Hades");
  await page.getByRole("button", { name: "Hades", exact: true }).click();
  await page.getByLabel("Score", { exact: true }).fill("87");
  await page.getByLabel("Search titles", { exact: true }).fill("Elden Ring");
  await page
    .getByRole("button", {
      name: "Elden Ring: Shadow of the Erdtree",
      exact: true,
    })
    .click();
  await page.getByLabel("Search titles", { exact: true }).fill("Hades");
  await page.getByRole("button", { name: "Hades", exact: true }).click();
  await expect(page.getByLabel("Score", { exact: true })).toHaveValue("87");
  await fetch("http://127.0.0.1:3101/__fail-save", { method: "POST" });
  await page.getByRole("button", { name: "Save entry", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "kept" }),
  ).toBeVisible();
  await expect(page.getByLabel("Score", { exact: true })).toHaveValue("87");
  for (let i = 0; i < 20; i++) {
    const name = `Fixture Game ${String(i).padStart(2, "0")}`;
    await page.getByLabel("Search titles", { exact: true }).fill(name);
    await page.getByRole("button", { name, exact: true }).click();
    await page
      .getByLabel("Playback status", { exact: true })
      .selectOption("backlog");
    await page.getByRole("button", { name: "Save entry", exact: true }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "saved" }),
    ).toBeVisible();
  }
  await page.reload();
  await page
    .getByLabel("Search titles", { exact: true })
    .fill("Fixture Game 00");
  await page
    .getByRole("button", { name: "Fixture Game 00", exact: true })
    .click();
  await expect(page.getByLabel("Playback status", { exact: true })).toHaveValue(
    "backlog",
  );
  await expect(page.getByLabel("Score", { exact: true })).toHaveValue("");
  const state = await (await fetch("http://127.0.0.1:3101/__state")).json();
  expect(
    state.ratings.filter(
      (row: { profile_id: number; status: string }) =>
        row.profile_id === 2 && row.status === "backlog",
    ),
  ).toHaveLength(20);
});
test("independent ranking saves a pairwise choice without changing scores", async ({
  page,
  context,
}) => {
  await context.addCookies([authCookie]);
  await page.goto("/quick-rate");
  await page.getByLabel("Search titles", { exact: true }).fill("Hades");
  await page.getByRole("button", { name: "Hades", exact: true }).click();
  await page.getByLabel("Score", { exact: true }).fill("90");
  await page.getByRole("button", { name: "Save entry", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "saved" }),
  ).toBeVisible();
  await page.goto("/profile/ranking");
  await page.getByText("Which game do you prefer?", { exact: true }).click();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await page.getByRole("button", { name: "Hades", exact: true }).click();
  await page
    .getByRole("button", { name: "Save personal ranking", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Personal ranking saved" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("ol").first().locator("li").first()).toContainText(
    "Hades",
  );
  const state = await (await fetch("http://127.0.0.1:3101/__state")).json();
  expect(
    state.ratings.find(
      (row: { profile_id: number; game_id: number }) =>
        row.profile_id === 2 && row.game_id === 1,
    ).score,
  ).toBe(90);
});
test("discovery is separate from publishing and unpublishing clears consent", async ({
  page,
  context,
}) => {
  await context.addCookies([authCookie]);
  await page.goto("/settings");
  await expect(
    page.getByRole("button", { name: "Join discovery", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Publish profile", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Join discovery", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Join discovery", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Leave discovery", exact: true }),
  ).toBeVisible();
  await page.goto("/people");
  await expect(page.getByRole("link", { name: /Fixture Owner/ })).toBeVisible();
  await page.goto("/settings");
  await page
    .getByRole("button", { name: "Make profile private", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Join discovery", exact: true }),
  ).toBeDisabled();
  await page.goto("/people");
  await expect(page.getByRole("link", { name: /Fixture Owner/ })).toHaveCount(
    0,
  );
});
test("lists save description and unranked mode while private exports stay owned", async ({
  page,
  context,
  browser,
}) => {
  await context.addCookies([authCookie]);
  await page.goto("/lists");
  await page.getByLabel("List name", { exact: true }).fill("My actual list");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Independent favorites");
  await page.getByLabel("Ranked list", { exact: true }).uncheck();
  await page.locator('[data-add-game="hades"]').click();
  await page.getByRole("button", { name: "Save list", exact: true }).click();
  await expect(page).toHaveURL(/\/lists\/11$/);
  await page.reload();
  await expect(page.getByLabel("Description", { exact: true })).toHaveValue(
    "Independent favorites",
  );
  await expect(
    page.getByLabel("Ranked list", { exact: true }),
  ).not.toBeChecked();
  expect((await page.request.get("/api/share/list?id=11")).status()).toBe(200);
  const guest = await browser.newContext();
  expect(
    (
      await guest.request.get("http://127.0.0.1:3100/api/share/list?id=11")
    ).status(),
  ).toBe(404);
  await guest.close();
});
test("social controls support follow and unfollow without block controls", async ({
  page,
  context,
}) => {
  await context.addCookies([authCookie]);
  await page.goto("/u/fixture_public");
  await page.getByRole("button", { name: "Follow", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Unfollow", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Unfollow", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Follow", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Block", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Unblock", exact: true })).toHaveCount(0);
});
test("share cards export correct PNG sizes and reject private public handles", async ({
  page,
  context,
}) => {
  await context.addCookies([authCookie]);
  await page.goto("/profile");
  for (const [value, width, height] of [
    ["square", 1080, 1080],
    ["story", 1080, 1920],
    ["landscape", 1920, 1080],
  ] as const) {
    await page
      .getByLabel("Share card format", { exact: true })
      .selectOption(value);
    const downloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download share card", exact: true })
      .click();
    const download = await downloadPromise;
    const bytes = await readFile((await download.path())!);
    expect(bytes.subarray(1, 4).toString()).toBe("PNG");
    expect(bytes.readUInt32BE(16)).toBe(width);
    expect(bytes.readUInt32BE(20)).toBe(height);
  }
  expect(
    (
      await page.request.get("/api/share/profile?handle=fixture_owner")
    ).status(),
  ).toBe(404);
});

test("signed-in users can like and unlike a public list",async({page,context})=>{await context.addCookies([authCookie]);await page.goto("/u/fixture_public/lists/10");await page.getByRole("button",{name:"Like",exact:true}).click();await expect(page.getByRole("button",{name:"Unlike",exact:true})).toBeVisible();await page.reload();await expect(page.getByRole("button",{name:"Unlike",exact:true})).toBeVisible();await page.getByRole("button",{name:"Unlike",exact:true}).click();await expect(page.getByRole("button",{name:"Like",exact:true})).toBeVisible();});
test("taste neighbors show real match and overlap after five shared scored games",async({page,context})=>{await context.addCookies([authCookie]);await page.goto("/quick-rate");for(const [name,score] of [["Hades","0"],["Fixture Game 00","50"],["Fixture Game 01","50"],["Fixture Game 02","50"],["Fixture Game 03","50"]]){await page.getByLabel("Search titles",{exact:true}).fill(name);await page.getByRole("button",{name,exact:true}).click();await page.getByLabel("Score",{exact:true}).fill(score);await page.getByRole("button",{name:"Save entry",exact:true}).click();await expect(page.getByRole("status").filter({hasText:"saved"})).toBeVisible();}await page.goto("/");const section=page.locator("section").filter({has:page.getByRole("heading",{name:"Taste neighbors",exact:true})});await expect(section).toContainText("100% Taste Match");await expect(section).toContainText("5 Shared scored games");expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);});
