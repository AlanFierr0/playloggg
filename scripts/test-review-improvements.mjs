import {test} from "node:test";
import assert from "node:assert/strict";
import {recentRead} from "../src/lib/recent-read.ts";

test("recent server reads expire, isolate identities, refresh and retry rejected reads",async()=>{
 let at=0,calls=0;
 const read=recentRead(async key=>{calls++;if(key==="fail")throw new Error("retry");return calls;},30,2,()=>at);
 const [first,same]=await Promise.all([read("owner-a:steam-a"),read("owner-a:steam-a")]);
 assert.equal(first,same);assert.equal(calls,1);
 assert.notEqual(await read("owner-b:steam-b"),first);
 at=31;assert.notEqual(await read("owner-a:steam-a"),first);
 const refreshed=await read("owner-a:steam-a",true);assert.equal(calls,4);
 assert.equal(await read("owner-a:steam-a"),refreshed);
 await assert.rejects(read("fail"));await assert.rejects(read("fail"));assert.equal(calls,6);
 await read("other");await read("third");await read("owner-a:steam-a");assert.equal(calls,9);
});
test("invalidating a server snapshot forces a fresh read only for that owner",async()=>{
 let calls=0;
 const read=recentRead(async()=>++calls,30_000,50);
 const first=await read("a");const other=await read("b");
 read.invalidate("a");
 assert.notEqual(await read("a"),first);
 assert.equal(await read("b"),other);
 assert.equal(calls,3);
});
