import { test, expect } from "./test";
// @ts-expect-error Test-only fixture session.
import { authCookie } from "./fixture-server.mjs";

test("older editors cannot overwrite a newer entry and retain their draft", async ({page,context}) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=elden-ring-shadow-of-the-erdtree");
  const other = await context.newPage();
  await other.goto("/log?game=elden-ring-shadow-of-the-erdtree");
  await page.locator("#dispatch-textarea").fill("My original draft");
  await other.locator("#dispatch-textarea").fill("Newer saved review");
  await other.locator("#commit-rating").click();
  await expect(other).toHaveURL(/\/profile$/);
  await page.locator("#commit-rating").click();
  await expect(page.getByRole("alert").filter({hasText:"This entry changed"})).toContainText("This entry changed in another tab");
  await expect(page.locator("#dispatch-textarea")).toHaveValue("My original draft");
  const state = await (await fetch("http://127.0.0.1:3101/__state")).json();
  expect(state.ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===2).review).toBe("Newer saved review");
  await page.getByRole("button",{name:"Discard draft and reload latest entry",exact:true}).click();
  await expect(page.locator("#dispatch-textarea")).toHaveValue("Newer saved review");
  await other.close();
});

test("switching games and refreshing preserve an unfinished entry", async ({page,context}) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  await page.locator("#dispatch-textarea").fill("Keep this unfinished review");
  await page.getByRole("link",{name:"Switch Game",exact:true}).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/game=hades/);
  await expect(page.locator("#dispatch-textarea")).toHaveValue("Keep this unfinished review");
  await page.reload();
  await expect(page.locator("#dispatch-textarea")).toHaveValue("Keep this unfinished review");
  await page.locator("#discard-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/log?game=hades");
  await expect(page.locator("#dispatch-textarea")).toHaveValue("");
});

test("future completion dates cannot be saved", async ({page,context}) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  const today=new Date().toISOString().slice(0,10);
  await expect(page.locator("#date-input")).toHaveAttribute("max",today);
  await page.locator("#score-display").fill("95");
  await page.locator("#date-input").fill("2099-01-01");
  await page.locator("#dispatch-textarea").fill("Keep my review even with an invalid date");
  await page.reload();
  await expect(page.locator("#dispatch-textarea")).toHaveValue("Keep my review even with an invalid date");
  await expect(page.locator("#date-input")).toHaveValue("2099-01-01");
  await expect(page.locator("#score-display")).toHaveValue("95");
  await page.locator("#commit-rating").click();
  await expect(page.getByRole("status")).toContainText("Completion date cannot be in the future");
  expect((await (await fetch("http://127.0.0.1:3101/__state")).json()).ratings.some((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===1)).toBe(false);
});

test("public rankings have an automatic fallback and show one view at a time", async ({page}) => {
  await page.goto("/u/fixture_public/ranking");
  await expect(page.getByRole("heading",{name:"Score ranking",exact:true})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Personal ranking",exact:true})).toBeHidden();
  await page.getByRole("button",{name:"Personal order",exact:true}).click();
  await expect(page.locator("[data-ranking-game]").first()).toBeVisible();
  await expect(page.getByRole("heading",{name:"Score ranking",exact:true})).toBeHidden();
  await expect(page.getByText("No logged games match these filters.")).toHaveCount(0);
});

test("reference review sources are links and profiles exclude unrelated catalog games", async ({page}) => {
  await fetch("http://127.0.0.1:3101/__source-review",{method:"POST"});
  await page.goto("/u/fixture_public/reviews");
  await expect(page.getByRole("link",{name:"https://www.youtube.com/watch?v=example",exact:true})).toHaveAttribute("target","_blank");
  expect(await page.content()).not.toContain("Fixture Game 119");
  await page.goto("/profile/activity");
  await expect(page.getByRole("heading",{name:"Nothing to play here.",exact:true})).toBeVisible();
});

test("unknown playtime is distinguished from a recorded zero", async ({page,context}) => {
  await context.addCookies([authCookie]);
  await page.goto("/profile");
  const total=page.locator("dt").filter({hasText:"Total hours played"}).locator("..");
  await expect(total.locator("dd > span").first()).toHaveText("—");
  await expect(total).toContainText("0 / 1 Games with recorded hours");
  await page.goto("/u/fixture_public");
  await expect(total.locator("dd > span").first()).toHaveText("0");
});


test("a manually placed game keeps its position after another score changes", async ({page,context}) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  await page.locator("#score-display").fill("90");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/profile/ranking");
  await expect(page.locator("[data-ranking-game]").first()).toContainText("Hades");
  await page.getByRole("textbox",{name:"Position for Hades",exact:true}).fill("2");
  await page.keyboard.press("Tab");
  await expect(page.getByText("Personal ranking saved. Scores and tiers are unchanged.", {exact:true})).toBeVisible();
  const saved = await (await fetch("http://127.0.0.1:3101/__state")).json();
  expect(saved.ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===1).score).toBe(90);
  await page.goto("/log?game=elden-ring-shadow-of-the-erdtree");
  await page.locator("#score-display").fill("20");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/profile/ranking");
  await expect(page.locator("[data-ranking-game]").nth(1)).toContainText("Hades");
  await page.reload();
  await expect(page.locator("[data-ranking-game]").nth(1)).toContainText("Hades");
});


test("unchanged legacy date and hours do not block a review edit", async ({page,context}) => {
  await context.addCookies([authCookie]);
  await fetch("http://127.0.0.1:3101/__legacy-entry",{method:"POST"});
  await page.goto("/log?game=elden-ring-shadow-of-the-erdtree");
  await page.locator("#dispatch-textarea").fill("Review changed without rewriting history");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  const state=await (await fetch("http://127.0.0.1:3101/__state")).json();
  const entry=state.ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===2);
  expect(entry.review).toBe("Review changed without rewriting history");
  expect(entry.hours_played).toBe(1e9);
  expect(entry.completed_on).toBe("2099-01-01");
});

test("closing global search preserves profile, directory and comparison context", async ({page}) => {
  for(const path of ["/u/fixture_public/ranking","/people?q=Fixture&page=1","/compare?left=fixture_other&right=fixture_public&page=1"]){
    await page.goto(path);
    await page.getByRole("link",{name:"Open game search",exact:true}).filter({visible:true}).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"$"));
  }
});


test("public entry downloads only its selected rating and no unrelated reviews",async({page,request})=>{
 await request.post("http://127.0.0.1:3101/__source-review");
 await page.goto("/u/fixture_public/game/fixture-game-0");
 await expect(page.getByRole("heading",{name:"Fixture Game 00",exact:true}).first()).toBeVisible();
 expect(await page.content()).not.toContain("https://www.youtube.com/watch?v=example");
});


test("optional community score failure leaves game details and logging available",async({page,request})=>{
 await request.post("http://127.0.0.1:3101/__community-failure");
 await page.goto("/game/hades");
 await expect(page.getByRole("heading",{name:"Hades",exact:true})).toBeVisible();
 await expect(page.getByRole("link",{name:"Log this game",exact:true})).toBeVisible();
 await expect(page.getByText("Community score could not be loaded.",{exact:true})).toBeVisible();
});
