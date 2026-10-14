import {test,expect} from "./test";
// @ts-expect-error Test-only fixture identity.
import {authCookie} from "./fixture-server.mjs";

test("Nintendo and other platform choices persist through the editor and stats",async({page,context})=>{
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  await page.getByRole("button",{name:"Nintendo",exact:true}).click();
  await page.getByRole("menuitemradio",{name:"Nintendo Switch",exact:true}).click();
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/log?game=hades");
  await expect(page.getByRole("button",{name:"Nintendo",exact:true})).toHaveAttribute("aria-pressed","true");
  await page.getByRole("button",{name:"Other platforms",exact:true}).click();
  await page.getByRole("menuitemradio",{name:"Android",exact:true}).click();
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/profile/stats");
  await expect(page.getByText("Android",{exact:true})).toBeVisible();
  const state=await(await fetch("http://127.0.0.1:3101/__state")).json();
  expect(state.ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===1).platform).toBe("other_android");
});

test("ongoing games have their own summary and do not lower completion",async({page,context})=>{
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  await page.locator("#status-group").getByRole("button",{name:"Currently playing",exact:true}).click();
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/log?game=elden-ring-shadow-of-the-erdtree");
  await page.locator("#status-group").getByRole("button",{name:"Completed",exact:true}).click();
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/profile/stats");
  await expect(page.locator("dt").filter({hasText:"Finishable-game completion"}).locator("..").locator("dd")).toHaveText("100%");
  await expect(page.locator("dt").filter({hasText:/^Ongoing games$/}).locator("..").locator("dd")).toHaveText("1");
});

test("leaving during Steam import keeps its queue and rating selection for resume",async({page,context})=>{
  await context.addCookies([authCookie]);
  await fetch("http://127.0.0.1:3101/__steam-user",{method:"POST"});
  await page.goto("/profile/import/steam");
  await page.getByRole("checkbox",{name:"Select game Hades",exact:true}).check();
  await page.getByRole("checkbox",{name:"Select game Steam Fixture Adventure",exact:true}).check();
  await page.route("**/profile/import/steam",async route=>{
    if(route.request().method()==="POST")await new Promise(resolve=>setTimeout(resolve,1000));
    await route.continue().catch(()=>{});
  });
  await page.getByRole("button",{name:"Import selected games (2)",exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem("playlogg-steam-import:2")??"null")?.pending.length)).toBe(2);
  await page.goto("/profile");
  await page.unroute("**/profile/import/steam");
  await page.goto("/profile/import/steam");
  await page.getByRole("button",{name:"Resume import (2)",exact:true}).click();
  const dialog=page.getByRole("dialog");
  await expect(dialog.getByRole("heading",{name:"Hades",exact:true})).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem("playlogg-steam-import:2"))).toBeNull();
  await expect(dialog.getByRole("textbox",{name:"Score",exact:true})).toHaveValue("");
});

test("Steam recovery replays acknowledged blank entries without overwriting manual changes",async({page,context})=>{
  await context.addCookies([authCookie]);
  await fetch("http://127.0.0.1:3101/__steam-user",{method:"POST"});
  await page.goto("/profile/import/steam");
  await page.getByRole("checkbox",{name:"Select game Hades",exact:true}).check();
  await page.getByRole("button",{name:"Import selected games (1)",exact:true}).click();
  await page.getByRole("dialog").getByRole("button",{name:"Skip this game",exact:true}).click();
  await page.getByRole("dialog").getByRole("button",{name:"Done",exact:true}).click();
  await expect(page.getByText("Import complete. Your games are saved in your profile.")).toBeVisible();
  await page.evaluate(()=>localStorage.setItem("playlogg-steam-import:2",JSON.stringify({version:1,rows:[{appId:101,title:"Hades",hours:1.5,matched:true,logged:false,cover:null,genres:["Action"]}],pending:[101],rateIds:[101],total:1,imported:0,skipped:0})));
  await page.reload();
  await page.getByRole("button",{name:"Resume import (1)",exact:true}).click();
  await expect(page.getByRole("dialog").getByRole("heading",{name:"Hades",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Close rating session",exact:true}).click();
  await page.goto("/log?game=hades");
  await page.locator("#score-display").fill("92");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.evaluate(()=>{localStorage.removeItem("playlogg-steam-ratings:2");localStorage.setItem("playlogg-steam-import:2",JSON.stringify({version:1,rows:[{appId:101,title:"Hades",hours:1.5,matched:true,logged:false,cover:null,genres:[]}],pending:[101],rateIds:[101],total:1,imported:0,skipped:0}));});
  await page.goto("/profile/import/steam");
  await page.getByRole("button",{name:"Resume import (1)",exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem("playlogg-steam-import:2"))).toBeNull();
  const state=await(await fetch("http://127.0.0.1:3101/__state")).json();
  expect(state.ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===1).score).toBe(92);
  await expect(page.getByRole("dialog").getByRole("heading",{name:"Hades",exact:true})).toHaveCount(0);
});
