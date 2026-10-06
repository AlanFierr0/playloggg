import {test,expect} from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Local fixture only.
import {authCookie} from "./fixture-server.mjs";

test("dragging between tiers saves only the owner's tier and persists on reload",async({page,context,request},info)=>{
  await context.addCookies([authCookie]);await page.goto("/tiers");
  const before=await (await request.get("http://127.0.0.1:3101/__state")).json();
  const card=page.locator('[data-tier-game="elden-ring-shadow-of-the-erdtree"]');
  // The fixture catalog has many games, but this owner has only one saved log.
  await expect(page.locator('[data-tier-game]')).toHaveCount(1);
  await expect(page.locator('[data-tier-game="hades"]')).toHaveCount(0);
  await expect(page.locator("#tier-b").locator(card)).toBeVisible();
  await card.dragTo(page.locator("#tier-a"));
  await expect(page.getByRole("status")).toHaveText("Tier saved.");
  await expect(page.locator("#tier-a").locator(card)).toBeVisible();
  await page.reload();await expect(page.locator("#tier-a").locator(card)).toBeVisible();
  const after=await (await request.get("http://127.0.0.1:3101/__state")).json();
  for(const row of before.ratings){const saved=after.ratings.find((r:{profile_id:number;game_id:number})=>r.profile_id===row.profile_id&&r.game_id===row.game_id);if(row.profile_id===2&&row.game_id===2){const {tier,updated_at,...details}=row;void tier;void updated_at;expect(saved).toMatchObject({...details,tier:"A"});}else expect(saved).toEqual(row);}
  await page.screenshot({path:`e2e-artifacts/tier-drag-${info.project.name}.png`});
});

test("pointer handle moves a game, supports cancellation and keeps navigation available",async({page,context})=>{
  await context.addCookies([authCookie]);await page.goto("/tiers");
  const handle=page.getByRole("button",{name:"Drag to change tier: Elden Ring: Shadow of the Erdtree",exact:true});
  await handle.scrollIntoViewIfNeeded();
  let source=(await handle.boundingBox())!;
  await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();
  await page.mouse.move(source.x+15,source.y-15);await page.keyboard.press("Escape");await page.mouse.up();
  await expect(page.locator('#tier-b [data-tier-game="elden-ring-shadow-of-the-erdtree"]')).toBeVisible();
  await page.locator("#tier-a").scrollIntoViewIfNeeded();await handle.scrollIntoViewIfNeeded();
  source=(await handle.boundingBox())!;
  await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();
  if((await page.locator("#tier-a").boundingBox())!.y<112){
    await page.mouse.move(source.x+source.width/2,40,{steps:12});
    await expect.poll(async()=>(await page.locator("#tier-a").boundingBox())!.y).toBeGreaterThan(112);
  }
  const target=(await page.locator("#tier-a").boundingBox())!;
  await page.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:12});await page.mouse.up();
  await expect(page.locator('#tier-a [data-tier-game="elden-ring-shadow-of-the-erdtree"]')).toBeVisible();
  await page.getByRole("link",{name:"Elden Ring: Shadow of the Erdtree",exact:true}).click();await expect(page).toHaveURL(/\/game\/elden-ring-shadow-of-the-erdtree$/);
});

test("keyboard tier changes can clear assignment and failed saves keep the existing tier",async({page,context,request})=>{
  await context.addCookies([authCookie]);await page.goto("/tiers");
  const selector=page.getByRole("combobox",{name:"Tier for Elden Ring: Shadow of the Erdtree",exact:true});
  await selector.focus();
  await request.post("http://127.0.0.1:3101/__fail-save");await selector.selectOption("S");
  await expect(page.getByRole("status")).toContainText("Tier could not be saved");
  await expect(selector).toHaveValue("B");await expect(page.locator('#tier-b [data-tier-game="elden-ring-shadow-of-the-erdtree"]')).toBeVisible();
  await selector.focus();await selector.press("Home");await selector.press("Enter");
  await expect(page.locator('#tier-unassigned [data-tier-game="elden-ring-shadow-of-the-erdtree"]')).toBeVisible();
  await page.reload();await expect(selector).toHaveValue("");
  expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
});

test("another user's public tier board has no editing or dragging controls",async({page,context})=>{
  await context.addCookies([authCookie]);await page.goto("/u/fixture_public/tiers");
  await expect(page.locator('[data-tier-game="hades"]')).toBeVisible();
  await expect(page.locator('[data-tier-game][draggable="true"]')).toHaveCount(0);
  await expect(page.getByRole("combobox")).toHaveCount(0);
  await expect(page.getByRole("button",{name:/Drag to change tier/})).toHaveCount(0);
  await expect(page.getByRole("button",{name:/Clear tier for/})).toHaveCount(0);
});

test("compact board clears a tier while preserving the log entry",async({page,context,request},info)=>{
  await context.addCookies([authCookie]);await page.goto("/tiers");
  const before=(await (await request.get("http://127.0.0.1:3101/__state")).json()).ratings;
  await expect(page.locator('[data-tier-game] .material-symbols-outlined').filter({hasText:"drag_indicator"})).toHaveCount(0);
  const columns=await page.locator("#tier-b > div").last().evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(" ").length);
  expect(columns).toBeGreaterThanOrEqual(info.project.name==="mobile"?3:8);
  await page.getByRole("button",{name:"Clear tier for Elden Ring: Shadow of the Erdtree",exact:true}).click();
  await expect(page.locator('#tier-unassigned [data-tier-game="elden-ring-shadow-of-the-erdtree"]')).toBeVisible();
  await expect(page.getByRole("button",{name:/Clear tier for/})).toHaveCount(0);
  await page.reload();await expect(page.getByRole("combobox",{name:"Tier for Elden Ring: Shadow of the Erdtree",exact:true})).toHaveValue("");
  const after=(await (await request.get("http://127.0.0.1:3101/__state")).json()).ratings;
  expect(after).toHaveLength(before.length);
  for(const row of before){const saved=after.find((r:{profile_id:number;game_id:number})=>r.profile_id===row.profile_id&&r.game_id===row.game_id);if(row.profile_id===2&&row.game_id===2){const {tier,updated_at,...details}=row;void tier;void updated_at;expect(saved).toMatchObject({...details,tier:null});}else expect(saved).toEqual(row);}
  const card=page.locator('[data-tier-game="elden-ring-shadow-of-the-erdtree"]');
  const expandedHeight=(await card.boundingBox())!.height;
  await page.getByRole("combobox").selectOption("A");
  await expect(page.locator('#tier-a [data-tier-game="elden-ring-shadow-of-the-erdtree"]')).toBeVisible();
  await expect.poll(async()=>(await card.boundingBox())!.height).toBeLessThan(expandedHeight);
  await expect(card.locator("select")).toHaveClass(/sr-only/);
  await expect.poll(async()=>(await card.locator("select").boundingBox())!.height).toBeLessThanOrEqual(1);
  await expect(card.locator('.material-symbols-outlined').filter({hasText:"drag_indicator"})).toHaveCount(0);
  await page.screenshot({path:`e2e-artifacts/tier-compact-${info.project.name}.png`,fullPage:true});
});

test("touch dragging scrolls to an offscreen tier and saves it",async({page,context},info)=>{
  test.skip(info.project.name!=="mobile","Touch gesture uses the mobile layout.");
  await context.addCookies([authCookie]);await page.goto("/tiers");
  const handle=page.getByRole("button",{name:"Drag to change tier: Elden Ring: Shadow of the Erdtree",exact:true});
  await handle.scrollIntoViewIfNeeded();const source=(await handle.boundingBox())!;
  const session=await context.newCDPSession(page);
  const touch=(type:"touchStart"|"touchMove"|"touchEnd",x=0,y=0)=>session.send("Input.dispatchTouchEvent",{type,touchPoints:type==="touchEnd"?[]:[{x,y,id:1}]});
  await touch("touchStart",source.x+source.width/2,source.y+source.height/2);
  await touch("touchMove",source.x+source.width/2,40);
  await expect.poll(async()=>(await page.locator("#tier-a").boundingBox())!.y).toBeGreaterThan(112);
  const target=(await page.locator("#tier-a").boundingBox())!;
  await touch("touchMove",target.x+target.width/2,target.y+target.height/2);
  await touch("touchEnd");
  await expect(page.locator('#tier-a [data-tier-game="elden-ring-shadow-of-the-erdtree"]')).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("Tier saved.");
});
