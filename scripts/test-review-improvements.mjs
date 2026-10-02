import {test} from "node:test";
import assert from "node:assert/strict";
import {recentRead} from "../src/lib/recent-read.ts";
import {validateBulkRating} from "../src/lib/bulk-rating-input.ts";

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
test("bulk updates accept only bounded game selections and status/platform fields",()=>{
 assert.deepEqual(validateBulkRating({slugs:["hades","hades"],status:null,score:100}),{slugs:["hades"],status:null,platform:undefined});
 for(const input of [{slugs:[]},{slugs:["hades"]},{slugs:["hades"],status:"injected"},{slugs:["bad;sql"],platform:"pc"},{slugs:Array(101).fill("hades"),status:"playing"},{slugs:["hades"],platform:12}])assert.equal(validateBulkRating(input),null);
 assert.equal(validateBulkRating({slugs:["hades"],platform:"pc"}).platform,"pc");
});
