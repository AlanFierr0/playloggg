import {test,expect} from './test';
import sharp from 'sharp';
// @ts-expect-error Fixture-only session.
import {authCookie} from './fixture-server.mjs';

test('email login options, recovery and verified profile routing work without sample content',async({page},testInfo)=>{
  await page.goto('/login');
  await expect(page.getByText('Owner email-link sign-in',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Send sign-in link',exact:true})).toHaveCount(0);
  await page.screenshot({path:`e2e-artifacts/login-${testInfo.project.name}.png`,fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.getByRole('button',{name:'Sign in with Steam'}).evaluate(button=>parseFloat(getComputedStyle(button).borderTopLeftRadius))).toBeGreaterThanOrEqual(12);
  await page.getByRole('button',{name:'Email link',exact:true}).click();
  await expect(page.getByLabel('Password',{exact:true})).toHaveCount(0);
  await page.getByLabel('Email',{exact:true}).fill('new-player@example.com');
  await page.getByRole('button',{name:'Send sign-in link',exact:true}).click();
  await expect(page.getByText('Check your inbox for a sign-in link. New accounts start with a public profile.')).toBeVisible();
  await page.getByRole('button',{name:'Create account',exact:true}).first().click();
  await page.getByLabel('Email',{exact:true}).first().fill('new-player@example.com');
  await page.getByLabel('Password',{exact:true}).fill('fixture-password-123');
  await page.getByRole('button',{name:'Create account',exact:true}).last().click();
  await expect(page.getByText('Check your inbox to verify your email, then sign in and create your public profile.')).toBeVisible();
  await page.getByRole('button',{name:'Forgot password?',exact:true}).click();
  await page.getByLabel('Email',{exact:true}).first().fill('owner@fixture.test');
  await page.getByRole('button',{name:'Send reset link',exact:true}).click();
  await expect(page.getByText('If this account exists, a password reset link has been sent. Check your inbox.')).toBeVisible();
  await page.getByRole('button',{name:'Back to sign in',exact:true}).click();
  await page.getByLabel('Email',{exact:true}).first().fill('owner@fixture.test');
  await page.getByLabel('Password',{exact:true}).fill('fixture-password-123');
  await page.getByRole('button',{name:'Show password',exact:true}).click();
  await expect(page.getByLabel('Password',{exact:true})).toHaveAttribute('type','text');
  await page.getByRole('button',{name:'Sign in with email',exact:true}).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('heading',{name:'Fixture Owner',exact:true})).toBeVisible();
});

test('pictures persist, stay private, follow publication and revert to initials after removal',async({page,context,browser})=>{
  await context.addCookies([authCookie]);await page.goto('/settings');
  const picture=await sharp({create:{width:64,height:64,channels:3,background:'#ffc665'}}).png().toBuffer();
  await page.getByLabel('Choose a profile picture').setInputFiles({name:'picture.png',mimeType:'image/png',buffer:picture});
  await page.getByRole('button',{name:'Upload picture',exact:true}).click();
  await expect(page.getByText('Profile picture saved.',{exact:true})).toBeVisible();
  await page.reload();await expect(page.getByRole('img',{name:'Fixture Owner',exact:true}).last()).toBeVisible();
  const avatar=page.getByRole('img',{name:'Fixture Owner',exact:true}).last();
  await expect.poll(()=>avatar.evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const src=(await avatar.getAttribute('src'))!;
  const guest=await browser.newContext();
  try {
    expect((await guest.request.get(`http://127.0.0.1:3100${src}`)).status()).toBe(404);
    await page.getByRole('button',{name:'Publish profile',exact:true}).click();
    await expect(page.getByRole('button',{name:'Make profile private',exact:true})).toBeVisible();
    const response=await guest.request.get(`http://127.0.0.1:3100${src}`);expect(response.status()).toBe(200);expect(response.headers()['cache-control']).toBe('private, no-store');
    await page.getByRole('button',{name:'Make profile private',exact:true}).click();await expect(page.getByRole('button',{name:'Publish profile',exact:true})).toBeVisible();
    expect((await guest.request.get(`http://127.0.0.1:3100${src}`)).status()).toBe(404);
  } finally {await guest.close();}
  await page.getByRole('button',{name:'Remove picture',exact:true}).click();
  await expect(page.getByText('Profile picture removed.',{exact:true})).toBeVisible();
  await page.reload();await expect(page.getByRole('img',{name:'Fixture Owner initials',exact:true}).last()).toBeVisible();
});

test('guest routes contain no demo player and missing-game search asks for sign-in',async({page})=>{
  await page.goto('/games?q=absent-game');
  await expect(page.getByRole('link',{name:'Sign in to search more games and import a game.'})).toBeVisible();
  await expect(page.getByText(/Sample Player|Sample profile/)).toHaveCount(0);
  await page.goto('/u/alexvance');await expect(page.getByRole('heading',{name:'Nothing to play here.'})).toBeVisible();
  await page.goto('/profile');await expect(page).toHaveURL(/\/login$/);
});

test('magic links verify before sign-in and reject expired links',async({page})=>{
  // Next's local callback URL uses localhost; cookies must stay on that host.
  await page.goto('http://localhost:3100/auth/confirm?token_hash=expired-link&type=email');
  await expect(page).toHaveURL(/\/login\?error=link$/);
  await expect(page.getByRole('alert').filter({hasText:'That email link is invalid or expired.'})).toContainText('That email link is invalid or expired.');
  await page.goto('http://localhost:3100/auth/confirm?token_hash=fixture-email-link&type=email');
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('heading',{name:'Fixture Owner',exact:true})).toBeVisible();
});
