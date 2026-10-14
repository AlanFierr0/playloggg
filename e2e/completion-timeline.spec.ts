import {test,expect} from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Test-only session.
import {authCookie} from "./fixture-server.mjs";

test("completion timeline uses saved dates, loads more, filters years and keeps unknown dates separate",async({page,context,request},info)=>{
 await request.post("http://127.0.0.1:3101/__completion-timeline");
 await context.addCookies([authCookie]);
 await page.goto("/profile");
 await page.getByRole("navigation",{name:"Profile sections"}).getByRole("link",{name:"Timeline",exact:true}).click();
 await expect(page).toHaveURL(/\/profile\/timeline$/);
 await expect(page.getByRole("link",{name:"Timeline",exact:true})).toHaveAttribute("aria-current","page");
 const chart=page.getByRole("region",{name:"Completion chart",exact:true});
 await expect(chart.locator("[data-completion-period]")).toHaveCount(12);
 await expect(chart.locator(`[data-completion-period="03"]`)).toHaveAttribute("data-completion-count","2");
 await expect(chart.locator(`[data-completion-period="02"]`)).toHaveAttribute("data-completion-count","1");
 await expect(chart.locator(`[data-completion-period="04"]`).getByRole("button")).toBeDisabled();
 await chart.getByRole("button",{name:"March: 2 Completed games",exact:true}).click();
 await expect(chart.getByRole("button",{name:"March: 2 Completed games",exact:true})).toHaveAttribute("aria-pressed","true");
 await expect(page.locator("[data-timeline-month]")).toHaveCount(1);
 await expect(page.locator("[data-timeline-month]")).toHaveAttribute("data-timeline-month","2025-03");
 await page.getByLabel("Year",{exact:true}).selectOption("2024");
 await expect(page.getByRole("button",{name:"All months",exact:true})).toHaveAttribute("aria-pressed","true");
 await expect(page.locator("[data-timeline-month]")).toHaveAttribute("data-timeline-month","2024-02");
 await page.getByLabel("Year",{exact:true}).selectOption("");
 await chart.getByRole("button",{name:"March: 2 Completed games",exact:true}).click();
 await page.getByRole("button",{name:"All months",exact:true}).click();
 const months=page.locator("[data-timeline-month]");
 await expect(months).toHaveCount(12);
 await expect(months.first()).toHaveAttribute("data-timeline-month","2025-03");
 const march=page.locator(`[data-timeline-month="2025-03"]`);
 await expect(march).toContainText("0 / 100");await expect(march).toContainText("12.5 hrs");await expect(march).toContainText("45");
 expect((await months.allTextContents()).join("")).not.toContain("2026");
 await page.getByRole("button",{name:"Load more",exact:true}).click();await expect(months).toHaveCount(15);
 await page.getByLabel("Year",{exact:true}).selectOption("2024");await expect(months).toHaveCount(1);
 await expect(months.first()).toHaveAttribute("data-timeline-month","2024-02");
 await expect(chart.locator(`[data-completion-period="03"]`)).toHaveAttribute("data-completion-count","0");
 await page.getByLabel("Year",{exact:true}).selectOption("");await expect(months).toHaveCount(12);
 const undated=page.getByRole("heading",{name:/Completed without a date/}).locator("..");
 await expect(undated.getByRole("link")).toHaveCount(2);
 await expect(undated.getByRole("link").first()).toHaveAttribute("href","/log?game=fixture-game-1");
 await page.getByLabel("Year",{exact:true}).selectOption("2025");
 for(const [locale,theme] of [["en","dark"],["es-AR","light"]]){
  await context.addCookies([{name:"playlogg_locale",value:locale,url:"http://127.0.0.1:3100"},{name:"playlogg_theme",value:theme,url:"http://127.0.0.1:3100"}]);await page.reload();
  await page.getByRole("combobox").selectOption("2025");
  if(locale==="es-AR")await expect(page.getByRole("heading",{name:"Historial de juegos completados",exact:true})).toBeVisible();
  expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:`e2e-artifacts/completion-timeline-${info.project.name}-${locale}.png`,fullPage:true});
 }
 if(info.project.name==="mobile"){
  await page.setViewportSize({width:320,height:812});
  const targets=page.locator("[data-completion-period] button");
  const boxes=await targets.evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,radius:Number.parseFloat(getComputedStyle(node).borderRadius)};}));
  for(let i=0;i<boxes.length;i++){
   const a=boxes[i],b=boxes[(i+1)%boxes.length];
   expect(a.width).toBeGreaterThanOrEqual(44);expect(a.height).toBeGreaterThanOrEqual(44);
   expect(a.radius).toBeGreaterThanOrEqual(a.width/2);
   const separation=Math.hypot(a.x+a.width/2-b.x-b.width/2,a.y+a.height/2-b.y-b.height/2);
   expect(separation).toBeGreaterThanOrEqual((a.width+b.width)/2);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:"e2e-artifacts/completion-orbit-320.png",fullPage:true});
 }
 await context.clearCookies();await page.goto("/profile/timeline");await expect(page).toHaveURL(/\/login$/);
});

test("timeline with no completion dates offers an honest empty state",async({page,context})=>{
 await context.addCookies([authCookie]);await page.goto("/profile/timeline");
 await expect(page.getByRole("heading",{name:"Your timeline starts with a completion date.",exact:true})).toBeVisible();
 await expect(page.locator("[data-timeline-month]")).toHaveCount(0);
 await expect(page.getByRole("region",{name:"Completion chart",exact:true})).toHaveCount(0);
 const empty=page.getByRole("heading",{name:"Your timeline starts with a completion date.",exact:true}).locator("..");
 await expect(empty.getByRole("link",{name:"Log a game",exact:true})).toHaveAttribute("href","/log");
});
