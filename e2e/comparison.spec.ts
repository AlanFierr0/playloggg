import {test,expect} from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Node-only local fake session.
import {authCookie} from "./fixture-server.mjs";
test("published comparisons show real affinity, independent tiers and reloadable handles",async ({page,context},info)=>{
 await page.goto("/compare");
 await page.screenshot({path:`e2e-artifacts/compare-picker-${info.project.name}.png`,fullPage:true});
 await page.getByRole("combobox",{name:"First profile handle",exact:true}).fill("fixture_public");
 await page.getByRole("combobox",{name:"Second profile handle",exact:true}).fill("fixture_peer");
 await page.getByRole("button",{name:"Compare profiles"}).click();
 await expect(page.locator("[data-affinity]")).toHaveText("90%");
 const legend=page.getByRole("list",{name:"Games on this chart",exact:true});
 await expect(legend).toBeVisible();
 const legendGames=legend.getByRole("button");
 expect(await legendGames.count()).toBeGreaterThan(1);
 await legendGames.last().click();
 await expect(legendGames.last()).toHaveAttribute("aria-pressed","true");
 const lastSlug=await page.locator("[data-score-point]").last().getAttribute("data-score-point");
 await expect(page.locator("[data-selected-score-point]")).toHaveAttribute("data-selected-score-point",lastSlug!);
 await legendGames.first().focus();
 await expect(legendGames.first()).toHaveAttribute("aria-pressed","true");
 await expect(legendGames.last()).toHaveAttribute("aria-pressed","false");
 const firstSlug=await page.locator("[data-score-point]").first().getAttribute("data-score-point");
 await expect(page.locator("[data-selected-score-point]")).toHaveAttribute("data-selected-score-point",firstSlug!);
 await page.locator('[data-score-point="hades"]').hover();
 await expect(page.locator("[data-selected-score-point]")).toHaveAttribute("data-selected-score-point","hades");

 await expect(page.getByRole("table")).toContainText("Score: 0");
 await expect(page.getByRole("table")).toContainText("Score: Unrated");
 await expect(page.getByRole("table")).toContainText("Tier: D");
 const explanation=page.getByText("Affinity is 100 minus the average absolute score difference across games both profiles scored, rounded to one decimal. Tiers are independent and do not affect affinity.",{exact:true});
 await expect(explanation).toBeHidden();
 await page.getByText("How Taste Match works",{exact:true}).click();
 await expect(explanation).toBeVisible();
 for(const theme of ["dark","light"]){
   await context.addCookies([{name:"playlogg_theme",value:theme,url:"http://127.0.0.1:3100"}]);
   await page.reload();
   await expect(page.locator("[data-affinity]")).toHaveText("90%");
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
   await expect(page.locator("p").filter({hasText:"X · Published Fixture"})).toBeVisible();
   await expect(page.locator("p").filter({hasText:"Y · Published Peer"})).toBeVisible();
   await expect(page.getByRole("img", {name:"Shared score comparison: X — Published Fixture; Y — Published Peer",exact:true})).toBeVisible();
   await page.getByRole("heading", {name:"Score correlation",exact:true}).locator("..").screenshot({path:`e2e-artifacts/compare-axes-${theme}-${info.project.name}.png`});
   await page.screenshot({path:`e2e-artifacts/compare-results-${theme}-${info.project.name}.png`,fullPage:true});
 }

 await page.reload(); await expect(page.getByRole("combobox",{name:"First profile handle",exact:true})).toHaveValue("fixture_public");
 await expect(page.getByRole("table").locator("tbody tr")).toHaveCount(20);
 await page.getByRole("link",{name:"Next",exact:true}).click();
 await expect(page).toHaveURL(/page=2$/);
 await expect(page.getByRole("table").locator("tbody tr")).toHaveCount(5);
 await page.reload(); await expect(page.getByRole("table").locator("tbody tr")).toHaveCount(5);
 await page.getByRole("link",{name:"Previous",exact:true}).click();
 await expect(page.getByRole("table").locator("tbody tr")).toHaveCount(20);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.goto("/compare?left=alexvance&right=fixture_public");
 await expect(page.getByText("Comparison unavailable. Check both handles and make sure both profiles are published.")).toBeVisible();
 await page.goto("/compare?left=fixture_public&right=fixture_empty");
 await expect(page.getByText("These profiles have no shared logged games yet.")).toBeVisible();
 await expect(page.getByRole("button",{name:"Download share card",exact:true})).toHaveCount(0);
 await expect(page.getByRole("combobox",{name:"Share card format",exact:true})).toHaveCount(0);
});
test("other users private and missing profiles stay unavailable even to a signed-in owner",async ({page,context})=>{
 await context.addCookies([authCookie]);
 for(const right of ["alexvance","missing_fixture","../../login"]){
  await page.goto(`/compare?left=fixture_public&right=${encodeURIComponent(right)}`);
  await expect(page.getByText("Comparison unavailable. Check both handles and make sure both profiles are published.")).toBeVisible();
  await expect(page.getByText("Private fixture review")).toHaveCount(0);
  await expect(page.locator("[data-affinity]")).toHaveCount(0);
 }
 await page.goto("/compare?left=fixture_owner&right=fixture_owner");
 await expect(page.getByText("Choose two different published profiles.")).toBeVisible();
});
test("signed-in comparisons default to the owner but allow either profile to change",async ({page,context})=>{
 await context.addCookies([authCookie]);
 await page.goto("/compare");
 const first=page.getByRole("combobox",{name:"First profile handle",exact:true});
 const second=page.getByRole("combobox",{name:"Second profile handle",exact:true});
 await expect(first).toHaveValue("fixture_owner");
 await expect(first).toBeEditable();
 await second.fill("fixture_peer");
 await page.getByRole("button",{name:"Compare profiles"}).click();
 await expect(page).toHaveURL(/left=fixture_owner&right=fixture_peer/);
 await page.reload();
 await expect(first).toHaveValue("fixture_owner");
 await expect(second).toHaveValue("fixture_peer");
 await first.fill("fixture_public");
 await page.getByRole("button",{name:"Compare profiles"}).click();
 await expect(page).toHaveURL(/left=fixture_public&right=fixture_peer/);
 await expect(first).toHaveValue("fixture_public");
 await expect(second).toHaveValue("fixture_peer");
 await expect(page.locator("[data-affinity]")).toHaveText("90%");
 await expect(page.getByRole("table").locator('a[href^="/u/fixture_public/game/"]').first()).toBeVisible();
 await expect(page.getByRole("table").locator('a[href^="/log?"]')).toHaveCount(0);
 await page.getByRole("link",{name:"Next",exact:true}).click();
 await page.reload();
 await expect(first).toHaveValue("fixture_public");
 await expect(second).toHaveValue("fixture_peer");
 await page.goto("/compare?left=fixture_public&right=fixture_owner");
 await expect(first).toHaveValue("fixture_public");
 await expect(second).toHaveValue("fixture_owner");
 await expect(page.getByRole("region",{name:"Profile comparison"}).getByRole("link",{name:"Fixture Owner",exact:true})).toHaveAttribute("href","/profile");
 await page.goto("/compare?left=alexvance&right=fixture_public");
 await expect(page.locator("[data-affinity]")).toHaveCount(0);
 await expect(page.getByText("Comparison unavailable. Check both handles and make sure both profiles are published.")).toBeVisible();
 await page.goto("/compare");
 await expect(first).toHaveValue("fixture_owner");
});


test("compare fields search public profiles live and support pointer and keyboard selection", async ({page,context},info) => {
 await context.addCookies([authCookie]);await page.goto("/compare");
 const first=page.getByRole("combobox",{name:"First profile handle",exact:true}),second=page.getByRole("combobox",{name:"Second profile handle",exact:true});
 await expect(first).toHaveValue("fixture_owner");
 await first.fill("Published");
 await expect(page.getByRole("option",{name:/Published Fixture/})).toBeVisible();
 await expect(page.getByRole("option",{name:/Published Peer/})).toBeVisible();
 expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`e2e-artifacts/compare-profile-dropdown-${info.project.name}.png`});
 await page.getByRole("option",{name:/Published Fixture/}).click();
 await expect(first).toHaveValue("fixture_public");await expect(page.getByRole("listbox")).toHaveCount(0);
 await second.fill("@FIXTURE_PEER");
 await expect(page.getByRole("option",{name:/Published Peer/})).toBeVisible();
 await second.press("ArrowDown");await second.press("Enter");
 await expect(second).toHaveValue("fixture_peer");await expect(page).toHaveURL(/\/compare$/);
 await second.fill("fixture_owner");await expect(page.getByText("No profiles match this search.",{exact:true})).toBeVisible();
 await second.fill("Published Peer");await expect(page.getByRole("option",{name:/Published Peer/})).toBeVisible();
 await second.press("Escape");await expect(page.getByRole("listbox")).toHaveCount(0);
 await second.fill("fixture_peer");await expect(page.getByRole("option",{name:/Published Peer/})).toBeVisible();
 await second.press("ArrowDown");await second.press("Enter");
 await page.getByRole("button",{name:"Compare profiles",exact:true}).click();
 await expect(page).toHaveURL(/left=fixture_public&right=fixture_peer/);await expect(page.locator("[data-affinity]")).toHaveText("90%");
});
