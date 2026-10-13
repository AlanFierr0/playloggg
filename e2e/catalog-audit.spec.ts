import {test,expect} from "./test";
const fixture="http://127.0.0.1:3101";
test("catalog typing sends one debounced query rather than a request per character",async({page,request})=>{
 await page.goto("/games");
 await request.get(`${fixture}/__reset-request-counts`);
 await page.locator("#games-query").pressSequentially("Hades",{delay:50});
 await expect(page).toHaveURL(/q=Hades/);
 await expect(page.locator("[data-catalog-game]")).toHaveCount(1);
 const state=await (await request.get(`${fixture}/__state`)).json();
 expect(state.requestCounts["POST /rest/v1/rpc/catalog_page"]).toBe(1);
});

test("catalog scrolling appends only the next 25 unique cards",async({page,request})=>{
 await page.goto("/games");
 await expect(page.locator("[data-catalog-game]")).toHaveCount(25);
 await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
 await expect(page).toHaveURL(/page=2/);
 await expect(page.locator("[data-catalog-game]")).toHaveCount(50);
 const state=await (await request.get(`${fixture}/__state`)).json();
 expect(state.catalogBatches.every((batch:{count:number})=>batch.count<=25)).toBe(true);
 const slugs=await page.locator("[data-catalog-game]").evaluateAll(elements=>elements.map(element=>element.getAttribute("data-catalog-game")));
 expect(new Set(slugs).size).toBe(50);
 await page.reload();
 await expect(page.locator("[data-catalog-game]")).toHaveCount(50);
});
