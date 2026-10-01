import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {eligibleAccount} from '../src/lib/account-identity.ts';
import {emailAddress,passwordValue} from '../src/lib/password-input.ts';
import {avatarFormat,avatarPath,avatarSource} from '../src/lib/avatar-input.ts';
import {bootstrapCatalog,bootstrapQuery} from './bootstrap-catalog.mjs';
function load(file,deps,globals={}) {
  const code=ts.transpileModule(readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const context={exports:{},require:name=>{assert.ok(name in deps,`Unexpected dependency: ${name}`);return deps[name];},...globals};
  vm.runInNewContext(code,context);return context.exports;
}
test('accounts require Auth-verified email or server-owned Steam identity, never editable metadata',()=>{
  const user={app_metadata:{},email:'player@example.com'};
  assert.equal(eligibleAccount(user),false);
  assert.equal(eligibleAccount({...user,user_metadata:{playlogg_steam_id:'76561198000000000'}}),false);
  assert.equal(eligibleAccount({...user,email_confirmed_at:'2026-10-01'}),true);
  assert.equal(eligibleAccount({...user,email_confirmed_at:'2026-10-01',is_anonymous:true}),false);
  assert.equal(eligibleAccount({email:'steam.76561198000000000@users.playlogg.invalid',email_confirmed_at:'2026-10-01',app_metadata:{}}),false);
  assert.equal(eligibleAccount({app_metadata:{playlogg_steam_id:'76561198000000000'}}),true);
  assert.equal(emailAddress(' player@example.com '),'player@example.com');
  assert.equal(emailAddress('steam@users.playlogg.invalid'),null);
  for(const value of ['short','x'.repeat(129),null])assert.equal(passwordValue(value),null);
  assert.equal(passwordValue(' a long password '),' a long password ');
});
test('picture input rejects SVG, fake extensions and traversal; only owned WebP paths generate URLs',()=>{
  assert.equal(avatarFormat(new TextEncoder().encode('<svg>')),null);
  assert.equal(avatarFormat(Uint8Array.from([255,216,255])), 'jpeg');
  assert.equal(avatarFormat(Uint8Array.from([137,80,78,71,13,10,26,10])), 'png');
  assert.equal(avatarPath('../elsewhere.webp'),false);
  assert.equal(avatarSource(2,'https://example.com/avatar.jpg'),null);
  assert.equal(avatarSource(2,'2/22222222-2222-4222-8222-222222222222.webp'),'/avatars/2?v=22222222-2222-4222-8222-222222222222.webp');
});
test('catalog bootstrap reuses IDs without replacing reviewed metadata and resumes without writes',async()=>{
  const rows=[{igdb_id:1,title:'Reviewed name'}];let mutations=0;
  const admin={from(table){assert.equal(table,'games');return {
    select(_fields,options){if(options?.head)return Promise.resolve({count:rows.length,error:null});return this;},
    in(_key,ids){return Promise.resolve({data:rows.filter(row=>ids.includes(row.igdb_id)),error:null});},
    upsert(batch,options){assert.equal(options.ignoreDuplicates,true);assert.equal(options.onConflict,'igdb_id');rows.push(...batch);mutations++;return Promise.resolve({error:null});}
  };}};
  const query=async body=>{assert.match(body,/total_rating >= 75/);return [1,2,3].map(id=>({id,name:`Game ${id}`,slug:`game-${id}`,cover:{image_id:'cover'},first_release_date:1500000000}));};
  assert.equal(await bootstrapCatalog({admin,query,target:3,progress:()=>{}}),3);
  assert.equal(rows[0].title,'Reviewed name');assert.equal(mutations,1);for (const column of ["is_sample", "created_at", "updated_at"]) assert.ok(!(column in rows[1]));
  assert.equal(await bootstrapCatalog({admin,query:()=>assert.fail('Unnecessary provider call'),target:3,progress:()=>{}}),3);
  assert.equal(mutations,1);assert.throws(()=>bootstrapQuery(-1),/Invalid/);
});
test('private picture URLs return 404 without accessing storage; public reads recheck visibility after download',async()=>{
  const path='2/22222222-2222-4222-8222-222222222222.webp';
  let visible=false,downloads=0,lookups=0,unpublish=false;
  const client={from(){return {select(){return this;},eq(){return this;},maybeSingle(){lookups++;return Promise.resolve({data:visible ? {id:2,avatar_url:path}:null,error:null});}};}};
  const {GET}=load('../src/app/avatars/[id]/route.ts',{
    '@/lib/owner':{getAccount:async()=>null},'@/lib/supabase/public':{createPublicClient:()=>client},'@/lib/avatar-input':{avatarPath},
    '@/lib/supabase/auth-admin':{createAuthAdmin:()=>({storage:{from:()=>({download:async()=>{downloads++;if(unpublish)visible=false;return {data:new Blob(['image']),error:null};}})}})}
  },{Response,Number});
  const read=()=>GET(null,{params:Promise.resolve({id:'2'})});
  assert.equal((await read()).status,404);assert.equal(downloads,0);
  visible=true;const response=await read();assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('content-type'),'image/webp');
  unpublish=true;assert.equal((await read()).status,404);assert.equal(downloads,2);assert.equal(lookups,5);
});
test('password registration, recovery and sign-in use public Auth; ownership comes from the verified session',async()=>{
  const calls=[];let linkError=null;let user={id:'verified-user',email:'player@example.com',email_confirmed_at:'2026-10-01',app_metadata:{}};
  const supabase={auth:{signInWithOtp:async input=>{calls.push(['link',input]);return {error:linkError};},signUp:async input=>{calls.push(['register',input]);return {data:{session:null},error:null};},resetPasswordForEmail:async(...args)=>{calls.push(['recover',args]);return {error:null};},signInWithPassword:async input=>{calls.push(['signin',input]);return {data:{user},error:null};}},from(table){assert.equal(table,'profiles');return {select(){return this;},eq(key,value){if(key==='owner_user_id')assert.equal(value,'verified-user');return this;},maybeSingle:async()=>({data:null,error:null})};}};
  const {emailPassword}=load('../src/app/actions/password.ts',{
    'next/navigation':{redirect:path=>{throw new Error(`REDIRECT ${path}`);}},'next/cache':{revalidatePath:()=>{}},'@/lib/supabase/server':{createClient:async()=>supabase},'@/lib/account-identity':{eligibleAccount},'@/lib/password-input':{emailAddress,passwordValue},'@/lib/steam-openid':{steamSite:()=> 'https://playloggg.vercel.app'}
  },{process:{env:{}},String});
  const form=mode=>{const f=new FormData();f.set('mode',mode);f.set('email','player@example.com');f.set('password','fixture-password-123');f.set('owner_user_id','attacker');return f;};
  assert.match((await emailPassword({},form('register'))).message,/verify your email/);
  assert.equal(calls[0][1].options.emailRedirectTo,'https://playloggg.vercel.app/auth/confirm');
  assert.match((await emailPassword({},form('recover'))).message,/If this account exists/);
  assert.equal(calls[1][1][1].redirectTo,'https://playloggg.vercel.app/auth/confirm?flow=recovery');
  await assert.rejects(emailPassword({},form('signin')),/REDIRECT \/signup/);
  user={...user,email_confirmed_at:null};assert.match((await emailPassword({},form('signin'))).message,/Sign-in failed/);
  const link=form('link');link.delete('password');link.set('email','new-player@example.com');link.set('redirectTo','https://attacker.invalid');
  assert.match((await emailPassword({},link)).message,/Check your inbox for a sign-in link/);
  const sent=calls.at(-1);assert.equal(sent[0],'link');assert.equal(sent[1].email,'new-player@example.com');
  assert.equal(sent[1].options.shouldCreateUser,true);assert.equal(sent[1].options.emailRedirectTo,'https://playloggg.vercel.app/auth/confirm');
  assert.deepEqual(Object.keys(sent[1]).sort(),['email','options']);
  linkError={message:'sensitive provider error'};assert.match((await emailPassword({},link)).message,/couldn't send an email/);
  const count=calls.length;link.set('email','bad email');assert.match((await emailPassword({},link)).message,/valid email/);assert.equal(calls.length,count);

});
