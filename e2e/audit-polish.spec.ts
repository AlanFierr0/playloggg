import {test,expect} from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Local fixture session only.
import {authCookie} from "./fixture-server.mjs";
const fixture="http://127.0.0.1:3101";
test("saving stays reachable while editing and errors remain beside Save",async({page,context,request},info)=>{
 await context.addCookies([authCookie]);
 await page.goto("/log?game=hades");
 const save=page.getByRole("button",{name:"Save game",exact:true});
 await expect(save).toBeVisible();
 if(info.project.name==="mobile"){
  const bounds=await save.boundingBox();expect(bounds!.y).toBeGreaterThan(64);expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(812);
  await page.locator("#dispatch-textarea").focus();await page.locator("#dispatch-textarea").fill("A preserved review draft.");
  const input=await page.locator("#dispatch-textarea").boundingBox(),bar=await page.locator("[data-editor-save-row]").boundingBox();
  expect(input!.y+input!.height).toBeLessThanOrEqual(bar!.y);
 }
 await request.post(`${fixture}/__fail-save`);await save.click();
 await expect(page.getByRole("status").filter({hasText:"could not be saved"})).toBeVisible();
 await expect(save).toBeEnabled();await save.click();await expect(page).toHaveURL(/\/profile$/);
 await page.goto("/log?game=hades");await expect(page.getByRole("button",{name:"Save changes",exact:true})).toBeVisible();
 if(info.project.name==="mobile")for(const width of [320,390,768]){
  await page.setViewportSize({width,height:812});await page.evaluate(()=>window.scrollTo(0,0));
  if(width<640){const bounds=await page.locator("#commit-rating").boundingBox();expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(812);}
  await page.locator("#add-tag").click();await page.locator("#tag-label").fill("Keep");
  const input=await page.locator("#tag-label").boundingBox(),bar=await page.locator("[data-editor-save-row]").boundingBox();expect(input!.y+input!.height).toBeLessThanOrEqual(bar!.y);
  await page.keyboard.press("Escape");expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 if(info.project.name==="mobile")await page.setViewportSize({width:375,height:812});
 for(const [locale,theme] of [["en","dark"],["es-AR","light"]]){
  await context.addCookies([{name:"playlogg_locale",value:locale,url:"http://127.0.0.1:3100"},{name:"playlogg_theme",value:theme,url:"http://127.0.0.1:3100"}]);await page.reload();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
  await page.evaluate(()=>window.scrollTo(0,0));
  if(info.project.name==="mobile")await expect(page.locator("#commit-rating")).toBeInViewport();
  await page.screenshot({path:`e2e-artifacts/audit-save-${info.project.name}-${locale}.png`});
 }
});
test("screenshots start compact and expand and collapse with the keyboard",async({page,context},info)=>{
 await page.route("https://images.igdb.com/**",route=>route.fulfill({contentType:"image/svg+xml",body:'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#292a2d"/></svg>'}));
 await page.goto("/game/fixture-game-119");
 const gallery=page.getByRole("region",{name:"Screenshots",exact:true});
 await expect(gallery.getByRole("img")).toHaveCount(2);
 const toggle=gallery.locator("summary");await expect(toggle).toContainText("View all screenshots (10)");
 await toggle.focus();await page.keyboard.press("Enter");await expect(gallery.getByRole("img")).toHaveCount(10);
 await expect(toggle).toContainText("Show fewer screenshots");await page.keyboard.press("Space");await expect(gallery.getByRole("img")).toHaveCount(2);
 await context.addCookies([{name:"playlogg_locale",value:"es-AR",url:"http://127.0.0.1:3100"},{name:"playlogg_theme",value:"light",url:"http://127.0.0.1:3100"}]);await page.reload();
 await expect(gallery).toHaveCount(0);const translated=page.getByRole("region",{name:"Capturas de pantalla",exact:true});
 await expect(translated.locator("summary")).toContainText("Ver todas las capturas (10)");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`e2e-artifacts/audit-gallery-${info.project.name}.png`,fullPage:true});
});
test("completion skips can be undone immediately or restored later without editing logs",async({page,context,request})=>{
 await context.addCookies([authCookie]);await request.post(`${fixture}/__steam-user`);await request.post(`${fixture}/__steam-five-hours`);await request.post(`${fixture}/__steam-completion-log`);
 await page.goto("/profile/import/steam");await page.getByRole("button",{name:"Find completion dates",exact:true}).click();
 const panel=page.getByRole("region",{name:"Steam completion dates",exact:true});await expect(panel.getByText(/Scan finished/)).toBeVisible();
 const before=(await(await request.get(`${fixture}/__state`)).json()).ratings;
 await panel.getByRole("button",{name:"Skip game",exact:true}).click();await expect(panel.getByRole("article")).toHaveCount(0);
 const undo=page.getByRole("button",{name:"Undo skip",exact:true});await expect(undo).toBeFocused();
 await request.post(`${fixture}/__fail-completion-skip`);await undo.click();await expect(page.getByRole("status").filter({hasText:"Game could not be restored."})).toBeVisible();await expect(undo).toBeVisible();
 await request.post(`${fixture}/__fail-completion-skip`);await undo.click();await expect(panel.getByRole("article")).toHaveCount(1);
 await panel.getByRole("button",{name:"Skip game",exact:true}).click();await expect(panel.getByRole("article")).toHaveCount(0);await expect(undo).toBeVisible();await context.addCookies([{name:"playlogg_locale",value:"es-AR",url:"http://127.0.0.1:3100"}]);await page.reload();
 const summary=page.locator("summary").filter({hasText:"Juegos omitidos"});await summary.focus();await page.keyboard.press("Enter");
 const restore=page.getByRole("button",{name:"Restaurar juego",exact:true});await expect(restore).toHaveCount(1);await restore.click();
 await expect(page.getByText("No hay juegos omitidos.",{exact:true})).toBeVisible();await context.addCookies([{name:"playlogg_locale",value:"en",url:"http://127.0.0.1:3100"}]);await page.reload();
 await page.getByRole("button",{name:"Find completion dates",exact:true}).click();await expect(panel.getByRole("article")).toHaveCount(1);
 expect((await(await request.get(`${fixture}/__state`)).json()).ratings).toEqual(before);
});
