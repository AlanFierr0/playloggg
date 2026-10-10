import { test, expect } from "./test";
// @ts-expect-error Node-only fixture exports a cookie descriptor.
import { authCookie } from "./fixture-server.mjs";
import { readFile } from "node:fs/promises";
test("independent ranking saves a pairwise choice without changing scores", async ({
  page,
  context,
}, testInfo) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  await page.locator("#score-slider").fill("90");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/profile/ranking");
  await page.getByText("Which game do you prefer?", { exact: true }).click();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await page.getByRole("button", { name: "Hades", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Personal ranking saved" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("ol").first().locator("li").first()).toContainText(
    "Hades",
  );
  await expect(page.getByText("Manage your games", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Save personal ranking", exact: true })).toHaveCount(0);
  const rows = page.locator("[data-ranking-game]");
  const hades = page.locator('[data-ranking-game="hades"]');
  const elden = page.locator('[data-ranking-game="elden-ring-shadow-of-the-erdtree"]');
  const position = page.getByRole("textbox", { name: "Position for Hades", exact: true });
  await position.fill("2");
  await position.press("Enter");
  await expect(rows.first()).toContainText("Elden Ring");
  await expect(position).toHaveValue("2");
  await expect(position).toBeEnabled();
  await hades.dragTo(elden);
  await expect(rows.first()).toContainText("Hades");
  await expect(position).toBeEnabled();
  const handle = hades.getByRole("button", { name: "Drag to reorder: Hades", exact: true });
  const handleBox = (await handle.boundingBox())!;
  const targetBox = (await elden.boundingBox())!;
  if (testInfo.project.name === "mobile") {
    const session = await context.newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: handleBox.x + handleBox.width / 2, y: handleBox.y + handleBox.height / 2, id: 1 }] });
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: targetBox.x + targetBox.width / 2, y: targetBox.y + targetBox.height / 2, id: 1 }] });
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await session.detach();
  } else {
    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 6 });
    await page.mouse.up();
  }
  await expect(rows.first()).toContainText("Elden Ring");
  await expect(position).not.toBeFocused();
  await expect(page.getByRole("status").filter({ hasText: "Personal ranking saved" })).toBeVisible();
  await page.reload();
  await expect(rows.first()).toContainText("Elden Ring");
  await expect(position).toHaveValue("2");
  await page.getByRole("button", { name: "Move Hades up", exact: true }).click();
  await expect(rows.first()).toContainText("Hades");
  await expect(position).toBeEnabled();
  await position.fill("");
  await position.press("Enter");
  await expect(position).toHaveValue("1");
  await position.fill("999");
  await position.press("Enter");
  await expect(position).toHaveValue("2");
  await expect(position).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `e2e-artifacts/ranking-edit-${testInfo.project.name}.png`, fullPage: true });
  await fetch("http://127.0.0.1:3101/__fail-save", { method: "POST" });
  await page.getByRole("button", { name: "Move Hades up", exact: true }).click();
  await expect(rows.first()).toContainText("Hades");
  await expect(page.getByRole("status").filter({ hasText: "Ranking could not be saved. Your draft has been kept." })).toBeVisible();
  await page.getByRole("button", { name: "Retry saving ranking", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Personal ranking saved" })).toBeVisible();
  await page.reload();
  await expect(rows.first()).toContainText("Hades");
  await page.getByRole("textbox", { name: "Search your games", exact: true }).fill("Elden");
  await expect(rows).toHaveCount(1);
  const eldenPosition = page.getByRole("textbox", { name: /^Position for Elden Ring/ });
  await expect(eldenPosition).toHaveValue("2");
  await eldenPosition.fill("1");
  await eldenPosition.press("Enter");
  await expect(eldenPosition).toBeEnabled();
  await page.getByRole("textbox", { name: "Search your games", exact: true }).fill("");
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toContainText("Elden Ring");
  await page.reload();
  await expect(rows.first()).toContainText("Elden Ring");
  const state = await (await fetch("http://127.0.0.1:3101/__state")).json();
  expect(
    state.ratings.find(
      (row: { profile_id: number; game_id: number }) =>
        row.profile_id === 2 && row.game_id === 1,
    ).score,
  ).toBe(90);
  expect(state.ratings.find((row: { profile_id: number; game_id: number }) => row.profile_id === 2 && row.game_id === 2)).toMatchObject({ score: 80, tier: "B" });
  await page.goto("/u/fixture_public/ranking");
  await expect(page.getByRole("textbox", { name: /^Position for/ })).toHaveCount(0);
  await expect(page.locator('[data-ranking-game][draggable="true"]')).toHaveCount(0);
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
  await page.getByRole("button", { name: "Leave discovery", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Join discovery", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Join discovery", exact: true }).click();
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
test("profile hides share controls; comparison cards export correct PNG sizes and reject private handles", async ({
  page,
  context,
}) => {
  await context.addCookies([authCookie]);
  await page.goto("/profile");
  await expect(page.getByLabel("Share card format", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Download share card", exact: true })).toHaveCount(0);
  await page.goto("/u/fixture_public");
  await expect(page.getByRole("button", { name: "Download share card", exact: true })).toHaveCount(0);
  await context.clearCookies();
  await page.goto("/compare?left=fixture_public&right=fixture_peer");
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

test("taste neighbors show real match and overlap after five shared scored games", async({page,context},testInfo)=>{
 await context.addCookies([authCookie]);
 for(const [slug,score] of [["hades","0"],["fixture-game-0","50"],["fixture-game-1","50"],["fixture-game-2","50"],["fixture-game-3","50"]]) {
  await page.goto(`/log?game=${slug}`);await page.getByRole("button",{name:"Add score",exact:true}).click();await page.locator("#score-slider").fill(score);await page.locator("#commit-rating").click();await expect(page).toHaveURL(/\/profile$/);
 }
 await page.goto("/");const section=page.locator("section").filter({has:page.getByRole("heading",{name:"Taste neighbors",exact:true})});await expect(section).toContainText("100% Taste Match");await expect(section).toContainText("5 Shared scored games");
 await expect(section.getByRole("img",{name:"Published Fixture initials",exact:true})).toHaveText("PF");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await section.screenshot({path:`e2e-artifacts/taste-neighbors-${testInfo.project.name}.png`});
});


test("game details show followed profiles ratings, preserve zero and hide them after unfollow", async ({ page, context }, testInfo) => {
  await context.addCookies([authCookie]);
  const headers = { Authorization: `Bearer ${JSON.parse(Buffer.from(authCookie.value.slice(7), "base64url").toString()).access_token}` };
  expect((await page.request.post("http://127.0.0.1:3101/rest/v1/profile_follows", { headers, data: { follower_id: 2, followed_id: 1 } })).ok()).toBe(true);
  await page.goto("/game/hades");
  await expect(page.getByRole("heading", { name: "Friends’ ratings", exact: true })).toHaveCount(0);
  await page.goto("/u/fixture_public");
  await page.getByRole("button", { name: "Follow", exact: true }).click();
  await expect(page.getByRole("button", { name: "Unfollow", exact: true })).toBeVisible();
  await page.goto("/game/hades");
  const section = page.getByRole("region", { name: "Friends’ ratings", exact: true });
  await expect(section.getByRole("link", { name: /Published Fixture/ })).toHaveAttribute("href", "/u/fixture_public/game/hades");
  await expect(section.getByText("0 / 100", { exact: true })).toBeVisible();
  await expect(section.getByText("Tier S", { exact: true })).toBeVisible();
  await section.screenshot({ path: `e2e-artifacts/friends-game-ratings-${testInfo.project.name}.png` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(section.getByText("Unavailable Fixture", { exact: true })).toHaveCount(0);
  await expect(section.getByText("Published Peer", { exact: true })).toHaveCount(0);
  expect((await page.request.post("http://127.0.0.1:3101/rest/v1/profile_blocks", { headers, data: { blocker_id: 2, blocked_id: 3 } })).ok()).toBe(true);
  await page.reload();
  await expect(section).toHaveCount(0);
  expect((await page.request.delete("http://127.0.0.1:3101/rest/v1/profile_blocks?blocker_id=eq.2&blocked_id=eq.3", { headers })).ok()).toBe(true);
  await page.reload();
  await expect(section).toBeVisible();
  await section.getByRole("link", { name: /Published Fixture/ }).click();
  await expect(page.getByRole("heading", { name: "Published Fixture's log entry", exact: true })).toBeVisible();
  await page.goto("/game/elden-ring-shadow-of-the-erdtree");
  await expect(section).toHaveCount(0);
  await page.goto("/u/fixture_public");
  await page.getByRole("button", { name: "Unfollow", exact: true }).click();
  await expect(page.getByRole("button", { name: "Follow", exact: true })).toBeVisible();
  await page.goto("/game/hades");
  await expect(section).toHaveCount(0);
  await context.clearCookies();
  await page.reload();
  await expect(section).toHaveCount(0);
});

test("profile hot take shows the largest personal and public score gap", async ({ page, context }, testInfo) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  await page.locator("#score-slider").fill("100");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  const take = page.getByRole("region", {name:"Hot take",exact:true});
  await expect(take.getByRole("link", {name:"Hades",exact:true})).toBeVisible();
  await expect(take).toContainText("50.0 points higher than the community");
  await expect(take).toContainText("50.0 / 100");
  await page.goto("/u/fixture_public");
  await expect(take).toContainText("50.0 points lower than the community");
  await take.screenshot({path:`e2e-artifacts/profile-hot-take-${testInfo.project.name}.png`});
  await expect(take.getByRole("link", {name:"Hades",exact:true})).toHaveAttribute("href","/u/fixture_public/game/hades");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
