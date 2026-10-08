import {test,expect} from "./test";
import AxeBuilder from "@axe-core/playwright";
// @ts-expect-error Node-only local fake session.
import {authCookie} from "./fixture-server.mjs";
test("published comparisons show real affinity, independent tiers and reloadable handles",async ({page,context},info)=>{
 await page.goto("/compare");
 await page.screenshot({path:`e2e-artifacts/compare-picker-${info.project.name}.png`,fullPage:true});
 await page.getByLabel("First profile handle").fill("fixture_public");
 await page.getByLabel("Second profile handle").fill("fixture_peer");
 await page.getByRole("button",{name:"Compare profiles"}).click();
 await expect(page.locator("[data-affinity]")).toHaveText("90%");
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
   await expect(page.getByText("X · Published Fixture", {exact:true})).toBeVisible();
   await expect(page.getByText("Y · Published Peer", {exact:true})).toBeVisible();
   await expect(page.getByRole("img", {name:"Shared score comparison: X — Published Fixture; Y — Published Peer",exact:true})).toBeVisible();
   await page.getByRole("heading", {name:"Score correlation",exact:true}).locator("..").screenshot({path:`e2e-artifacts/compare-axes-${theme}-${info.project.name}.png`});
   await page.screenshot({path:`e2e-artifacts/compare-results-${theme}-${info.project.name}.png`,fullPage:true});
 }

 await page.reload(); await expect(page.getByLabel("First profile handle")).toHaveValue("fixture_public");
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
 await expect(page.getByRole("button",{name:"Download share card",exact:true})).toBeVisible();
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
 const first=page.getByLabel("First profile handle");
 const second=page.getByLabel("Second profile handle");
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
