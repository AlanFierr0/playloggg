import {test,expect} from "./test";
// @ts-expect-error Node-only local fake session.
import {authCookie} from "./fixture-server.mjs";
test("published comparisons show real affinity, independent tiers and reloadable handles",async ({page})=>{
 await page.goto("/compare");
 await page.getByLabel("First profile handle").fill("fixture_public");
 await page.getByLabel("Second profile handle").fill("fixture_peer");
 await page.getByRole("button",{name:"Compare profiles"}).click();
 await expect(page.locator("[data-affinity]")).toHaveText("90%");
 await expect(page.getByRole("table")).toContainText("Score: 0");
 await expect(page.getByRole("table")).toContainText("Score: Unrated");
 await expect(page.getByRole("table")).toContainText("Tier: Unassigned");
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
 await expect(page.locator("[data-affinity]")).toHaveText("—");
 await expect(page.getByText("At least 5 shared scored games are needed to show affinity.")).toBeVisible();
 await page.goto("/compare?left=fixture_public&right=fixture_empty");
 await expect(page.getByText("These profiles have no shared logged games yet.")).toBeVisible();
});
test("private and missing profiles stay unavailable even to a signed-in owner",async ({page,context})=>{
 await context.addCookies([authCookie]);
 for(const right of ["fixture_owner","missing_fixture","../../login"]){
  await page.goto(`/compare?left=fixture_public&right=${encodeURIComponent(right)}`);
  await expect(page.getByText("Comparison unavailable. Check both handles and make sure both profiles are published.")).toBeVisible();
  await expect(page.getByText("Private fixture review")).toHaveCount(0);
  await expect(page.locator("[data-affinity]")).toHaveCount(0);
 }
 await page.goto("/compare?left=fixture_public&right=fixture_public");
 await expect(page.getByText("Choose two different published profiles.")).toBeVisible();
});
