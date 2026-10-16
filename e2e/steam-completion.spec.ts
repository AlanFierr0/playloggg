import {test,expect} from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Local fixture only.
import {authCookie} from "./fixture-server.mjs";
const fixture="http://127.0.0.1:3101";
async function state(){return (await fetch(`${fixture}/__state`)).json();}
test("Steam import confirms a chosen ending, allows correction, and restores date drafts",async({page,context})=>{
  await context.addCookies([authCookie]);await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-five-hours`,{method:"POST"});
  await page.goto("/profile/import/steam");await page.getByRole("checkbox",{name:"Select game Hades",exact:true}).check();
  await page.getByRole("button",{name:"Import selected games (1)",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Rate imported games",exact:true});
  await expect(dialog.getByRole("button",{name:"Use this date",exact:true})).toHaveCount(2);
  let row=(await state()).ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===1);
  expect(row.completed_on).toBeNull();expect(row.status).toBeNull();
  await dialog.getByRole("button",{name:"Use this date",exact:true}).last().click();
  await expect(dialog.getByRole("button",{name:"Completed",exact:true})).toHaveAttribute("aria-pressed","true");
  await dialog.getByRole("button",{name:"Choose completion date",exact:true}).click();
  await expect(page.getByRole("dialog",{name:"Completion date",exact:true})).toBeVisible();
  await page.keyboard.press("Escape");await expect(dialog).toBeVisible();
  await expect(page.getByRole("dialog",{name:"Completion date",exact:true})).not.toBeVisible();
  await dialog.locator("#date-input").fill("2025-07-04");
  await page.keyboard.press("Escape");await page.reload();await page.getByRole("button",{name:"Resume rating games (1)",exact:true}).click();
  await expect(dialog.locator("#date-input")).toHaveValue("2025-07-04");
  await dialog.getByRole("button",{name:"Save and next",exact:true}).click();
  await expect(dialog.getByRole("button",{name:"Done",exact:true})).toBeVisible();
  row=(await state()).ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===1);
  expect(row.completed_on).toBe("2025-07-04");expect(row.status).toBe("completed");expect(row.hours_played).toBe(5);expect(row.score).toBeNull();
});
test("existing Steam logs require confirmation and retain all other entry details",async({page,context},testInfo)=>{
  await context.addCookies([authCookie]);await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-five-hours`,{method:"POST"});await fetch(`${fixture}/__steam-completion-log`,{method:"POST"});
  const before=(await state()).ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===2);
  await page.goto("/profile/import/steam");await page.getByRole("button",{name:"Find completion dates",exact:true}).click();
  const panel=page.getByRole("region",{name:"Steam completion dates",exact:true});
  await expect(panel.getByText("Scan finished. Only confirmed dates are saved.",{exact:false})).toBeVisible();
  await expect(panel.getByRole("button",{name:"Confirm completion",exact:true})).toHaveCount(2);
  expect((await state()).ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===2).completed_on).toBeNull();
  await panel.screenshot({path:`e2e-artifacts/steam-completion-${testInfo.project.name}.png`});
  const axe=await new AxeBuilder({page}).include("main").analyze();expect(axe.violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await panel.getByRole("button",{name:"Confirm completion",exact:true}).first().click();
  await expect(panel.getByRole("status")).toContainText("Completion saved.");
  const after=(await state()).ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===2);
  const {completed_on:date,status,updated_at:timestamp,...unchanged}=after;void timestamp;
  expect(date).toBe("2025-07-02");expect(status).toBe("completed");
  await expect(panel.getByRole("article")).toHaveCount(0);
  await page.getByRole("button",{name:"Find completion dates",exact:true}).click();await expect(panel.getByText(/Scan finished/)).toBeVisible();
  await expect(panel.getByRole("article")).toHaveCount(0);
  const {completed_on:oldDate,status:oldStatus,updated_at:oldTimestamp,...original}=before;void oldDate;void oldStatus;void oldTimestamp;expect(unchanged).toEqual(original);
  await page.goto("/profile/timeline");
  await expect(page.locator('time[datetime="2025-07-02"]')).toBeVisible();
});
test("completion confirmation preserves dates added concurrently",async({page,context})=>{
  await context.addCookies([authCookie]);await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-five-hours`,{method:"POST"});await fetch(`${fixture}/__steam-completion-log`,{method:"POST"});
  await page.goto("/profile/import/steam");await page.getByRole("button",{name:"Find completion dates",exact:true}).click();
  const panel=page.getByRole("region",{name:"Steam completion dates",exact:true});await expect(panel.getByText(/Scan finished/)).toBeVisible();
  await fetch(`${fixture}/__steam-sync-entry`,{method:"POST"});
  await panel.getByRole("button",{name:"Confirm completion",exact:true}).first().click();
  await expect(panel.getByRole("alert")).toContainText("Reload before retrying");
  expect((await state()).ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===2).completed_on).toBe("2026-09-01");
});
test("Steam unavailable achievements and ongoing mode leave manual import usable",async({page,context})=>{
  await context.addCookies([authCookie]);await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-five-hours`,{method:"POST"});
  await page.goto("/profile/import/steam");await page.getByRole("checkbox",{name:"Select game Steam Fixture Adventure",exact:true}).check();await page.getByRole("button",{name:"Import selected games (1)",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Rate imported games",exact:true});
  await expect(dialog.getByText("Steam achievements unavailable. You can enter a date manually.",{exact:true})).toBeVisible();
  await dialog.locator("#date-input").fill("2025-08-01");
  await dialog.getByRole("combobox",{name:"Game type",exact:true}).selectOption("ongoing");await expect(dialog.locator("#date-input")).toHaveCount(0);
  await dialog.getByRole("button",{name:"Currently playing",exact:true}).click();await dialog.getByRole("button",{name:"Save and next",exact:true}).click();await expect(dialog.getByRole("button",{name:"Done",exact:true})).toBeVisible();
  const snapshot=await state();const game=snapshot.games.find((row:{igdb_id:number})=>row.igdb_id===9004);const row=snapshot.ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===game.id);expect(row.completed_on).toBeNull();expect(row.status).toBe("active");
});
test("Spanish completion scan is translated and can be stopped",async({page,context})=>{
  await context.addCookies([authCookie,{name:"playlogg_locale",value:"es-AR",domain:"127.0.0.1",path:"/"}]);await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-five-hours`,{method:"POST"});await fetch(`${fixture}/__steam-completion-log`,{method:"POST"});
  await page.goto("/profile/import/steam");
  await page.route("**/profile/import/steam",async route=>{if(route.request().method()==="POST")await new Promise(resolve=>setTimeout(resolve,400));await route.continue();});
  await page.getByRole("button",{name:"Buscar fechas de finalización",exact:true}).click();
  const panel=page.getByRole("region",{name:"Fechas de finalización de Steam",exact:true});await panel.getByRole("button",{name:"Detener búsqueda",exact:true}).click();
  await expect(panel.getByRole("button",{name:"Reintentar juegos pendientes",exact:true})).toBeVisible();
  await panel.getByRole("button",{name:"Reintentar juegos pendientes",exact:true}).click();await expect(panel.getByText(/Búsqueda terminada/)).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("old import drafts resume and mismatched Steam IDs cannot reveal achievements",async({page,context})=>{
  await context.addCookies([authCookie]);await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-five-hours`,{method:"POST"});
  await page.goto("/profile/import/steam");await page.getByRole("checkbox",{name:"Select game Hades",exact:true}).check();await page.getByRole("button",{name:"Import selected games (1)",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Rate imported games",exact:true});await expect(dialog.getByRole("button",{name:"Use this date",exact:true})).toHaveCount(2);
  await page.keyboard.press("Escape");
  await page.evaluate(()=>{const key="playlogg-steam-ratings:2";const value=JSON.parse(localStorage.getItem(key)!);delete value.draft.completedOn;value.games[0].appId=102;localStorage.setItem(key,JSON.stringify(value));});
  await page.reload();await page.getByRole("button",{name:"Resume rating games (1)",exact:true}).click();
  await expect(dialog.locator("#date-input")).toHaveValue("");
  await expect(dialog.getByText("Steam achievements unavailable. You can enter a date manually.",{exact:true})).toBeVisible();await expect(dialog.getByRole("button",{name:"Use this date",exact:true})).toHaveCount(0);
});
test("anonymous replay cannot confirm an owned Steam completion",async({page,context})=>{
  await context.addCookies([authCookie]);await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-five-hours`,{method:"POST"});await fetch(`${fixture}/__steam-completion-log`,{method:"POST"});
  await page.goto("/profile/import/steam");await page.getByRole("button",{name:"Find completion dates",exact:true}).click();
  const panel=page.getByRole("region",{name:"Steam completion dates",exact:true});await expect(panel.getByText(/Scan finished/)).toBeVisible();
  const captured=page.waitForRequest(request=>request.method()==="POST"&&Boolean(request.headers()["next-action"])&&Boolean(request.postData()?.includes("ENDING_A")));
  await panel.getByRole("button",{name:"Confirm completion",exact:true}).first().click();const action=await captured;await expect(panel.getByRole("status")).toContainText("Completion saved.");
  await fetch(`${fixture}/__reset`,{method:"POST"});await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-five-hours`,{method:"POST"});await fetch(`${fixture}/__steam-completion-log`,{method:"POST"});
  const response=await fetch(action.url(),{method:"POST",headers:{"next-action":action.headers()["next-action"],"content-type":action.headers()["content-type"],origin:"http://127.0.0.1:3100"},body:action.postData()});
  expect(response.ok).toBe(true);expect(await response.text()).toContain("Reload before retrying");
  expect((await state()).ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===2).completed_on).toBeNull();
});

test("completion scan remains available while the catalog loads and a rating session is hidden",async({page,context})=>{
  await context.addCookies([authCookie]);await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-five-hours`,{method:"POST"});
  await page.route("**/profile/import/steam",async route=>{if(route.request().method()==="POST")await new Promise(resolve=>setTimeout(resolve,700));await route.continue();});
  await page.goto("/profile/import/steam");
  const scan=page.getByRole("button",{name:"Find completion dates",exact:true});await expect(page.getByRole("button",{name:"Loading…",exact:true})).toBeVisible();await expect(scan).toBeEnabled();
  await page.getByRole("checkbox",{name:"Select game Hades",exact:true}).check();
  await expect(page.getByRole("button",{name:"Refresh library",exact:true})).toBeEnabled();
  await page.unrouteAll({behavior:"wait"});
  await page.getByRole("button",{name:"Import selected games (1)",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Rate imported games",exact:true});await expect(dialog.getByRole("button",{name:"Use this date",exact:true})).toHaveCount(2);
  await expect(scan).toBeDisabled();await page.keyboard.press("Escape");await expect(dialog).not.toBeVisible();await expect(scan).toBeEnabled();
  await page.reload();await expect(page.getByRole("button",{name:"Resume rating games (1)",exact:true})).toBeVisible();await expect(scan).toBeEnabled();
  await scan.click();await expect(page.getByRole("region",{name:"Steam completion dates",exact:true}).getByText(/Scan finished/)).toBeVisible();
});

test("Steam achievement checks skip games below five hours but retain manual dates",async({page,context})=>{
  await context.addCookies([authCookie]);await fetch(`${fixture}/__steam-user`,{method:"POST"});
  await page.goto("/profile/import/steam");await fetch(`${fixture}/__reset-request-counts`,{method:"POST"});await page.getByRole("checkbox",{name:"Select game Hades",exact:true}).check();await page.getByRole("button",{name:"Import selected games (1)",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Rate imported games",exact:true});
  await expect(dialog.getByText("Achievement checks require at least 5 hours of Steam playtime.",{exact:true})).toBeVisible();await expect(dialog.getByRole("button",{name:"Use this date",exact:true})).toHaveCount(0);
  await page.keyboard.press("Escape");await page.getByRole("button",{name:"Find completion dates",exact:true}).click();
  await expect(page.getByRole("region",{name:"Steam completion dates",exact:true}).getByRole("status")).toContainText("0 / 0");
  await page.evaluate(()=>{const key="playlogg-steam-ratings:2";const value=JSON.parse(localStorage.getItem(key)!);value.games[0].hours=5;localStorage.setItem(key,JSON.stringify(value));});
  await page.reload();await expect(page.getByRole("button",{name:"Refresh library",exact:true})).toBeEnabled();
  await page.getByRole("button",{name:"Resume rating games (1)",exact:true}).click();
  await expect(dialog.getByText("Achievement checks require at least 5 hours of Steam playtime.",{exact:true})).toBeVisible();
  await dialog.locator("#date-input").fill("2025-08-01");await dialog.getByRole("button",{name:"Completed",exact:true}).click();await dialog.getByRole("button",{name:"Save and next",exact:true}).click();await dialog.getByRole("button",{name:"Done",exact:true}).click();
  await page.getByRole("button",{name:"Find completion dates",exact:true}).click();await expect(page.getByRole("region",{name:"Steam completion dates",exact:true}).getByText(/Scan finished/)).toBeVisible();
  const snapshot=await state();expect(snapshot.requestCounts["GET /__steam-achievements"]??0).toBe(0);
  expect(snapshot.ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===1).completed_on).toBe("2025-08-01");
});

test("Gemini recognizes an indirect ending without inventing dates or sending player data",async({page,context})=>{
  await context.addCookies([authCookie]);await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-ai`,{method:"POST"});
  await page.goto("/profile/import/steam");await page.getByRole("checkbox",{name:"Select game ZZZ Fixture 1",exact:true}).check();await page.getByRole("button",{name:"Import selected games (1)",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Rate imported games",exact:true});
  await expect(dialog.getByText("AI-assisted suggestion",{exact:true})).toBeVisible();await expect(dialog.getByText("A new dawn",{exact:true})).toBeVisible();await expect(dialog.getByText("Another dawn",{exact:true})).toHaveCount(0);
  const snapshot=await state();expect(snapshot.geminiCalls).toBeLessThanOrEqual(1);expect(snapshot.achievementClassifications.filter((row:{appId:number})=>row.appId===201)).toHaveLength(1);
  const request=JSON.stringify(snapshot.geminiInputs[0]??{});expect(request).not.toContain("76561198000000000");expect(request).not.toContain("unlocktime");expect(request).not.toContain("1751587200");
  await dialog.getByRole("button",{name:"Use this date",exact:true}).click();await expect(dialog.locator("#date-input")).toHaveValue("2025-07-04");
  await dialog.getByRole("button",{name:"Save and next",exact:true}).click();await expect(dialog.getByRole("button",{name:"Done",exact:true})).toBeVisible();
  const after=await state();const game=after.games.find((row:{igdb_id:number})=>row.igdb_id===9006);expect(after.ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===game.id)).toMatchObject({completed_on:"2025-07-04",status:"completed",hours_played:10});expect(after.geminiCalls).toBe(snapshot.geminiCalls);
});

test("skipped completion games disappear across reloads without changing their log, and failed skips stay visible",async({page,context})=>{
  await context.addCookies([authCookie]);await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-five-hours`,{method:"POST"});await fetch(`${fixture}/__steam-completion-log`,{method:"POST"});
  await page.goto("/profile/import/steam");await page.getByRole("button",{name:"Find completion dates",exact:true}).click();
  const panel=page.getByRole("region",{name:"Steam completion dates",exact:true});await expect(panel.getByText(/Scan finished/)).toBeVisible();
  const game=(await state()).games.find((row:{id:number})=>row.id===2);
  const card=panel.getByRole("article").filter({has:page.getByRole("heading",{name:game.title,exact:true})});await expect(card).toBeVisible();
  const before=(await state()).ratings;await fetch(`${fixture}/__fail-completion-skip`,{method:"POST"});await card.getByRole("button",{name:"Skip game",exact:true}).click();
  await expect(card.getByRole("alert")).toHaveText("Game could not be skipped. Please retry.");expect((await state()).completionSkips).toEqual([]);
  await fetch(`${fixture}/__fail-completion-skip`,{method:"POST"});
  const captured=page.waitForRequest(request=>request.method()==="POST"&&Boolean(request.headers()["next-action"])&&Boolean(request.postData()?.includes(game.slug)));
  await card.getByRole("button",{name:"Skip game",exact:true}).click();const action=await captured;
  await expect(card).toHaveCount(0);await expect(panel.getByRole("status")).toContainText("Game skipped. It will not appear in future completion scans.");
  expect((await state()).ratings).toEqual(before);expect((await state()).completionSkips).toHaveLength(1);
  const calls=(await state()).requestCounts["GET /__steam-achievements"]??0;
  await page.reload();await page.getByRole("button",{name:"Find completion dates",exact:true}).click();await expect(panel.getByText(/Scan finished/)).toBeVisible();await expect(card).toHaveCount(0);
  expect((await state()).requestCounts["GET /__steam-achievements"]??0).toBe(calls);
  await fetch(`${fixture}/__reset`,{method:"POST"});await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-completion-log`,{method:"POST"});
  const response=await fetch(action.url(),{method:"POST",headers:{"next-action":action.headers()["next-action"],"content-type":action.headers()["content-type"],origin:"http://127.0.0.1:3100"},body:action.postData()});
  expect(await response.text()).toContain("Game could not be skipped");expect((await state()).completionSkips).toEqual([]);
});

test("completion scan pauses on quota limits, keeps unfinished work and retries after cooldown",async({page,context,request})=>{
 await context.addCookies([authCookie]);await request.post(`${fixture}/__steam-user`);await request.post(`${fixture}/__steam-five-hours`);await request.post(`${fixture}/__steam-completion-log`);
 await page.goto("/profile/import/steam");
 const game=(await state()).games.find((game:{id:number})=>game.id===2);
 await page.route("**/profile/import/steam",async route=>{
  if(route.request().method()==="POST"&&route.request().postData()?.includes(game.slug))await request.post(`${fixture}/__quota-denied`);
  await route.continue();
 });
 await page.getByRole("button",{name:"Find completion dates",exact:true}).click();
 const panel=page.getByRole("region",{name:"Steam completion dates",exact:true});
 await expect(panel.getByRole("status")).toContainText("Scan paused by a service limit.");
 await expect(panel.getByRole("button",{name:/Retry unfinished games/})).toBeDisabled();
 await page.unrouteAll({behavior:"wait"});await request.post(`${fixture}/__quota-allow`);
 await page.clock.install();await page.clock.fastForward(61000);
 await panel.getByRole("button",{name:"Retry unfinished games",exact:true}).click();
 await expect(panel.getByText(/Scan finished/)).toBeVisible();await expect(panel.getByRole("button",{name:"Confirm completion",exact:true})).toHaveCount(2);
});
