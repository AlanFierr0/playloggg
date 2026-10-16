import {test,expect} from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Test-only session.
import {authCookie} from "./fixture-server.mjs";

test("completion timeline groups all completions by year, browses horizontally, filters years and keeps unknown dates separate",async({page,context,request},info)=>{
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
 await expect(page.locator("[data-timeline-year]")).toHaveCount(1);
 await expect(page.locator("[data-timeline-year]")).toHaveAttribute("data-timeline-year","2025");
 await page.getByLabel("Year",{exact:true}).selectOption("2024");
 await expect(page.getByRole("button",{name:"All months",exact:true})).toHaveAttribute("aria-pressed","true");
 await expect(page.locator("[data-timeline-year]")).toHaveAttribute("data-timeline-year","2024");
 await page.getByLabel("Year",{exact:true}).selectOption("");
 await chart.getByRole("button",{name:"March: 2 Completed games",exact:true}).click();
 await page.getByRole("button",{name:"All months",exact:true}).click();
 const panels=page.locator("[data-timeline-year]");
 await expect(panels).toHaveCount(1);
 await expect(page.getByRole("button",{name:/^(Newer|Older) year$/})).toHaveCount(0);
 const tabs=page.getByRole("tablist",{name:"Completion years",exact:true});
 await expect(tabs.getByRole("tab")).toHaveCount(15);
 await expect(tabs.getByRole("tab").first()).toHaveAttribute("aria-selected","true");
 await expect(tabs.locator("[data-year-pin]")).toHaveCount(15);
 await expect(tabs.locator('[data-year-pin="2025"]')).toHaveAttribute("data-year-count","3");
 await expect(tabs.locator('[data-year-pin="2025"]')).toHaveAccessibleDescription("3 Completed games");
 await expect(tabs.locator('[data-year-pin="2024"]')).toHaveAttribute("data-year-count","1");
 expect(await tabs.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
 const boxes=await tabs.getByRole("tab").evaluateAll(nodes=>nodes.slice(0,2).map(node=>{const box=node.getBoundingClientRect();return {x:box.x,y:box.y};}));
 expect(boxes[1].x).toBeGreaterThan(boxes[0].x);expect(boxes[1].y).toBe(boxes[0].y);
 await expect(panels.first()).toHaveAttribute("data-timeline-year","2025");
 const year2025=page.locator(`[data-timeline-year="2025"]`);
 await expect(year2025.getByRole("link")).toHaveCount(3);
 await expect(year2025).toContainText("0 / 100");await expect(year2025).toContainText("14.5 hrs");await expect(year2025).toContainText("50");
 const monthSections=page.getByRole("group",{name:"Monthly completions · 2025",exact:true});
 await expect(monthSections.locator("[data-month-section]")).toHaveCount(12);
 await expect(monthSections.locator('[data-month-section="01"]')).toHaveAttribute("data-month-count","1");
 await expect(monthSections.locator('[data-month-section="03"]')).toHaveAttribute("data-month-count","2");
 await expect(monthSections.locator('[data-month-section="04"]')).toBeEnabled();
 await expect(monthSections.locator('[data-month-section="04"]')).toContainText("0");
 await monthSections.getByRole("button",{name:"January 2025: 1 Completed game",exact:true}).click();
 await expect(year2025.getByRole("link")).toHaveCount(1);
 await expect(year2025).toContainText("60 / 100");
 await expect(monthSections.locator('[data-month-section="01"]')).toHaveAttribute("aria-pressed","true");
 await page.keyboard.press("End");await expect(monthSections.locator('[data-month-section="12"]')).toBeFocused();
 await page.keyboard.press("Space");await expect(year2025.getByRole("link")).toHaveCount(0);
 await expect(year2025).toContainText("No games were completed in this month.");
 await page.keyboard.press("Home");await expect(monthSections.locator('[data-month-section="01"]')).toBeFocused();
 await page.keyboard.press("ArrowRight");await page.keyboard.press("ArrowRight");
 await page.keyboard.press("Space");await expect(year2025.getByRole("link")).toHaveCount(2);
 await expect(year2025.getByRole("status")).toHaveText("March · 2 Completed games");
 await year2025.screenshot({path:`e2e-artifacts/completion-pins-selected-${info.project.name}.png`});
 await year2025.getByRole("button",{name:"Whole year",exact:true}).click();
 await expect(year2025.getByRole("link")).toHaveCount(3);
 expect((await panels.allTextContents()).join("")).not.toContain("2026");
 await tabs.getByRole("tab",{name:"2024",exact:true}).click();await expect(panels.first()).toHaveAttribute("data-timeline-year","2024");
 await expect(page.getByRole("group",{name:"Monthly completions · 2024",exact:true}).locator('[data-month-section="02"]')).toHaveAttribute("data-month-count","1");
 await page.getByRole("group",{name:"Monthly completions · 2024",exact:true}).locator('[data-month-section="02"]').click();
 await page.getByRole("button",{name:"Clear month filter",exact:true}).click();
 await expect(panels.first()).toHaveAttribute("data-timeline-year","2024");
 await chart.getByRole("button",{name:"March: 2 Completed games",exact:true}).click();
 await expect(panels.first()).toHaveAttribute("data-timeline-year","2025");
 await expect(panels.first().getByRole("link")).toHaveCount(2);
 await year2025.getByRole("button",{name:"Whole year",exact:true}).click();
 await tabs.getByRole("tab",{name:"2024",exact:true}).click();
 await page.emulateMedia({reducedMotion:"reduce"});
 await tabs.getByRole("tab",{name:"2024",exact:true}).focus();await page.keyboard.press("End");
 await expect(panels.first()).toHaveAttribute("data-timeline-year","2010");await expect(tabs.getByRole("tab").last()).toBeFocused();
 await expect.poll(()=>tabs.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
 await page.keyboard.press("Home");await expect(panels.first()).toHaveAttribute("data-timeline-year","2025");await expect(tabs.getByRole("tab").first()).toBeFocused();
 await page.emulateMedia({reducedMotion:"no-preference"});
 await page.keyboard.press("ArrowRight");await expect(panels.first()).toHaveAttribute("data-timeline-year","2024");
 await tabs.getByRole("tab",{name:"2025",exact:true}).click();await expect(panels.first()).toHaveAttribute("data-timeline-year","2025");
 const history=page.getByRole("region",{name:"Timeline",exact:true});const historyBox=await history.boundingBox(),orbitBox=await chart.boundingBox();
 expect(orbitBox!.y).toBeGreaterThan(historyBox!.y+historyBox!.height);

 await page.getByLabel("Year",{exact:true}).selectOption("2024");await expect(panels).toHaveCount(1);
 await expect(panels.first()).toHaveAttribute("data-timeline-year","2024");
 await expect(chart.locator(`[data-completion-period="03"]`)).toHaveAttribute("data-completion-count","0");
 await page.getByLabel("Year",{exact:true}).selectOption("");await expect(panels).toHaveCount(1);await expect(tabs.getByRole("tab")).toHaveCount(15);
 const undated=page.getByRole("heading",{name:/Completed without a date/}).locator("..");
 await expect(undated.getByRole("link")).toHaveCount(2);
 await expect(undated.getByRole("link").first()).toHaveAttribute("href","/log?game=fixture-game-1");
 await page.getByLabel("Year",{exact:true}).selectOption("2025");
 for(const [locale,theme] of [["en","dark"],["es-AR","light"]]){
  await context.addCookies([{name:"playlogg_locale",value:locale,url:"http://127.0.0.1:3100"},{name:"playlogg_theme",value:theme,url:"http://127.0.0.1:3100"}]);await page.reload();
  await page.getByRole("combobox").selectOption(locale==="en"?"":"2025");
  if(locale==="es-AR")await expect(page.getByRole("heading",{name:"Historial de juegos completados",exact:true})).toBeVisible();
  expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:`e2e-artifacts/completion-timeline-${info.project.name}-${locale}.png`,fullPage:true});
 }
 if(info.project.name==="mobile"){
  await page.setViewportSize({width:320,height:812});
  const monthSections=page.locator("[data-month-section]");
  await expect(monthSections).toHaveCount(12);
  for(const target of await monthSections.all()){
   const size=await target.boundingBox();expect(size!.width).toBeGreaterThanOrEqual(44);expect(size!.height).toBeGreaterThanOrEqual(44);
  }
  expect(await monthSections.first().locator("..").evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
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
 await expect(page.locator("[data-timeline-year]")).toHaveCount(0);
 await expect(page.getByRole("region",{name:"Completion chart",exact:true})).toHaveCount(0);
 const empty=page.getByRole("heading",{name:"Your timeline starts with a completion date.",exact:true}).locator("..");
 await expect(empty.getByRole("link",{name:"Log a game",exact:true})).toHaveAttribute("href","/log");
});
