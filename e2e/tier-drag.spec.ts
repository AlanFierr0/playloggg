import {test,expect} from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Local fixture only.
import {authCookie} from "./fixture-server.mjs";

test("dragging keeps the chosen tier for only the owner and persists on reload",async({page,context,request},info)=>{
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
  for(const row of before.ratings){const saved=after.ratings.find((r:{profile_id:number;game_id:number})=>r.profile_id===row.profile_id&&r.game_id===row.game_id);if(row.profile_id===2&&row.game_id===2){const {tier,tier_manual,updated_at,...details}=row;void tier;void tier_manual;void updated_at;expect(saved).toMatchObject({...details,tier:"A",tier_manual:true});}else expect(saved).toEqual(row);}
  await page.screenshot({path:`e2e-artifacts/tier-drag-${info.project.name}.png`});
});

test("pointer dragging keeps the chosen tier, supports cancellation and keeps navigation available",async({page,context})=>{
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
  await page.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:12});
  await expect(page.locator("[data-tier-drag-preview]")).toBeVisible();
  await page.screenshot({path:"e2e-artifacts/tier-drag-preview.png"});
  await page.mouse.up();
  await expect(page.locator("[data-tier-drag-preview]")).toHaveCount(0);
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
  await expect(selector).toBeFocused();await expect(selector).toBeInViewport();
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
  const remove=page.getByRole("button",{name:"Clear tier for Elden Ring: Shadow of the Erdtree",exact:true});
  await page.mouse.move(0,0);
  if(await page.evaluate(()=>matchMedia("(hover: hover)").matches)){
    await expect(remove).toHaveCSS("opacity","0");
    await remove.focus();await expect(remove).toHaveCSS("opacity","1");
    await remove.blur();
  }
  // Scroll before hovering; locator.click can scroll the card away from the pointer.
  await remove.scrollIntoViewIfNeeded();
  await page.locator('[data-tier-game="elden-ring-shadow-of-the-erdtree"]').hover();
  await expect(remove).toHaveCSS("opacity","1");
  await expect(remove).toHaveCSS("pointer-events","auto");
  const clearButton=(await remove.boundingBox())!;
  await page.mouse.click(clearButton.x+clearButton.width/2,clearButton.y+clearButton.height/2);
  await expect(page.locator('#tier-unassigned [data-tier-game="elden-ring-shadow-of-the-erdtree"]')).toBeVisible();
  await expect(page.getByRole("button",{name:/Clear tier for/})).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("Tier saved.");
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
  await expect(card.locator("select")).toBeFocused();
  expect((await card.locator("select").boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.keyboard.press("Tab");
  await expect.poll(async()=>(await card.locator("select").boundingBox())!.height).toBeLessThanOrEqual(1);
  await expect(card.locator('.material-symbols-outlined').filter({hasText:"drag_indicator"})).toHaveCount(0);
  await page.screenshot({path:`e2e-artifacts/tier-compact-${info.project.name}.png`,fullPage:true});
});

test("touch dragging scrolls to an offscreen tier and keeps the chosen tier",async({page,context},info)=>{
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


test("tier selection filters the colored board instead of jumping to an anchor",async({page,context},info)=>{
  await context.addCookies([authCookie]);
  for(const route of ["/tiers","/u/fixture_public/tiers"]){
    await page.goto(route);
    await page.getByRole("button",{name:"Tier B",exact:true}).click();
    await expect(page.locator("[data-tier-drop]:visible")).toHaveCount(1);
    await expect(page.locator("#tier-b")).toBeVisible();
    await expect(page.locator("#tier-b")).toHaveCSS("background-color","rgb(255, 223, 127)");
    await expect(page.getByRole("button",{name:"Tier B",exact:true})).toHaveAttribute("aria-pressed","true");
    await expect(page).toHaveURL(new RegExp(route+"$"));
    await page.getByRole("button",{name:"Tier S",exact:true}).click();
    await expect(page.locator("[data-tier-drop]:visible")).toHaveCount(1);
    await expect(page.locator("#tier-s")).toHaveCSS("background-color","rgb(255, 127, 127)");
    await expect(page.locator("#tier-b")).toBeHidden();
    await page.screenshot({path:`e2e-artifacts/tier-filter-${route==="/tiers"?"owner":"public"}-${info.project.name}.png`});
    await page.getByRole("button",{name:"Unassigned",exact:true}).click();
    await expect(page.locator("[data-tier-drop]:visible")).toHaveCount(1);
    await expect(page.locator("#tier-unassigned")).toBeVisible();
    await page.getByRole("button",{name:"All tiers",exact:true}).click();
    await expect(page.locator("[data-tier-drop]:visible")).toHaveCount(route==="/tiers"?7:6);
  }
});


test("score ranges persist, preserve manual games and support opting back into automation",async({page,context,request},info)=>{
 await context.addCookies([authCookie]);await page.goto("/tiers");
 const card='[data-tier-game="elden-ring-shadow-of-the-erdtree"]';
 await expect(page.getByRole("button",{name:/Use score range for/})).toHaveCount(0);
 await expect(page.getByText("Edit score ranges",{exact:true})).toHaveCount(0);
 const min=page.getByRole("spinbutton",{name:"Minimum score for tier B",exact:true});
 await min.fill("81");await page.getByRole("button",{name:"Save score ranges",exact:true}).click();
 await expect(page.getByRole("status")).toHaveText("Score ranges saved. Manual tiers were kept.");
 await expect(page.locator('#tier-b '+card)).toBeVisible();
 await page.locator(card).dragTo(page.locator("#tier-unassigned"));
 await expect(page.locator('#tier-unassigned '+card)).toBeVisible();
 await page.getByRole("combobox",{name:"Tier for Elden Ring: Shadow of the Erdtree",exact:true}).selectOption("A");
 await expect(page.locator('#tier-a '+card)).toBeVisible();
 await min.fill("80");await page.getByRole("button",{name:"Save score ranges",exact:true}).click();
 await expect(page.getByRole("status")).toHaveText("Score ranges saved. Manual tiers were kept.");
 await expect(page.locator('#tier-a '+card)).toBeVisible();
 await page.reload();await expect(min).toHaveValue("80");
 await page.locator(card).dragTo(page.locator("#tier-b"));
 await expect(page.locator('#tier-b '+card)).toBeVisible();
 await page.getByRole("spinbutton",{name:"Minimum score for tier S",exact:true}).fill("90");
 await page.getByRole("button",{name:"Save score ranges",exact:true}).click();
 await expect(page.getByRole("status")).toHaveText("Use non-overlapping whole-number ranges from 0 to 100.");
 const state=await(await request.get("http://127.0.0.1:3101/__state")).json();
 expect(state.ratings.find((r:{profile_id:number;game_id:number})=>r.profile_id===2&&r.game_id===2)).toMatchObject({score:80,tier:"B",tier_manual:false});
 await page.getByRole("spinbutton",{name:"Minimum score for tier S",exact:true}).fill("95");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 for(const theme of ["dark","light"]){
  await context.addCookies([{name:"playlogg_theme",value:theme,url:"http://127.0.0.1:3100"}]);
  await page.reload();
  expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
  await page.locator("#tier-b").screenshot({path:`e2e-artifacts/tier-range-editor-${theme}-${info.project.name}.png`});
 }
 await page.screenshot({path:`e2e-artifacts/tier-ranges-${info.project.name}.png`,fullPage:true});
});

test("saving scores automatically assigns tiers until a manual move overrides them",async({page,context,request})=>{
 await context.addCookies([authCookie]);
 for(const score of [96,75]){
  await page.goto("/log?game=hades");await page.locator("#score-display").fill(String(score));
  await page.locator("#commit-rating").click();await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/tiers");await expect(page.locator(`#tier-${score===96?'s':'c'} [data-tier-game="hades"]`)).toBeVisible();
 }
 await page.locator('[data-tier-game="hades"]').dragTo(page.locator("#tier-a"));
 await expect(page.locator('#tier-a [data-tier-game="hades"]')).toBeVisible();
 await expect(page.getByRole("status")).toHaveText("Tier saved.");
 await page.goto("/log?game=hades");await page.locator("#score-display").fill("25");
 await page.locator("#commit-rating").click();await expect(page).toHaveURL(/\/profile$/);
 await page.goto("/tiers");await expect(page.locator('#tier-a [data-tier-game="hades"]')).toBeVisible();
 const state=await(await request.get("http://127.0.0.1:3101/__state")).json();
 expect(state.ratings.find((r:{profile_id:number;game_id:number})=>r.profile_id===2&&r.game_id===1)).toMatchObject({score:25,tier:"A",tier_manual:true});
});


test("tier moves update immediately while saves queue, and failed saves only undo their own game", async ({page, context, request}) => {
  await context.addCookies([authCookie]);
  await page.goto("/log?game=hades");
  await page.locator("#score-display").fill("96");
  await page.locator("#commit-rating").click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/tiers");
  let holdNext = true;
  let release: (() => void) | undefined;
  let posts = 0;
  await page.route("**/tiers", async route => {
    if (route.request().method() === "POST") {
      posts++;
      if (holdNext) {holdNext = false; await new Promise<void>(resolve => {release = resolve;});}
    }
    await route.continue();
  });
  const hades = page.locator('[data-tier-game="hades"]');
  const elden = page.locator('[data-tier-game="elden-ring-shadow-of-the-erdtree"]');
  await hades.dragTo(page.locator("#tier-a"));
  await expect(page.locator("#tier-a").locator(hades)).toBeVisible();
  await expect.poll(() => Boolean(release)).toBe(true);
  await expect(elden.getByRole("button", {name: /Drag to change tier/})).toBeEnabled();
  await elden.dragTo(page.locator("#tier-c"));
  await expect(page.locator("#tier-c").locator(elden)).toBeVisible();
  await hades.dragTo(page.locator("#tier-d"));
  await expect(page.locator("#tier-d").locator(hades)).toBeVisible();
  await expect(page.getByRole("status")).toContainText("(3)");
  expect(posts).toBe(1);
  release!();
  await expect(page.getByRole("status")).toHaveText("Tier saved.");
  expect(posts).toBe(3);
  await page.reload();
  await expect(page.locator("#tier-d").locator(hades)).toBeVisible();
  await expect(page.locator("#tier-c").locator(elden)).toBeVisible();
  holdNext = true; release = undefined;
  await request.post("http://127.0.0.1:3101/__fail-save");
  await hades.dragTo(page.locator("#tier-f"));
  await expect(page.locator("#tier-f").locator(hades)).toBeVisible();
  await expect.poll(() => Boolean(release)).toBe(true);
  await elden.dragTo(page.locator("#tier-a"));
  await expect(page.locator("#tier-a").locator(elden)).toBeVisible();
  release!();
  await expect(page.getByRole("status")).toContainText("Tier could not be saved");
  await expect(page.locator("#tier-d").locator(hades)).toBeVisible();
  await expect(page.locator("#tier-a").locator(elden)).toBeVisible();
  const state = await (await request.get("http://127.0.0.1:3101/__state")).json();
  expect(state.ratings.find((row: {profile_id: number; game_id: number}) => row.profile_id === 2 && row.game_id === 1)).toMatchObject({score: 96, tier: "D", tier_manual: true});
  expect(state.ratings.find((row: {profile_id: number; game_id: number}) => row.profile_id === 2 && row.game_id === 2)).toMatchObject({score: 80, tier: "A", tier_manual: true});
  await page.reload();
  await expect(page.locator("#tier-d").locator(hades)).toBeVisible();
  await expect(page.locator("#tier-a").locator(elden)).toBeVisible();
});
