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

test("ranking keeps its filters without the game management subsection",async({page,context},testInfo)=>{
 await context.addCookies([authCookie]);
 await page.goto("/profile/ranking");
 await expect(page.getByText("Manage your games",{exact:true})).toHaveCount(0);
 await page.getByLabel("Search your games",{exact:true}).fill("Elden");
 await expect(page.locator("[data-ranking-game]")).toHaveCount(1);
 await page.getByLabel("Search your games",{exact:true}).fill("Hades");
 await expect(page.locator("[data-ranking-game]")).toHaveCount(0);
 await page.getByLabel("Search your games",{exact:true}).fill("");
 await page.getByRole("combobox",{name:"Platform",exact:true}).selectOption("pc");
 await expect(page.locator("[data-ranking-game]")).toHaveCount(0);
 await page.getByRole("combobox",{name:"Platform",exact:true}).selectOption("unset");
 await expect(page.locator("[data-ranking-game]")).toHaveCount(1);
 await page.getByLabel("Minimum hours",{exact:true}).fill("0");
 await expect(page.locator("[data-ranking-game]")).toHaveCount(0);
 await page.getByLabel("Minimum hours",{exact:true}).fill("");
 await page.getByLabel("Maximum hours",{exact:true}).fill("0");
 await expect(page.locator("[data-ranking-game]")).toHaveCount(0);
 await page.getByLabel("Maximum hours",{exact:true}).fill("");
 await page.screenshot({path:`e2e-artifacts/ranking-filters-${testInfo.project.name}.png`,fullPage:true});
 expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
});

test("Compare finds a followed public profile and keeps its owner first",async({page,context})=>{
 await context.addCookies([authCookie]);await page.goto("/people",{waitUntil:"domcontentloaded"});
 await page.getByRole("button",{name:"Follow",exact:true}).first().click();
 await page.goto("/compare");
 await expect(page.getByLabel("First profile handle",{exact:true})).toHaveValue("fixture_owner");
 await page.getByLabel("Second profile handle",{exact:true}).fill("Published Fixture");
 await page.getByRole("option",{name:/@fixture_public/}).click();
 await expect(page.getByLabel("Second profile handle",{exact:true})).toHaveValue("fixture_public");
 await expect(page.getByLabel("First profile handle",{exact:true})).toHaveValue("fixture_owner");
 await page.getByRole("button",{name:"Compare profiles",exact:true}).click();
 await expect(page.getByText("More shared scored games needed",{exact:false})).toContainText("5");
});

test("external search fails closed on quota limits and recovers without blocking the saved catalog",async({page,context})=>{
 await context.addCookies([authCookie]);await page.goto("/log");
 const search=page.getByRole("textbox",{name:"Search titles and profiles"});
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
