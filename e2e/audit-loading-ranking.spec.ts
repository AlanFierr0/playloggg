import {test,expect} from "./test";
// @ts-expect-error Local fixture only.
import {authCookie} from "./fixture-server.mjs";
const fixture="http://127.0.0.1:3101";

test("ranking queues immediate changes and restores failed drafts after refresh",async({page,context,request})=>{
  await context.addCookies([authCookie]);await request.post(`${fixture}/__ranking-edit`);
  await page.goto("/profile/ranking");await request.post(`${fixture}/__ranking-delay`);
  await page.getByRole("button",{name:"Move Hades down",exact:true}).click();
  await expect(page.locator("[data-ranking-game]").first()).toContainText("Elden Ring");
  await page.getByRole("button",{name:"Move Fixture Game 00 up",exact:true}).click();
  await expect(page.locator("[data-ranking-game]").nth(1)).toContainText("Fixture Game 00");
  await expect(page.getByRole("status").filter({hasText:"Personal ranking saved"})).toBeVisible();
  await expect.poll(async()=>{const s=await (await request.get(`${fixture}/__state`)).json();return s.rankings[0]?.game_ids;}).toEqual([2,3,1]);
  await request.post(`${fixture}/__fail-save`);
  await page.getByRole("button",{name:"Move Hades up",exact:true}).click();
  await expect(page.getByRole("status")).toContainText("draft has been kept");
  await page.reload();await expect(page.getByRole("status")).toContainText("Unsaved ranking restored");
  await expect(page.locator("[data-ranking-game]").nth(1)).toContainText("Hades");
  await page.getByRole("button",{name:"Retry saving ranking",exact:true}).click();
  await expect(page.getByRole("status")).toContainText("Personal ranking saved");
  await page.reload();await expect(page.locator("[data-ranking-game]").nth(1)).toContainText("Hades");
});

test("invalid hidden ranges are revealed and focused",async({page,context})=>{
  await context.addCookies([authCookie]);await page.goto("/tiers");
  const minimum=page.getByRole("spinbutton",{name:"Minimum score for tier F",exact:true});
  await minimum.fill("");await page.getByRole("button",{name:"Tier S",exact:true}).click();
  await page.getByRole("button",{name:"Save score ranges",exact:true}).click();
  await expect(minimum).toBeVisible();await expect(minimum).toBeFocused();
  await expect(page.getByRole("status")).toContainText("Check the highlighted score range");
});

test("optional home review failures leave the personal home usable",async({page,context,request})=>{
  await context.addCookies([authCookie]);await request.post(`${fixture}/__home-failure`);
  await page.goto("/");await expect(page.getByRole("heading",{name:/Welcome back/})).toBeVisible();
  await expect(page.getByText("Some community suggestions are unavailable. Try refreshing the page.", {exact:true})).toBeVisible();
  await expect(page.getByRole("link",{name:"Log a game",exact:true}).last()).toBeVisible();
});

test("search keeps reviews out of its payload and Log excludes scored provider matches",async({page,context,request})=>{
  await context.addCookies([authCookie]);
  const response=await page.goto("/search?q=Elden");
  expect(await response!.text()).not.toContain("Private fixture review");
  await request.post(`${fixture}/__ranking-edit`);await page.goto("/log");
  await page.getByRole("textbox",{name:"Search titles and profiles"}).fill("Hades");
  await expect(page.getByRole("dialog").getByText("No games found. Try another title.",{exact:true})).toBeVisible();
  await expect(page.locator('[data-search-result][href="/log?game=hades"]')).toHaveCount(0);
  await expect(page.getByRole("button",{name:/^Import Hades/})).toHaveCount(0);
});

test("ranking conflicts keep the draft and require explicit acknowledgement before retry",async({page,context,request})=>{
  await context.addCookies([authCookie]);await request.post(`${fixture}/__ranking-edit`);
  await page.goto("/profile/ranking");
  const other=await context.newPage();await other.goto("/profile/ranking");
  await page.getByRole("button",{name:"Move Hades down",exact:true}).click();
  await expect(page.getByRole("status")).toContainText("Personal ranking saved");
  await other.getByRole("button",{name:"Move Fixture Game 00 up",exact:true}).click();
  await expect(other.getByRole("status")).toContainText("Ranking changed elsewhere");
  await expect(other.getByRole("button",{name:"Retry saving ranking",exact:true})).toHaveCount(0);
  await expect(other.getByRole("button",{name:"Discard unsaved ranking",exact:true})).toBeVisible();
  await other.getByRole("button",{name:"Keep my order and retry",exact:true}).click();
  await expect(other.getByRole("status")).toContainText("Personal ranking saved");
  await other.reload();await expect(other.locator("[data-ranking-game]").nth(1)).toContainText("Fixture Game 00");
  await other.close();
});
