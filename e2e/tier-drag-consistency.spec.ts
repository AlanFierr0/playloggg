import {test,expect} from "./test";
// @ts-expect-error Loopback test identity only.
import {authCookie} from "./fixture-server.mjs";

test("dense tier boards accept drops on occupied cards from covers and titles",async({page,context,request},info)=>{
 await context.addCookies([authCookie]);await request.post("http://127.0.0.1:3101/__tier-drag-board");await page.goto("/tiers");
 const target=page.locator('#tier-a [data-tier-game="fixture-game-6"]');
 const sources=["hades","elden-ring-shadow-of-the-erdtree","fixture-game-0","fixture-game-1"];
 for(const [index,slug] of sources.entries()){
  const card=page.locator(`[data-tier-game="${slug}"]`);
  await target.scrollIntoViewIfNeeded();await card.scrollIntoViewIfNeeded();
  if(index%2===0){
   const handle=card.getByRole("button",{name:/Drag to change tier/}),a=(await handle.boundingBox())!;
   await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();
   await page.mouse.move(a.x+a.width/2+12,a.y+a.height/2,{steps:3});
   await target.scrollIntoViewIfNeeded();const b=(await target.boundingBox())!;
   await page.mouse.move(b.x+b.width/2,b.y+Math.min(60,b.height/3),{steps:12});await page.mouse.up();
  }else await card.getByRole("link").dragTo(target.getByRole("link"));
  await expect(page.locator(`#tier-a [data-tier-game="${slug}"]`)).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("Tier saved.");
 }
 await page.screenshot({path:`e2e-artifacts/dense-tier-drag-${info.project.name}.png`,fullPage:true});
 await page.reload();for(const slug of sources)await expect(page.locator(`#tier-a [data-tier-game="${slug}"]`)).toBeVisible();
});
test("a native drag takeover cannot cancel the card's pending tier move",async({page,context,request})=>{
 await context.addCookies([authCookie]);await request.post("http://127.0.0.1:3101/__tier-drag-board");await page.goto("/tiers");
 const card=page.locator('[data-tier-game="hades"]'),handle=card.getByRole("button",{name:/Drag to change tier/});
 await handle.scrollIntoViewIfNeeded();const a=(await handle.boundingBox())!;
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();
 const nativeStarted=await card.evaluate(element=>element.dispatchEvent(new DragEvent("dragstart",{bubbles:true,cancelable:true,dataTransfer:new DataTransfer()})));
 // Browsers cancel the pointer stream when an uncanceled native drag starts.
 if(nativeStarted)await handle.dispatchEvent("pointercancel",{pointerId:1,buttons:0});
 const target=page.locator("#tier-a");await target.scrollIntoViewIfNeeded();const b=(await target.boundingBox())!;
 await page.mouse.move(b.x+b.width/2,b.y+50,{steps:12});
 if(nativeStarted){await target.evaluate(element=>{const d=new DataTransfer();d.setData("text/plain","hades");element.dispatchEvent(new DragEvent("dragover",{bubbles:true,cancelable:true,dataTransfer:d}));element.dispatchEvent(new DragEvent("drop",{bubbles:true,cancelable:true,dataTransfer:d}));});}
 await page.mouse.up();await expect(page.locator('#tier-a [data-tier-game="hades"]')).toBeVisible();
 await expect(page.getByRole("status")).toHaveText("Tier saved.");
});
