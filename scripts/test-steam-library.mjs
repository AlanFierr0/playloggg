import { test } from "node:test";
import assert from "node:assert/strict";
import {parseSteamLibrary,matchSteamGames,steamMatchBody,steamIdentity} from "../src/lib/steam-library-input.ts";

test("Steam library preserves zero and converts minutes to decimal hours without accepting bad data",()=>{
  assert.deepEqual(parseSteamLibrary({response:{game_count:2,games:[{appid:10,name:"B",playtime_forever:90},{appid:20,name:"A",playtime_forever:0}]}}),[{appId:20,title:"A",hours:0},{appId:10,title:"B",hours:1.5}]);
  assert.deepEqual(parseSteamLibrary({response:{game_count:0}}),[]);
  assert.throws(()=>parseSteamLibrary({response:{}}),/Game details to Public/);
  for(const minutes of [-1,NaN,Infinity,"90",null,undefined]) assert.throws(()=>parseSteamLibrary({response:{game_count:1,games:[{appid:10,name:"A",playtime_forever:minutes}]}}));
});
test("Steam matching rejects ambiguity, other stores and malformed external identifiers",()=>{
  const record=(id,uid,source=1)=>({id,external_games:[{uid,external_game_source:source}]});
  const matches=matchSteamGames([record(100,"10"),record(200,"20"),record(201,"20"),record(300,"30",2),record(400,"040"),record(500,"50"),record(100,"10")],[10,20,30,40]);
  assert.deepEqual([...matches],[[10,100]]);
  assert.throws(()=>steamMatchBody(["10; drop table games"]));
  assert.throws(()=>steamMatchBody([]));
  assert.throws(()=>steamMatchBody(Array(26).fill(10)));
  assert.match(steamMatchBody([10,20]),/uid = \("10","20"\)/);
  assert.equal(steamIdentity("76561198000000000"),true);
  assert.equal(steamIdentity("https://steamcommunity.com/id/user"),false);
});
