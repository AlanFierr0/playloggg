import { test } from "node:test";
import assert from "node:assert/strict";
import { readSteamImportWork } from "../src/lib/steam-import-work.ts";
const row={appId:1145360,title:"Hades",hours:3,matched:true,logged:false,cover:null,genres:["Action"]};
const work={version:1,rows:[row],pending:[row.appId],rateIds:[row.appId],total:1,imported:0,skipped:0};
test("unfinished import checkpoints validate IDs, ownership-independent metadata and progress",()=>{
  assert.deepEqual(readSteamImportWork(JSON.stringify(work)),work);
  for(const invalid of [null,{...work,version:2},{...work,pending:[99]},{...work,pending:[row.appId,row.appId]},{...work,rateIds:[99]},{...work,total:2},{...work,imported:1},{...work,rows:[{...row,hours:-1}]},{...work,rows:[{...row,genres:[99]}]}])assert.equal(readSteamImportWork(JSON.stringify(invalid)),null);
  assert.equal(readSteamImportWork("broken"),null);
});
