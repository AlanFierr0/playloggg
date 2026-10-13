import {test,expect} from "./test";

test("review sorting uses review edit dates and net helpfulness",async({page})=>{
 await fetch("http://127.0.0.1:3101/__review-dates",{method:"POST"});await page.goto("/u/fixture_public/reviews");
 const articles=page.locator("main article");await expect(articles).toHaveCount(2);await expect(articles.first()).toContainText("Recent review");
 await expect(articles.last().locator("time")).toHaveAttribute("datetime","2020-01-01T00:00:00Z");
 await page.getByRole("combobox",{name:"Sort reviews",exact:true}).selectOption("helpful");await expect(articles.first()).toContainText("Public fixture review");
 await page.getByRole("combobox",{name:"Sort reviews",exact:true}).selectOption("newest");await expect(articles.first()).toContainText("Recent review");
});
