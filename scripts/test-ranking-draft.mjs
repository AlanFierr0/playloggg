import test from "node:test";
import assert from "node:assert/strict";
import {readRankingDraft} from "../src/lib/ranking-draft.ts";
test("ranking checkpoints retain valid manual positions and reject corrupt drafts",()=>{
  const value={version:1,revision:null,manual:{hades:0,"elden-ring":2}};
  assert.deepEqual(readRankingDraft(JSON.stringify(value)),value);
  for(const input of [null,"bad",JSON.stringify({...value,revision:-1}),JSON.stringify({...value,manual:[]}),JSON.stringify({...value,manual:{hades:-1}}),JSON.stringify({...value,manual:{hades:1.5}}),JSON.stringify({...value,manual:{"../x":0}})])assert.equal(readRankingDraft(input),null);
});
