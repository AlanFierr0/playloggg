import { test, expect } from "./test";
// @ts-expect-error Fixture-only session.
import { authCookie } from "./fixture-server.mjs";

test("trending games share explore hover actions for logged and unlogged games", async ({ page, context, request }) => {
  await request.post("http://127.0.0.1:3101/__trending");
  await context.addCookies([authCookie]);
  await page.goto("/");
  const trending=page.locator("section").filter({has:page.getByRole("heading",{name:"Trending games",exact:true})});
  for (const [title,label,slug] of [["Hades","Log this game","hades"],["Elden Ring: Shadow of the Erdtree","Edit log entry","elden-ring-shadow-of-the-erdtree"]]) {
    const card=trending.getByRole("article").filter({has:page.getByRole("heading",{name:title,exact:true})});
    const action=card.getByRole("link",{name:label,exact:true});
    await expect(action).toHaveCSS("opacity","0");
    await card.hover();
    await expect(action).toHaveCSS("opacity","1");
    await expect(card.locator("img")).toHaveCSS("opacity","0.9");
    await expect(action).toHaveAttribute("href",`/log?game=${slug}`);
    await action.focus();
    await expect(action).toHaveCSS("opacity","1");
  }
  await trending.getByRole("link",{name:"Edit log entry",exact:true}).click();
  await expect(page).toHaveURL(/\/log\?game=elden-ring-shadow-of-the-erdtree$/);
  await context.clearCookies();
  await page.goto("/");
  await expect(trending.getByRole("article")).toHaveCount(2);
  await expect(trending.getByRole("link",{name:/Log this game|Edit log entry/})).toHaveCount(0);
});
