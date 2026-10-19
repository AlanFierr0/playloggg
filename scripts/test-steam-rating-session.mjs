import {test} from "node:test";
import assert from "node:assert/strict";
import {readSteamRatingSession} from "../src/lib/steam-rating-session.ts";
const session={games:[{appId:10,slug:"game",title:"Game",hours:5,cover:null,updatedAt:null}],index:0,target:1,progress:1,total:1,draft:{score:"90",tier:"A",status:"completed"}};
test("lazy rating editor keeps old resumable sessions and rejects invalid drafts",()=>{
  assert.equal(readSteamRatingSession(JSON.stringify(session)).draft.completedOn,"");
  for(const draft of [{...session.draft,score:"101"},{...session.draft,completedOn:"2026-02-30"},{...session.draft,playStyle:"invalid"}])assert.equal(readSteamRatingSession(JSON.stringify({...session,draft})),null);
});
