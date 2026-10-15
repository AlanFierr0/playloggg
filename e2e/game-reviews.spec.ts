import {test,expect} from "./test";
// @ts-expect-error Local fixture identity only.
import {authCookie} from "./fixture-server.mjs";
const fixture="http://127.0.0.1:3101";
test("game reviews load bounded public batches, rank helpfulness and reuse vote controls",async({page,context,request})=>{
 await context.addCookies([authCookie]);await request.post(`${fixture}/__game-reviews`);
 await page.goto("/game/hades");
 const reviews=page.getByRole("region",{name:"Community reviews",exact:true});
 await expect(reviews.locator("article")).toHaveCount(24);
 await expect(reviews.locator("article").first()).toContainText("Game Reviewer 0");
 expect(await page.content()).not.toContain("Hidden community review");expect(await page.content()).not.toContain("Link-only community review");
 await reviews.getByRole("button",{name:"Load more",exact:true}).click();
 await expect(reviews.locator("article")).toHaveCount(31);
 await expect(reviews.getByRole("button",{name:"Load more",exact:true})).toHaveCount(0);
 const first=reviews.locator("article").first();
 await first.getByRole("button",{name:/^Not helpful/}).click();
 await expect(first.getByRole("button",{name:/^Not helpful/})).toHaveAttribute("aria-pressed","true");
 await expect(first.getByRole("button",{name:/^Helpful/})).toHaveText(/Helpful1/);
 const state=await (await request.get(`${fixture}/__state`)).json();
 expect(state.reviewVotes.find((vote:{reviewer_profile_id:number;voter_profile_id:number})=>vote.reviewer_profile_id===1000&&vote.voter_profile_id===2).value).toBe(-1);
});
test("empty or unavailable community reviews do not block game details",async({page,request})=>{
 await page.goto("/game/fixture-game-0");
 await expect(page.getByText("No community reviews yet.",{exact:true})).toBeVisible();
 await request.get(`${fixture}/__home-failure`);await page.reload();
 await expect(page.getByText("Community reviews could not be loaded.",{exact:true})).toBeVisible();
 await expect(page.getByRole("heading",{name:"Fixture Game 00",exact:true})).toBeVisible();
});
