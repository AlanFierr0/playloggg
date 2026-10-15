import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { findSteamAccount, linkSteamAccount } from "../src/lib/steam-account-link.ts";

test("Steam linking reserves identity, retains metadata, rejects other owners, and retries interrupted metadata updates", async () => {
 const user={id:"11111111-1111-4111-8111-111111111111",app_metadata:{provider:"email",reference:false}};
 const steamId="76561198000000001";
 let owner, writes=0, failUpdate=false;
 const admin=createClient("https://fixture.test","server-key",{auth:{persistSession:false},global:{fetch:async(input,init)=>{
  const url=new URL(input), body=init.body ? JSON.parse(init.body):null;
  if(url.pathname==="/rest/v1/steam_accounts"){
   if(init.method==="POST")owner ??= body.user_id;
   return new Response(JSON.stringify(init.method==="GET"?(owner?[{user_id:owner}]:[]):[]),{status:200,headers:{"Content-Type":"application/json"}});
  }
  assert.equal(url.pathname,`/auth/v1/admin/users/${user.id}`);
  assert.equal(init.method,"PUT");writes++;
  assert.deepEqual(body.app_metadata,{...user.app_metadata,playlogg_steam_id:steamId});
  return new Response(JSON.stringify(failUpdate?{message:"Temporary failure"}:{user:{...user,app_metadata:body.app_metadata}}),{status:failUpdate?503:200,headers:{"Content-Type":"application/json"}});
 }}});
 assert.equal(await findSteamAccount(admin,steamId),undefined);
 await linkSteamAccount(admin,steamId,user);
 assert.equal(owner,user.id);assert.equal(writes,1);
 await linkSteamAccount(admin,steamId,user);assert.equal(writes,2);
 owner="22222222-2222-4222-8222-222222222222";
 await assert.rejects(linkSteamAccount(admin,steamId,user),/steam-linked/);assert.equal(writes,2);
 await assert.rejects(linkSteamAccount(admin,steamId,{...user,app_metadata:{playlogg_steam_id:"76561198000000002"}}),/steam-linked/);
 owner=user.id;failUpdate=true;
 await assert.rejects(linkSteamAccount(admin,steamId,user),/update failed/);
 failUpdate=false;await linkSteamAccount(admin,steamId,user);assert.equal(owner,user.id);
});
