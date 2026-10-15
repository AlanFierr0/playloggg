import { test, expect } from "./test";
// @ts-expect-error Test-only Node fixture exports fake session.
import {authCookie} from "./fixture-server.mjs";
test("launch metadata indexes only public catalog pages and excludes profiles from sitemap",async ({page,request,context})=>{
 for(const [path,index,canonical] of [["/",true,"/"],["/games",true,"/games"],["/games?q=Hades",false,"/games"],["/game/hades",true,"/game/hades"],["/search?q=Hades",false,null],["/login",false,null],["/compare",false,null],["/u/fixture_public",false,"/u/fixture_public"],["/u/fixture_public/game/hades",false,"/u/fixture_public/game/hades"],["/u/fixture_public/tiers",false,"/u/fixture_public/tiers"]] as const){
  await page.goto(path);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",index ? /^index,/ : /noindex/);
  if(canonical) await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",canonical === "/" ? "https://playlogg.alanfierro.dev" : `https://playlogg.alanfierro.dev${canonical}`);
 }
 const sitemap=await request.get("/sitemap.xml");expect(sitemap.status()).toBe(200);
 const xml=await sitemap.text();expect(xml).toContain("https://playlogg.alanfierro.dev/game/hades");expect(xml).not.toContain("/u/");expect(xml).not.toContain("/settings");
 expect((await (await request.get("/robots.txt")).text())).toContain("Sitemap: https://playlogg.alanfierro.dev/sitemap.xml");
 await context.addCookies([authCookie]);await page.goto("/game/elden-ring-shadow-of-the-erdtree");
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/noindex/);
 await expect(page.locator('meta[property="og:description"]')).not.toHaveAttribute("content",/Private fixture review/);
 await expect(page.getByText("Sample community statistics")).toHaveCount(0);
 await expect(page.getByText("Unavailable",{exact:true})).toHaveCount(0);
});
test("owner can save privately, publish, copy a truthful link and unpublish",async ({page,context,browser})=>{
 await context.addCookies([authCookie]);await page.goto("/log?game=hades");
 await page.getByRole("button",{name:/Backlog$/}).click();
 await page.locator("#dispatch-textarea").fill("Launch fixture review");await page.locator("#commit-rating").click();await expect(page).toHaveURL(/\/profile$/);
 const guest=await browser.newContext();const visitor=await guest.newPage();
 try{
  expect((await visitor.goto("http://127.0.0.1:3100/u/fixture_owner"))?.status()).toBe(404);
  await page.goto("/settings");await page.getByRole("button",{name:"Publish profile"}).click();
  await expect(page.getByText("Your profile is now public.")).toBeVisible();
  await page.evaluate(()=>{Object.defineProperty(navigator.clipboard,"writeText",{configurable:true,value:async(value:string)=>{document.documentElement.dataset.copied=value}})});
  await page.getByRole("button",{name:"Copy public link"}).click();await expect(page.locator("html")).toHaveAttribute("data-copied","http://127.0.0.1:3100/u/fixture_owner");
  expect((await visitor.goto("http://127.0.0.1:3100/u/fixture_owner/game/hades"))?.status()).toBe(200);
  await expect(visitor.getByText("Launch fixture review")).toBeVisible();await expect(visitor.locator('meta[name="robots"]')).toHaveAttribute("content",/noindex/);
  await page.getByRole("button",{name:"Make profile private"}).click();await expect(page.getByText("Your profile is now private.")).toBeVisible();
  expect((await visitor.reload())?.status()).toBe(404);
 }finally{await guest.close()}
});
