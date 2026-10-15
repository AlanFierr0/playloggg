import {test,expect} from "./test";
// @ts-expect-error Local fixture identity only.
import {authCookie} from "./fixture-server.mjs";
test("data export is owner-only, downloadable, complete and never cached",async({page,context,request})=>{
 const guest=await request.get("/api/profile/export?format=json");expect(guest.status()).toBe(401);expect(guest.headers()["cache-control"]).toContain("no-store");
 await context.addCookies([authCookie]);await page.goto("/settings");
 await expect(page.getByRole("heading",{name:"Export your data",exact:true})).toBeVisible();
 const [download]=await Promise.all([page.waitForEvent("download"),page.getByRole("link",{name:"Full copy (JSON)",exact:true}).click()]);
 expect(download.suggestedFilename()).toMatch(/^playlogg-fixture_owner-.*\.json$/);
 const result=await context.request.get("/api/profile/export?format=json");
 expect(result.headers()["cache-control"]).toContain("no-store");const data=await result.json();
 expect(data.profile.handle).toBe("fixture_owner");expect(data.logs).toHaveLength(1);expect(data.logs[0].review).toBe("Private fixture review");expect(data.logs.some((log:{review:string})=>log.review==="Public fixture review")).toBe(false);
 expect(data.ranking.slugs).toEqual(["elden-ring-shadow-of-the-erdtree"]);expect(data.profile.tierRanges.S).toEqual([95,100]);
 const csv=await context.request.get("/api/profile/export?format=csv");expect(csv.status()).toBe(200);expect(csv.headers()["content-type"]).toContain("text/csv");expect(await csv.text()).toContain('"Private fixture review"');
 expect((await context.request.get("/api/profile/export?format=other")).status()).toBe(400);
});
