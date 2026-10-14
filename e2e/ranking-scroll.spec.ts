import { test, expect } from "./test";

// @ts-expect-error Test-only fixture exports a fake session.
import { authCookie } from "./fixture-server.mjs";

for (const owner of [false, true]) {
test(`${owner ? "owner" : "public"} ranking appends games on scroll and resets filters`, async ({ page, context }, info) => {
  if (owner) await context.addCookies([authCookie]);
  expect((await fetch(`http://127.0.0.1:3101/${owner ? "__owner-ranking-scroll" : "__ranking-scroll"}`, {method:"POST"})).ok).toBe(true);
  await page.goto(owner ? "/profile/ranking" : "/u/fixture_public/ranking");
  if (owner) await page.getByRole("button", {name:"By score", exact:true}).click();
  const cards = page.locator("article[data-rank]");
  await expect(cards).toHaveCount(8);
  if (info.project.name === "desktop") expect((await cards.first().boundingBox())!.width).toBeLessThan(240);
  await expect(page.getByRole("button", {name:"Next Page", exact:true})).toHaveCount(0);
  const first = await cards.first().getAttribute("data-rank");
  await cards.last().scrollIntoViewIfNeeded();
  await expect(cards).toHaveCount(16);
  expect(await cards.first().getAttribute("data-rank")).toBe(first);
  await cards.last().scrollIntoViewIfNeeded();
  await expect(cards).toHaveCount(20);
  await expect(page.getByRole("button", {name:"Load more", exact:true})).toHaveCount(0);
  await page.locator('[data-filter="backlog"]').click();
  await expect(cards).toHaveCount(0);
  await expect(page.getByText(owner ? "Your backlog is empty. Choose Backlog in the game log and save; a score is optional." : "This profile's backlog is empty.")).toBeVisible();
  await page.locator('[data-filter="masterpieces"]').click();
  await expect(cards).toHaveCount(8);
  await cards.last().scrollIntoViewIfNeeded();
  await expect(cards).toHaveCount(11);
  expect(await cards.evaluateAll(nodes=>nodes.map(node=>Number(node.getAttribute("data-score"))))).toEqual(Array.from({length:11},(_,i)=>100-i));
  await page.addInitScript(() => { Object.defineProperty(window,"IntersectionObserver",{value:undefined,configurable:true}); });
  await page.reload();
  if (owner) await page.getByRole("button", {name:"By score", exact:true}).click();
  await expect(cards).toHaveCount(8);
  await page.getByRole("button", {name:"Load more", exact:true}).click();
  await expect(cards).toHaveCount(16);
  await page.getByRole("button", {name:"Load more", exact:true}).click();
  await expect(cards).toHaveCount(20);
  await expect(page.getByRole("button", {name:"Load more", exact:true})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

}
