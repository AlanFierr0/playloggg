import test from "node:test";
import assert from "node:assert/strict";
import { classifyPlayStyle, playbackGroups, statusPlayStyle } from "../src/lib/playback-status.ts";
test("live-service signals differ from multiplayer and campaign co-op",()=>{
  assert.equal(classifyPlayStyle({game_modes:[{name:"Massively multiplayer online (MMO)"}]}),"ongoing");
  assert.equal(classifyPlayStyle({keywords:[{name:"live-service"}]}),"ongoing");
  assert.equal(classifyPlayStyle({genres:[{name:"MOBA"}]}),"ongoing");
  assert.equal(classifyPlayStyle({game_modes:[{name:"Single player"},{name:"Multiplayer"},{name:"Co-operative"}]}),"campaign");
  assert.equal(classifyPlayStyle({game_modes:[{name:"Multiplayer"}]}),null);
  for(const value of [null,[],{},"online",{keywords:[null,7,{}]}])assert.equal(classifyPlayStyle(value),null);
  assert.deepEqual(playbackGroups.ongoing,["active","paused","stopped","backlog"]);
  assert.equal(statusPlayStyle("active"),"ongoing");assert.equal(statusPlayStyle("completed"),"campaign");assert.equal(statusPlayStyle("backlog"),null);
});
