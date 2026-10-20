import {test,expect} from "./test";
// @ts-expect-error Local fixture only.
import {authCookie} from "./fixture-server.mjs";

test("profile sign out clears the session and preserves the profile",async({page,context})=>{
  await context.addCookies([authCookie]);await page.goto("/profile");
  await page.getByRole("button",{name:"Sign out",exact:true}).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/profile");await expect(page).toHaveURL(/\/login\?next=%2Fprofile$/);
  const state=await (await fetch("http://127.0.0.1:3101/__state")).json();
  expect(state.profiles.some((row:{id:number})=>row.id===2)).toBe(true);
  expect(state.ratings.some((row:{profile_id:number})=>row.profile_id===2)).toBe(true);
});

test("profile deletion requires the handle, allows cancellation and retry, and keeps other profiles and catalog",async({page,context})=>{
  await context.addCookies([authCookie]);await page.goto("/profile");
  await page.getByRole("button",{name:"Delete account",exact:true}).click();
  const popup=page.getByRole("dialog",{name:"Delete account",exact:true});
  await expect(popup).toBeVisible();
  await expect(popup.getByRole("button",{name:"Delete permanently",exact:true})).toBeDisabled();
  await popup.getByRole("textbox").fill("fixture_public");
  await expect(popup.getByRole("button",{name:"Delete permanently",exact:true})).toBeDisabled();
  await popup.getByRole("button",{name:"Cancel",exact:true}).click();await expect(popup).not.toBeVisible();
  await page.getByRole("button",{name:"Delete account",exact:true}).click();
  await popup.getByRole("textbox").fill("fixture_owner");
  const before=await (await fetch("http://127.0.0.1:3101/__state")).json();
  await fetch("http://127.0.0.1:3101/__fail-save",{method:"POST"});
  await popup.getByRole("button",{name:"Delete permanently",exact:true}).click();
  await expect(popup.getByText("Your account could not be deleted. Please retry.")).toBeVisible();
  expect((await (await fetch("http://127.0.0.1:3101/__state")).json()).ratings).toEqual(before.ratings);
  await popup.getByRole("button",{name:"Delete permanently",exact:true}).click();
  await expect(page).toHaveURL(/\/login\?deleted=1$/);
  await expect(page.getByText("Your account has been deleted. Create a new account to start again.")).toBeVisible();
  await expect(page.getByRole("button",{name:"Create account",exact:true}).first()).toHaveAttribute("aria-pressed","true");
  const after=await (await fetch("http://127.0.0.1:3101/__state")).json();
  expect(after.profiles).toEqual(before.profiles.filter((row:{id:number})=>row.id!==2));
  expect(after.ratings).toEqual(before.ratings.filter((row:{profile_id:number})=>row.profile_id!==2));
  expect(after.games).toEqual(before.games);
  expect(after.accountDeleted).toBe(true);
  expect((await context.cookies()).some(cookie=>cookie.name.startsWith("sb-127-auth-token"))).toBe(false);
  await context.addCookies([authCookie]);
  await page.goto("/profile");await expect(page).toHaveURL(/\/login\?next=%2Fprofile$/);
});

test("public profiles do not offer account controls",async({page,context})=>{
  await context.addCookies([authCookie]);await page.goto("/u/fixture_public");
  await expect(page.getByRole("button",{name:"Delete account",exact:true})).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Sign out",exact:true})).toHaveCount(0);
});


test("profileless accounts can finish deletion and old credentials stop working",async({page,context})=>{
  await context.addCookies([authCookie]);
  await fetch("http://127.0.0.1:3101/__profileless",{method:"POST"});
  await page.goto("/signup");
  await page.getByRole("button",{name:"Delete account",exact:true}).click();
  const popup=page.getByRole("dialog",{name:"Delete account",exact:true});
  await popup.getByRole("textbox").fill("DELETE");
  await popup.getByRole("button",{name:"Delete permanently",exact:true}).click();
  await expect(page).toHaveURL(/\/login\?deleted=1$/);
  await page.getByRole("button",{name:"Sign in",exact:true}).click();
  await page.getByLabel("Email",{exact:true}).fill("owner@fixture.test");
  await page.getByLabel("Password",{exact:true}).fill("fixture-password-123");
  await page.getByRole("button",{name:"Sign in with email",exact:true}).click();
  await expect(page).toHaveURL(/\/login\?deleted=1$/);
  expect((await (await fetch("http://127.0.0.1:3101/__state")).json()).accountDeleted).toBe(true);
});

test("account deletion removes only owned pictures and permits retry after Auth failure",async({page,context})=>{
  await context.addCookies([authCookie]);
  await fetch("http://127.0.0.1:3101/__deletion-pictures",{method:"POST"});
  await fetch("http://127.0.0.1:3101/__fail-storage-delete",{method:"POST"});
  await page.goto("/profile");
  await page.getByRole("button",{name:"Delete account",exact:true}).click();
  const popup=page.getByRole("dialog",{name:"Delete account",exact:true});
  await popup.getByRole("textbox").fill("fixture_owner");
  await popup.getByRole("button",{name:"Delete permanently",exact:true}).click();
  await expect(popup.getByText("Your account could not be deleted. Please retry.")).toBeVisible();
  let data=await (await fetch("http://127.0.0.1:3101/__state")).json();expect(data.accountDeleted).toBe(false);expect(data.profiles.some((p:{id:number})=>p.id===2)).toBe(true);expect(data.pictures.length).toBe(2);
  await fetch("http://127.0.0.1:3101/__fail-auth-delete",{method:"POST"});
  await popup.getByRole("button",{name:"Delete permanently",exact:true}).click();
  await expect(popup.getByText(/account deletion is incomplete/)).toBeVisible();
  data=await (await fetch("http://127.0.0.1:3101/__state")).json();expect(data.accountDeleted).toBe(false);expect(data.profiles.some((p:{id:number})=>p.id===2)).toBe(false);expect(data.pictures).toEqual(["3/22222222-2222-4222-8222-222222222222.webp"]);
  await popup.getByRole("textbox").fill("DELETE");
  await popup.getByRole("button",{name:"Delete permanently",exact:true}).click();
  await expect(page).toHaveURL(/\/login\?deleted=1$/);
});
