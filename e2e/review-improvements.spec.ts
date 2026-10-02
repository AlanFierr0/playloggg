import {test,expect} from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Local fixture only.
import {authCookie} from "./fixture-server.mjs";

test("retired features remain unavailable for visitors and owners",async({request,context})=>{
 for(const path of ["/quick-rate","/profile/wrapped","/api/share/list?id=10","/api/share/profile?kind=wrapped"]){
   expect((await request.get(path)).status()).toBe(404);
 }
 await context.addCookies([authCookie]);
 for(const path of ["/quick-rate","/profile/wrapped","/api/share/list?id=10","/api/share/profile?kind=wrapped"]){
   expect((await context.request.get(path)).status()).toBe(404);
 }
});

test("security headers are present on pages and exports",async({request})=>{
 for(const path of ["/","/games","/api/share/list?id=10"]){
  const response=await request.get(path),headers=response.headers();
  expect(headers["x-frame-options"]).toBe("DENY");expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy-report-only"]).toContain("default-src 'self'");
 }
});

test("bulk organization changes only selected owned status and platform",async({page,context},testInfo)=>{
 await context.addCookies([authCookie]);
 await page.goto("/profile/ranking");
 await page.getByText("Manage your games",{exact:true}).click();
 const manager=page.locator("details").filter({has:page.getByText("Manage your games",{exact:true})});
 await manager.getByLabel("Search your games",{exact:true}).fill("Elden");
 await expect(manager.getByRole("checkbox")).toHaveCount(1);
 const before=await (await fetch("http://127.0.0.1:3101/__state")).json();
 await manager.getByRole("checkbox").check();
 await manager.getByRole("group",{name:"Edit selected games",exact:true}).getByRole("combobox",{name:"Status",exact:true}).selectOption("completed");
 await manager.getByRole("group",{name:"Edit selected games",exact:true}).getByRole("combobox",{name:"Platform",exact:true}).selectOption("pc");
 await manager.getByRole("button",{name:"Update selected games",exact:true}).click();
 await expect(manager.getByText("Selected games updated. (1)",{exact:true})).toBeVisible();
 const after=await (await fetch("http://127.0.0.1:3101/__state")).json();
 for(const rating of before.ratings){
  const saved=after.ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===rating.profile_id&&row.game_id===rating.game_id);
  if(rating.profile_id===2&&rating.game_id===2){const {status,platform,updated_at,...untouched}=rating;void status;void platform;void updated_at;expect(saved).toMatchObject({...untouched,status:"completed",platform:"pc"});}
  else expect(saved).toEqual(rating);
 }
 await page.screenshot({path:`e2e-artifacts/manage-games-${testInfo.project.name}.png`,fullPage:true});
 await manager.getByLabel("Search your games",{exact:true}).fill("");
 await manager.getByLabel("Minimum hours",{exact:true}).fill("0");
 await expect(manager.getByRole("checkbox")).toHaveCount(0); // Unknown hours are not zero.
 expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
});

test("Compare suggests followed consenting friends and keeps its owner first",async({page,context})=>{
 await context.addCookies([authCookie]);await page.goto("/people");
 await page.getByRole("button",{name:"Follow",exact:true}).first().click();
 await page.goto("/compare");
 await expect(page.getByLabel("First profile handle",{exact:true})).toHaveValue("fixture_owner");
 await expect(page.locator("#compare-friends option[value=fixture_public]")).toHaveCount(1);
 await page.getByLabel("Second profile handle",{exact:true}).fill("fixture_public");
 await page.getByRole("button",{name:"Compare profiles",exact:true}).click();
 await expect(page.getByText("More shared scored games needed",{exact:false})).toContainText("5");
});

test("external search fails closed on quota limits and recovers without blocking the saved catalog",async({page,context})=>{
 await context.addCookies([authCookie]);await page.goto("/log");
 const search=page.getByRole("textbox",{name:"Search titles, profiles and commands"});
 await fetch("http://127.0.0.1:3101/__quota-denied",{method:"POST"});
 await search.fill("Unified");await expect(page.getByText("Too many requests. Try again in 60 seconds.",{exact:true})).toBeVisible();
 await fetch("http://127.0.0.1:3101/__quota-unavailable",{method:"POST"});
 await page.getByRole("button",{name:"Retry search",exact:true}).click();
 await expect(page.getByText("Usage limits could not be checked. Please retry.",{exact:true})).toBeVisible();
 await fetch("http://127.0.0.1:3101/__quota-allow",{method:"POST"});
 await page.getByRole("button",{name:"Retry search",exact:true}).click();
 await expect(page.getByRole("heading",{name:"Unified Fixture Adventure",exact:true}).or(page.getByRole("link",{name:/^Unified Fixture Adventure/}))).toBeVisible();
 await search.fill("Hades");await expect(page.locator('[data-search-result][href="/log?game=hades"]')).toHaveCount(1);
});
