import { test, expect } from "./test";
// @ts-expect-error Node-only fixture exports a cookie descriptor.
import { authCookie } from "./fixture-server.mjs";
import { readFile } from "node:fs/promises";
test("independent ranking saves a pairwise choice without changing scores", async ({
  page,
  context,
}) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  await page.locator("#score-slider").fill("90");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
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

test("taste neighbors show real match and overlap after five shared scored games", async({page,context})=>{
 await context.addCookies([authCookie]);
 for(const [slug,score] of [["hades","0"],["fixture-game-0","50"],["fixture-game-1","50"],["fixture-game-2","50"],["fixture-game-3","50"]]) {
  await page.goto(`/log?game=${slug}`);await page.getByRole("button",{name:"Add score",exact:true}).click();await page.locator("#score-slider").fill(score);await page.locator("#commit-rating").click();await expect(page).toHaveURL(/\/profile$/);
 }
 await page.goto("/");const section=page.locator("section").filter({has:page.getByRole("heading",{name:"Taste neighbors",exact:true})});await expect(section).toContainText("100% Taste Match");await expect(section).toContainText("5 Shared scored games");
});
