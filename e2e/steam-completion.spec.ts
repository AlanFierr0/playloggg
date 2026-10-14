import {test,expect} from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Local fixture only.
import {authCookie} from "./fixture-server.mjs";
const fixture="http://127.0.0.1:3101";
async function state(){return (await fetch(`${fixture}/__state`)).json();}
test("Steam import confirms a chosen ending, allows correction, and restores date drafts",async({page,context})=>{
  await context.addCookies([authCookie]);await fetch(`${fixture}/__steam-user`,{method:"POST"});
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
  expect(row.completed_on).toBe("2025-07-04");expect(row.status).toBe("completed");expect(row.hours_played).toBe(1.5);expect(row.score).toBeNull();
});
test("existing Steam logs require confirmation and retain all other entry details",async({page,context},testInfo)=>{
  await context.addCookies([authCookie]);await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-completion-log`,{method:"POST"});
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
  await expect(panel.getByText("Completion saved.",{exact:true})).toBeVisible();
  const after=(await state()).ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===2);
  const {completed_on:date,status,updated_at:timestamp,...unchanged}=after;void timestamp;
  expect(date).toBe("2025-07-02");expect(status).toBe("completed");
  const {completed_on:oldDate,status:oldStatus,updated_at:oldTimestamp,...original}=before;void oldDate;void oldStatus;void oldTimestamp;expect(unchanged).toEqual(original);
  await page.goto("/profile/timeline");
  await expect(page.locator('time[datetime="2025-07-02"]')).toBeVisible();
});
test("completion confirmation preserves dates added concurrently",async({page,context})=>{
  await context.addCookies([authCookie]);await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-completion-log`,{method:"POST"});
  await page.goto("/profile/import/steam");await page.getByRole("button",{name:"Find completion dates",exact:true}).click();
  const panel=page.getByRole("region",{name:"Steam completion dates",exact:true});await expect(panel.getByText(/Scan finished/)).toBeVisible();
  await fetch(`${fixture}/__steam-sync-entry`,{method:"POST"});
  await panel.getByRole("button",{name:"Confirm completion",exact:true}).first().click();
  await expect(panel.getByRole("alert")).toContainText("Reload before retrying");
  expect((await state()).ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===2).completed_on).toBe("2026-09-01");
});
test("Steam unavailable achievements and ongoing mode leave manual import usable",async({page,context})=>{
  await context.addCookies([authCookie]);await fetch(`${fixture}/__steam-user`,{method:"POST"});
  await page.goto("/profile/import/steam");await page.getByRole("checkbox",{name:"Select game Steam Fixture Adventure",exact:true}).check();await page.getByRole("button",{name:"Import selected games (1)",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Rate imported games",exact:true});
  await expect(dialog.getByText("Steam achievements unavailable. You can enter a date manually.",{exact:true})).toBeVisible();
  await dialog.locator("#date-input").fill("2025-08-01");
  await dialog.getByRole("combobox",{name:"Game type",exact:true}).selectOption("ongoing");await expect(dialog.locator("#date-input")).toHaveCount(0);
  await dialog.getByRole("button",{name:"Currently playing",exact:true}).click();await dialog.getByRole("button",{name:"Save and next",exact:true}).click();await expect(dialog.getByRole("button",{name:"Done",exact:true})).toBeVisible();
  const snapshot=await state();const game=snapshot.games.find((row:{igdb_id:number})=>row.igdb_id===9004);const row=snapshot.ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===game.id);expect(row.completed_on).toBeNull();expect(row.status).toBe("active");
});
test("Spanish completion scan is translated and can be stopped",async({page,context})=>{
  await context.addCookies([authCookie,{name:"playlogg_locale",value:"es-AR",domain:"127.0.0.1",path:"/"}]);await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-completion-log`,{method:"POST"});
  await page.goto("/profile/import/steam");
  await page.route("**/profile/import/steam",async route=>{if(route.request().method()==="POST")await new Promise(resolve=>setTimeout(resolve,400));await route.continue();});
  await page.getByRole("button",{name:"Buscar fechas de finalización",exact:true}).click();
  const panel=page.getByRole("region",{name:"Fechas de finalización de Steam",exact:true});await panel.getByRole("button",{name:"Detener búsqueda",exact:true}).click();
  await expect(panel.getByRole("button",{name:"Reintentar juegos pendientes",exact:true})).toBeVisible();
  await panel.getByRole("button",{name:"Reintentar juegos pendientes",exact:true}).click();await expect(panel.getByText(/Búsqueda terminada/)).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("old import drafts resume and mismatched Steam IDs cannot reveal achievements",async({page,context})=>{
  await context.addCookies([authCookie]);await fetch(`${fixture}/__steam-user`,{method:"POST"});
  await page.goto("/profile/import/steam");await page.getByRole("checkbox",{name:"Select game Hades",exact:true}).check();await page.getByRole("button",{name:"Import selected games (1)",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Rate imported games",exact:true});await expect(dialog.getByRole("button",{name:"Use this date",exact:true})).toHaveCount(2);
  await page.keyboard.press("Escape");
  await page.evaluate(()=>{const key="playlogg-steam-ratings:2";const value=JSON.parse(localStorage.getItem(key)!);delete value.draft.completedOn;value.games[0].appId=104;localStorage.setItem(key,JSON.stringify(value));});
  await page.reload();await page.getByRole("button",{name:"Resume rating games (1)",exact:true}).click();
  await expect(dialog.locator("#date-input")).toHaveValue("");
  await expect(dialog.getByText("Steam achievements unavailable. You can enter a date manually.",{exact:true})).toBeVisible();await expect(dialog.getByRole("button",{name:"Use this date",exact:true})).toHaveCount(0);
});
test("anonymous replay cannot confirm an owned Steam completion",async({page,context})=>{
  await context.addCookies([authCookie]);await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-completion-log`,{method:"POST"});
  await page.goto("/profile/import/steam");await page.getByRole("button",{name:"Find completion dates",exact:true}).click();
  const panel=page.getByRole("region",{name:"Steam completion dates",exact:true});await expect(panel.getByText(/Scan finished/)).toBeVisible();
  const captured=page.waitForRequest(request=>request.method()==="POST"&&Boolean(request.headers()["next-action"])&&Boolean(request.postData()?.includes("ENDING_A")));
  await panel.getByRole("button",{name:"Confirm completion",exact:true}).first().click();const action=await captured;await expect(panel.getByText("Completion saved.",{exact:true})).toBeVisible();
  await fetch(`${fixture}/__reset`,{method:"POST"});await fetch(`${fixture}/__steam-user`,{method:"POST"});await fetch(`${fixture}/__steam-completion-log`,{method:"POST"});
  const response=await fetch(action.url(),{method:"POST",headers:{"next-action":action.headers()["next-action"],"content-type":action.headers()["content-type"],origin:"http://127.0.0.1:3100"},body:action.postData()});
  expect(response.ok).toBe(true);expect(await response.text()).toContain("Reload before retrying");
  expect((await state()).ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===2&&row.game_id===2).completed_on).toBeNull();
});
