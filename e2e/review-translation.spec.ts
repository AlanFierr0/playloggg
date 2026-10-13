import {test,expect} from "./test";
const fixture="http://127.0.0.1:3101";
test("language changes translate reviews, preserve links, reveal originals and reuse the cache",async({page,request})=>{
 await request.get(`${fixture}/__translation-review`);
 await page.goto("/u/fixture_public/reviews");
 await expect(page.getByText("Review with sources",{exact:false}).first()).toBeVisible();
 const language=page.getByRole("button",{name:"Switch to Spanish (Argentina)",exact:true}).filter({visible:true});
 if(!await language.isVisible())await page.getByRole("button",{name:"Navigation menu",exact:true}).click();
 await language.click();
 await expect(page.getByText("Reseña con fuentes",{exact:false}).first()).toBeVisible();
 await expect(page.getByText("Traducido automáticamente con DeepL",{exact:true}).first()).toBeVisible();
 await expect(page.getByRole("link",{name:"https://www.youtube.com/watch?v=example&t=637s",exact:true})).toHaveAttribute("href","https://www.youtube.com/watch?v=example&t=637s");
 await page.getByRole("button",{name:"Mostrar original",exact:true}).first().click();
 await expect(page.getByText("Review with sources",{exact:false}).first()).toBeVisible();
 const before=await (await request.get(`${fixture}/__state`)).json();
 await page.reload();await expect(page.getByText("Reseña con fuentes",{exact:false}).first()).toBeVisible();
 const after=await (await request.get(`${fixture}/__state`)).json();expect(after.translateCalls).toBe(before.translateCalls);
 expect(after.ratings.find((row:{profile_id:number;game_id:number})=>row.profile_id===3&&row.game_id===1).review).toContain("Review with sources");
 expect((await request.get("/api/reviews/translate?profile=2&game=elden-ring-shadow-of-the-erdtree&language=es-AR")).status()).toBe(404);
});
test("unavailable translation leaves the original visible without a translated notice",async({page,request,context})=>{
 await request.get(`${fixture}/__translation-failure`);
 await context.addCookies([{name:"playlogg_locale",value:"es-AR",url:"http://127.0.0.1:3100"}]);
 await page.goto("/u/fixture_public/reviews");
 await expect(page.getByText("Public fixture review",{exact:true})).toBeVisible();
 await expect.poll(async()=> (await (await request.get(`${fixture}/__state`)).json()).translateCalls).toBeGreaterThan(0);
 await expect(page.getByText("Traducido automáticamente con DeepL",{exact:true})).toHaveCount(0);
});
