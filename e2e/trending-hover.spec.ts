import { test, expect } from "./test";
// @ts-expect-error Fixture-only session.
import { authCookie } from "./fixture-server.mjs";

test("trending games share explore hover actions for logged and unlogged games", async ({ page, context, request }) => {
  await request.post("http://127.0.0.1:3101/__trending");
  await context.addCookies([authCookie]);
  await page.goto("/");
  const trending=page.locator("section").filter({has:page.getByRole("heading",{name:"Trending games",exact:true})});
  const track=trending.getByRole("group",{name:"Trending games carousel"});
  await trending.getByRole("button",{name:"Next games",exact:true}).click();
  await expect.poll(()=>track.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
  await trending.getByRole("button",{name:"Previous games",exact:true}).click();
  await expect.poll(()=>track.evaluate(element=>element.scrollLeft)).toBe(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
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
  await expect(trending.getByRole("article")).toHaveCount(5);
  await expect(trending.getByRole("link",{name:/Log this game|Edit log entry/})).toHaveCount(0);
});


test("taste recommendations offer the shared hover and keyboard log action", async ({ page, context, request, browser }) => {
  await request.post("http://127.0.0.1:3101/__taste-recommendations");
  await context.addCookies([authCookie]);
  await page.goto("/");
  const section=page.locator("section").filter({has:page.getByRole("heading",{name:"Games for your taste",exact:true})});
  const card=section.getByRole("article").first();
  const action=card.getByRole("link",{name:"Log this game",exact:true});
  await section.scrollIntoViewIfNeeded();
  await page.mouse.move(0,0);
  await expect(action).toHaveCSS("opacity","0");
  await card.hover();
  await expect(action).toHaveCSS("opacity","1");
  await expect(action).toHaveAttribute("href","/log?game=fixture-game-3");
  await page.mouse.move(0,0);
  await action.focus();
  await expect(action).toHaveCSS("opacity","1");
  await action.click();
  await expect(page).toHaveURL(/\/log\?game=fixture-game-3$/);
  const touch=await browser.newContext({hasTouch:true,viewport:{width:375,height:812}});
  try {
    await touch.addCookies([authCookie]);
    const touchPage=await touch.newPage();
    await touchPage.goto("http://127.0.0.1:3100/");
    const touchSection=touchPage.locator("section").filter({has:touchPage.getByRole("heading",{name:"Games for your taste",exact:true})});
    await expect(touchSection.getByRole("link",{name:"Log this game",exact:true})).toHaveCSS("opacity","1");
    expect(await touchPage.locator("a a").count()).toBe(0);
  } finally {await touch.close();}
});
