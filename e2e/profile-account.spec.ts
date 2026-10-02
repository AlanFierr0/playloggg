import {test,expect} from "./test";
// @ts-expect-error Local fixture only.
import {authCookie} from "./fixture-server.mjs";

test("profile sign out clears the session and preserves the profile",async({page,context})=>{
  await context.addCookies([authCookie]);await page.goto("/profile");
  await page.getByRole("button",{name:"Sign out",exact:true}).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/profile");await expect(page).toHaveURL(/\/login$/);
  const state=await (await fetch("http://127.0.0.1:3101/__state")).json();
  expect(state.profiles.some((row:{id:number})=>row.id===2)).toBe(true);
  expect(state.ratings.some((row:{profile_id:number})=>row.profile_id===2)).toBe(true);
});

test("profile deletion requires the handle, allows cancellation and retry, and keeps other profiles and catalog",async({page,context})=>{
  await context.addCookies([authCookie]);await page.goto("/profile");
  await page.getByRole("button",{name:"Delete profile",exact:true}).click();
  const popup=page.getByRole("dialog",{name:"Delete profile",exact:true});
  await expect(popup).toBeVisible();
  await expect(popup.getByRole("button",{name:"Delete permanently",exact:true})).toBeDisabled();
  await popup.getByRole("textbox").fill("fixture_public");
  await expect(popup.getByRole("button",{name:"Delete permanently",exact:true})).toBeDisabled();
  await popup.getByRole("button",{name:"Cancel",exact:true}).click();await expect(popup).not.toBeVisible();
  await page.getByRole("button",{name:"Delete profile",exact:true}).click();
  await popup.getByRole("textbox").fill("fixture_owner");
  const before=await (await fetch("http://127.0.0.1:3101/__state")).json();
  await fetch("http://127.0.0.1:3101/__fail-save",{method:"POST"});
  await popup.getByRole("button",{name:"Delete permanently",exact:true}).click();
  await expect(popup.getByText("Your profile could not be deleted. Please retry.")).toBeVisible();
  expect((await (await fetch("http://127.0.0.1:3101/__state")).json()).ratings).toEqual(before.ratings);
  await popup.getByRole("button",{name:"Delete permanently",exact:true}).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByRole("heading",{name:"Create your profile",exact:true})).toBeVisible();
  const after=await (await fetch("http://127.0.0.1:3101/__state")).json();
  expect(after.profiles).toEqual(before.profiles.filter((row:{id:number})=>row.id!==2));
  expect(after.ratings).toEqual(before.ratings.filter((row:{profile_id:number})=>row.profile_id!==2));
  expect(after.games).toEqual(before.games);
});

test("public profiles do not offer account controls",async({page,context})=>{
  await context.addCookies([authCookie]);await page.goto("/u/fixture_public");
  await expect(page.getByRole("button",{name:"Delete profile",exact:true})).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Sign out",exact:true})).toHaveCount(0);
});
