import {test,expect} from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Local fixture only.
import {authCookie} from "./fixture-server.mjs";

test("Steam sync updates only PC playtime, preserves personal details and retries failures",async({page,context})=>{
  await context.addCookies([authCookie]);
  await fetch("http://127.0.0.1:3101/__steam-user",{method:"POST"});
  await fetch("http://127.0.0.1:3101/__steam-sync-entry",{method:"POST"});
  await page.goto("/profile/import/steam");
  await page.getByRole("checkbox",{name:"Select game Hades",exact:true}).check();
  await page.getByRole("button",{name:"Import selected games (1)",exact:true}).click();
  await expect(page.getByText("Import complete. Your games are saved in your profile.")).toBeVisible();
  await expect(page.getByRole("checkbox",{name:"Select game Hades",exact:true})).toHaveCount(0);
  await fetch("http://127.0.0.1:3101/__steam-playtime",{method:"POST"});
  const before=await (await fetch("http://127.0.0.1:3101/__state")).json();
  await fetch("http://127.0.0.1:3101/__fail-save",{method:"POST"});
  await page.getByRole("button",{name:"Sync Steam playtime",exact:true}).click();
  await expect(page.getByText(/Some playtimes could not be synced/)).toBeVisible();
  await page.getByRole("button",{name:"Sync Steam playtime",exact:true}).click();
  await expect(page.getByText(/Playtime synced\. Other entry details were kept unchanged/)).toBeVisible();
  const after=await (await fetch("http://127.0.0.1:3101/__state")).json();
  for(const row of before.ratings) {
    const saved=after.ratings.find((item:{profile_id:number;game_id:number})=>item.profile_id===row.profile_id&&item.game_id===row.game_id);
    if(row.profile_id===2 && row.platform==="pc") {
      const {hours_played:oldHours,updated_at:oldDate,...details}=row;
      void oldHours;void oldDate;
      expect(saved).toMatchObject(details);
      expect(saved.hours_played).toBe(row.game_id===1?3:5);
    } else expect(saved).toEqual(row);
  }
  await page.getByRole("button",{name:"Sync Steam playtime",exact:true}).click();
  await expect(page.getByText(/Updated games: 0/)).toBeVisible();
  expect((await (await fetch("http://127.0.0.1:3101/__state")).json()).ratings).toEqual(after.ratings);
  await page.reload();
  await expect(page.getByText("126 Steam games",{exact:false})).toBeVisible();
  await expect(page.getByRole("checkbox",{name:"Select game Hades",exact:true})).toHaveCount(0);
});

test("Steam import previews, selects, saves trusted playtime and preserves existing entries",async({page,context},testInfo)=>{
  await context.addCookies([authCookie]);
  await fetch("http://127.0.0.1:3101/__steam-user",{method:"POST"});
  await page.goto("/profile");
  await page.getByRole("link",{name:"Import from Steam",exact:true}).click();
  await expect(page.getByRole("button",{name:"Preview Steam library"})).toHaveCount(0);
  await expect(page.getByText("127 Steam games",{exact:false})).toBeVisible();
  await expect(page.getByRole("checkbox",{name:"Select game Elden Ring",exact:true})).toHaveCount(0);
  await expect(page.getByRole("checkbox",{name:"Select game Unmatched Fixture",exact:true})).toBeDisabled();
  let state=await (await fetch("http://127.0.0.1:3101/__state")).json();
  expect(state.ratings.filter((row:{profile_id:number})=>row.profile_id===2)).toHaveLength(1);
  await expect(page.getByRole("checkbox")).toHaveCount(25);
  await page.getByRole("button",{name:"Load more",exact:true}).click();
  await expect(page.getByRole("checkbox")).toHaveCount(50);
  await page.getByRole("checkbox",{name:"Select game Hades",exact:true}).check();
  await page.getByRole("checkbox",{name:"Select game Steam Fixture Adventure",exact:true}).check();
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:`e2e-artifacts/steam-library-${testInfo.project.name}.png`});
  expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
  await page.getByRole("button",{name:"Import selected games (2)",exact:true}).click();
  await expect(page.getByText("Import complete. Your games are saved in your profile.")).toBeVisible();
  state=await (await fetch("http://127.0.0.1:3101/__state")).json();
  const own=state.ratings.filter((row:{profile_id:number})=>row.profile_id===2);
  expect(own).toHaveLength(3);
  expect(own.find((row:{game_id:number})=>row.game_id===1)).toMatchObject({hours_played:1.5,platform:"pc",score:null,tier:null,status:null,review:null,tags:[]});
  expect(own.find((row:{game_id:number})=>row.game_id===2)).toMatchObject({score:80,tier:"B",status:"playing",review:"Private fixture review",hours_played:null});
  expect(own.filter((row:{game_id:number})=>row.game_id!==1&&row.game_id!==2)[0]).toMatchObject({hours_played:0,platform:"pc",score:null,tier:null,status:null});
  await page.getByRole("button",{name:"Refresh library"}).click();
  await expect(page.getByText("125 Steam games",{exact:false})).toBeVisible();
  await expect(page.getByRole("checkbox",{name:"Select game Hades",exact:true})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("Steam import protects guests and email accounts and handles hidden libraries and save retries",async({page,context})=>{
  await page.goto("/profile/import/steam");
  await expect(page).toHaveURL(/\/login$/);
  await context.addCookies([authCookie]);
  await page.goto("/profile/import/steam");
  await expect(page.getByText("Sign in with Steam to import your library. Email accounts cannot connect Steam yet.")).toBeVisible();
  await expect(page.getByRole("button",{name:"Preview Steam library"})).toHaveCount(0);
  await fetch("http://127.0.0.1:3101/__steam-user",{method:"POST"});
  await fetch("http://127.0.0.1:3101/__steam-private",{method:"POST"});
  await page.reload();
  await expect(page.getByText("Steam game details are unavailable. Set Game details to Public in Steam privacy settings, then retry.")).toBeVisible();
  await fetch("http://127.0.0.1:3101/__reset",{method:"POST"});
  await fetch("http://127.0.0.1:3101/__steam-user",{method:"POST"});
  await page.getByRole("button",{name:"Refresh library",exact:true}).click();
  await page.getByRole("checkbox",{name:"Select game Hades",exact:true}).check();
  await fetch("http://127.0.0.1:3101/__fail-save",{method:"POST"});
  await page.getByRole("button",{name:"Import selected games (1)",exact:true}).click();
  await expect(page.getByText("Some games could not be imported. Your successful imports are saved; retry the remaining games.")).toBeVisible();
  await expect(page.getByRole("checkbox",{name:"Select game Hades",exact:true})).toBeChecked();
  await page.getByRole("button",{name:"Import selected games (1)",exact:true}).click();
  await expect(page.getByText("Import complete. Your games are saved in your profile.")).toBeVisible();
});

test("Steam import does not overwrite an entry logged after preview",async({page,context})=>{
  await context.addCookies([authCookie]);
  await fetch("http://127.0.0.1:3101/__steam-user",{method:"POST"});
  await page.goto("/profile/import/steam");
  await page.getByRole("checkbox",{name:"Select game Hades",exact:true}).check();
  const editor=await context.newPage();
  await editor.goto("/log?game=hades");
  await editor.getByRole("slider").focus();
  await editor.getByRole("slider").press("End");
  await editor.locator("#commit-rating").click();
  await expect(editor.getByText(/^Entry saved:/)).toBeVisible();
  await editor.close();
  await page.getByRole("button",{name:"Import selected games (1)",exact:true}).click();
  await expect(page.getByText("Import complete. Your games are saved in your profile.")).toBeVisible();
  const state=await (await fetch("http://127.0.0.1:3101/__state")).json();
  const own=state.ratings.filter((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===1);
  expect(own).toHaveLength(1);
  expect(own[0]).toMatchObject({score:100,hours_played:null,platform:null});
});

test("Steam browsing loads more without losing selection, changes amounts and filters the whole library by playtime",async({page,context})=>{
  await context.addCookies([authCookie]);
  await fetch("http://127.0.0.1:3101/__steam-user",{method:"POST"});
  await page.route("https://shared.steamstatic.com/**",route=>route.fulfill({contentType:"image/svg+xml",body:'<svg xmlns="http://www.w3.org/2000/svg" width="60" height="90"><rect width="60" height="90" fill="#ba831f"/></svg>'}));
  await page.goto("/profile/import/steam");
  await expect(page.getByRole("checkbox")).toHaveCount(25);
  const hades=page.getByRole("checkbox",{name:"Select game Hades",exact:true});
  await hades.check();
  await page.getByRole("button",{name:"Load more",exact:true}).click();
  await expect(page.getByRole("checkbox")).toHaveCount(50);
  await expect(hades).toBeChecked();
  await page.getByLabel("Games to show",{exact:true}).selectOption("50");
  await expect(page.getByRole("checkbox")).toHaveCount(50);
  await expect(hades).not.toBeChecked();
  await page.getByLabel("Games to show",{exact:true}).selectOption("100");
  await expect(page.getByRole("checkbox")).toHaveCount(100);
  await page.getByLabel("Games to show",{exact:true}).selectOption("all");
  await expect(page.getByRole("checkbox")).toHaveCount(127);
  await expect(page.getByRole("button",{name:"Load more",exact:true})).toHaveCount(0);
  await page.getByLabel("Games to show",{exact:true}).selectOption("25");
  await expect(page.getByRole("checkbox")).toHaveCount(25);
  await page.getByLabel("Sort by",{exact:true}).selectOption("hours_desc");
  await expect(page.getByRole("checkbox").first()).toHaveAttribute("aria-label","Select game ZZZ Fixture 123");
  await page.getByLabel("Minimum hours",{exact:true}).fill("1");
  await page.getByLabel("Maximum hours",{exact:true}).fill("2");
  await expect(page.getByRole("button",{name:"Apply filters",exact:true})).toHaveCount(0);
  await expect(page.getByRole("checkbox")).toHaveCount(1);
  await expect(hades).toBeVisible();
  await page.getByLabel("Minimum hours",{exact:true}).fill("0");
  await page.getByLabel("Maximum hours",{exact:true}).fill("0");
  await expect(page.getByRole("checkbox",{name:"Select game Steam Fixture Adventure",exact:true})).toBeVisible();
  await expect(hades).toHaveCount(0);
  await page.getByLabel("Minimum hours",{exact:true}).fill("101");
  await page.getByLabel("Maximum hours",{exact:true}).fill("102");
  await expect(page.getByText("No Steam games match these filters.")).toBeVisible();
  await page.getByRole("button",{name:"Clear filters",exact:true}).click();
  await expect(page.getByRole("checkbox")).toHaveCount(25);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("Steam playtime filters keep typing responsive and discard outdated results",async({page,context})=>{
  await context.addCookies([authCookie]);
  await fetch("http://127.0.0.1:3101/__steam-user",{method:"POST"});
  await page.goto("/profile/import/steam");
  await expect(page.getByRole("checkbox")).toHaveCount(25);
  let delayed=false;
  await page.route("**/profile/import/steam",async route=>{
    if(route.request().method()==="POST"&&!delayed){delayed=true;await new Promise(resolve=>setTimeout(resolve,700));}
    await route.continue();
  });
  const request=page.waitForRequest(req=>req.method()==="POST"&&Boolean(req.headers()["next-action"]));
  await page.getByLabel("Minimum hours",{exact:true}).fill("5");
  await request;
  await expect(page.getByLabel("Minimum hours",{exact:true})).toBeEnabled();
  await page.getByLabel("Minimum hours",{exact:true}).fill("101");
  await page.getByLabel("Maximum hours",{exact:true}).fill("102");
  await expect(page.getByText("No Steam games match these filters.")).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expect(page.getByLabel("Minimum hours",{exact:true})).toHaveValue("101");
  await page.getByLabel("Maximum hours",{exact:true}).fill("100");
  await expect(page.getByText("Use nonnegative hours and a minimum no greater than the maximum.")).toBeVisible();
  await page.getByRole("button",{name:"Clear filters",exact:true}).click();
  await expect(page.getByRole("checkbox")).toHaveCount(25);
});

test("Steam artwork falls back to its header and then a placeholder if images fail",async({page,context})=>{
  await context.addCookies([authCookie]);
  await fetch("http://127.0.0.1:3101/__steam-user",{method:"POST"});
  await page.route("https://shared.steamstatic.com/**",route=>route.request().url().endsWith("/header.jpg") ? route.fulfill({contentType:"image/svg+xml",body:'<svg xmlns="http://www.w3.org/2000/svg" width="60" height="90"><rect width="60" height="90" fill="#ba831f"/></svg>'}) : route.fulfill({status:404}));
  await page.goto("/profile/import/steam");
  const row=page.getByRole("listitem").filter({has:page.getByRole("checkbox",{name:"Select game Steam Fixture Adventure",exact:true})});
  await row.scrollIntoViewIfNeeded();
  await expect(row.locator("img")).toHaveAttribute("src",/\/103\/header\.jpg$/);
  await expect.poll(()=>row.locator("img").evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
  await row.locator("img").evaluate(image=>image.dispatchEvent(new Event("error")));
  await expect(row.locator("img")).toHaveCount(0);
  await expect(row.locator(".material-symbols-outlined")).toHaveText("sports_esports");
});
