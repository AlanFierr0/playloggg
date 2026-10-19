import {test,expect} from "./test";
// @ts-expect-error Local fixture identity only.
import {authCookie} from "./fixture-server.mjs";

test("profile searches reuse successful queries and do not run in Games scope",async({page})=>{
 let requests=0;page.on("request",request=>{if(request.url().includes("/api/profiles/search?"))requests++;});
 await page.goto("/search?q=fi");
 await expect(page.getByRole("button",{name:/^Profiles\(\d/})).toBeVisible();
 expect(requests).toBe(1);
 await page.getByRole("button",{name:"Games",exact:true}).click();
 await page.getByLabel("Search titles and profiles").fill("fixture");
 await page.waitForTimeout(400);expect(requests).toBe(1);
 await Promise.all([page.waitForResponse(response=>response.url().includes("q=fixture")&&response.ok()),page.getByRole("button",{name:/^Profiles/}).click()]);
 expect(requests).toBe(2);
 await page.getByLabel("Search titles and profiles").fill("fi");
 await page.waitForTimeout(400);expect(requests).toBe(2);
});

test("editing a score does not repeat game-type detection",async({page,context})=>{
 await context.addCookies([authCookie]);
 let reads=0;page.on("request",request=>{if(request.method()==="POST"&&request.url().includes("/log?"))reads++;});
 await page.goto("/log?game=fixture-game-0");
 await expect(page.getByLabel("Game type",{exact:true})).toBeVisible();
 await page.waitForTimeout(500);const initial=reads;
 await page.locator("#score-display").fill("89");
 await page.locator("#score-display").fill("90");
 await page.waitForTimeout(400);expect(reads).toBe(initial);
});

test("small search covers have responsive sources, dimensions and a working failure fallback",async({page})=>{
 let failImage=false;
 await page.route("**/api/games/search?**",async route=>{
   const response=await route.fetch(),data=await response.json();
   data.games[0].cover="https://images.igdb.com/igdb/image/upload/t_cover_big/co7566.jpg";
   await route.fulfill({response,json:data});
 });
 await page.route("https://images.igdb.com/**",route=>failImage?route.fulfill({status:404,body:"Unavailable"}):route.fulfill({contentType:"image/svg+xml",body:'<svg xmlns="http://www.w3.org/2000/svg" width="90" height="128"/>'}));
 await page.goto("/search");
 await page.getByLabel("Search titles and profiles").fill("elden");
 const image=page.locator("[data-search-result] img").first();
 await expect(image).toHaveAttribute("width","264");
 await expect(image).toHaveAttribute("sizes","48px");
 await expect(image).toHaveAttribute("srcset",/90w.*264w.*528w/);
 failImage=true;
 await image.evaluate((element:HTMLImageElement)=>{element.srcset="https://images.igdb.com/igdb/image/upload/t_cover_small/missing.webp 90w";});
 await expect(image).toHaveAttribute("src","/images/missing-cover.svg");
 await expect(image).not.toHaveAttribute("srcset");
});


test("catalog cards do not prefetch every game before a user chooses one",async({page})=>{
 const requests:string[]=[];
 page.on("request",request=>{if(/\/game\/[^?]+\?_rsc=/.test(request.url()))requests.push(request.url());});
 await page.goto("/games");
 const first=page.locator("[data-catalog-game] a").first();
 await expect(first).toBeVisible();
 await page.waitForTimeout(800);
 expect(requests).toEqual([]);
 await first.click();
 await expect(page).toHaveURL(/\/game\//);
 await expect(page.locator("h1")).toBeVisible();
});


test("the reduced local icon font keeps core interface ligatures",async({page})=>{
 await page.goto("/");
 const widths=await page.evaluate(async()=>{
   await document.fonts.load('24px "Material Symbols Outlined"');
   const canvas=document.createElement("canvas"),context=canvas.getContext("2d")!;
   context.font='24px "Material Symbols Outlined"';
   return ["sports_esports","calendar_month","star_half","dark_mode","chevron_right","swords","thumb_up"].map(icon=>context.measureText(icon).width);
 });
 for(const width of widths)expect(width).toBeCloseTo(24,0);
});
