import { test } from "node:test";
import assert from "node:assert/strict";
import {parseSteamLibrary,matchSteamGames,steamMatchBody,steamIdentity,parseSteamBrowse,browseSteamLibrary} from "../src/lib/steam-library-input.ts";

test("Steam library preserves zero and converts minutes to decimal hours without accepting bad data",()=>{
  assert.deepEqual(parseSteamLibrary({response:{game_count:2,games:[{appid:10,name:"B",playtime_forever:90},{appid:20,name:"A",playtime_forever:0}]}}),[{appId:20,title:"A",hours:0},{appId:10,title:"B",hours:1.5}]);
  assert.deepEqual(parseSteamLibrary({response:{game_count:0}}),[]);
  assert.throws(()=>parseSteamLibrary({response:{}}),/Game details to Public/);
  for(const minutes of [-1,NaN,Infinity,"90",null,undefined]) assert.throws(()=>parseSteamLibrary({response:{game_count:1,games:[{appid:10,name:"A",playtime_forever:minutes}]}}));
});
test("Steam playtime filters and sorting apply to the full library, preserve zero and reject invalid bounds",()=>{
  const games=[{appId:1,title:"B",hours:0},{appId:2,title:"A",hours:2.5},{appId:3,title:"Z",hours:80},{appId:4,title:"C",hours:0}];
  const query={offset:0,sort:"hours_desc",minHours:null,maxHours:null};
  assert.deepEqual(browseSteamLibrary(games,query).map(game=>game.appId),[3,2,1,4]);
  assert.deepEqual(browseSteamLibrary(games,{...query,sort:"hours_asc",maxHours:0}).map(game=>game.appId),[1,4]);
  assert.deepEqual(browseSteamLibrary(games,{...query,minHours:2,maxHours:3}).map(game=>game.appId),[2]);
  assert.equal(games[0].appId,1);
  assert.deepEqual(parseSteamBrowse(query),query);
  for(const change of [{minHours:-1},{maxHours:Infinity},{minHours:3,maxHours:2},{offset:-1},{offset:1.5},{sort:"injected"},{minHours:"0"}]) assert.equal(parseSteamBrowse({...query,...change}),null);
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
