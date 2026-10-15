import {test,expect} from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Loopback identity only.
import {authCookie} from "./fixture-server.mjs";

test("bounded profile searches expose the rest of the directory",async({page,context})=>{
 await context.addCookies([authCookie]);await fetch("http://127.0.0.1:3101/__many-profiles",{method:"POST"});
 const response=await context.request.get("/api/profiles/search?q=directory");const data=await response.json();expect(data.profiles).toHaveLength(24);expect(data.hasMore).toBe(true);
 await page.goto("/search?q=directory");await page.getByRole("button",{name:/^Profiles/}).click();
 await expect(page.getByRole("button",{name:/^Profiles\s*\(24\+\)$/})).toBeVisible();
 await page.getByRole("link",{name:"View all matching profiles"}).click();await expect(page).toHaveURL(/\/people\?q=directory/);
 await page.getByRole("link",{name:"Next",exact:true}).click();await expect(page.getByText("Directory Player 29",{exact:true})).toBeVisible();
 await page.goto("/compare");await page.getByLabel("Second profile handle",{exact:true}).fill("directory");
 await expect(page.getByRole("option")).toHaveCount(24);await expect(page.getByRole("link",{name:"View all matching profiles"})).toHaveAttribute("href","/people?q=directory");
 await page.getByLabel("Second profile handle",{exact:true}).press("ArrowDown");await page.getByLabel("Second profile handle",{exact:true}).press("Enter");await expect(page.getByLabel("Second profile handle",{exact:true})).toHaveValue("directory_00");
});

test("footer and profile tabs stay compact and accessible in both themes",async({page,context},info)=>{
 await page.goto("/u/fixture_public/stats");const nav=page.getByRole("navigation",{name:"Profile sections"});
 const active=nav.getByRole("link",{name:"Stats",exact:true});await expect(active).toBeInViewport();
 if(info.project.name==="mobile")expect((await nav.boundingBox())!.height).toBeLessThan(95);
 await expect(page.getByRole("link",{name:"Creator’s website"})).toHaveAttribute("href","https://alanfierr0.github.io/");
 await expect(page.getByRole("link",{name:"Feedback and bug reports"})).toHaveAttribute("href","https://github.com/AlanFierr0/playloggg/issues");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
 await page.screenshot({path:`e2e-artifacts/audit-navigation-dark-${info.project.name}.png`,fullPage:true});
 await context.addCookies([{name:"playlogg_theme",value:"light",url:"http://127.0.0.1:3100"}]);await page.reload();await expect(page.locator("html")).toHaveClass(/light/);
 await page.screenshot({path:`e2e-artifacts/audit-navigation-light-${info.project.name}.png`,fullPage:true});
 expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
 await context.addCookies([authCookie]);await page.goto("/profile/stats");await expect(page.getByRole("navigation",{name:"Profile sections"}).getByRole("link",{name:"Stats",exact:true})).toBeInViewport();
});
