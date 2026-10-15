import {test} from "node:test";
import assert from "node:assert/strict";
import {completionAchievement,parseSteamCompletions} from "../src/lib/steam-completion-input.ts";
const now=Date.parse("2026-10-14T12:00:00Z");
const achievement=(id,description,time=Date.parse("2025-06-01T23:59:00Z")/1000)=>({apiname:id,name:id,description,achieved:1,unlocktime:time});
const payload=rows=>({playerstats:{success:true,steamID:"76561198000000000",gameName:"Fixture game",achievements:rows}});
test("completion matching accepts story, campaign, endings and final bosses but rejects partial and multiplayer achievements",()=>{
  for(const description of ["Complete the game","Finished the main story","Beat the campaign","Complete the main quest","Reach the good ending","Unlock the secret ending","Defeat the final boss"])assert.equal(completionAchievement("Achievement",description),true,description);
  for(const description of ["Complete chapter 4","Complete a multiplayer match","Finish the tutorial","Complete the DLC campaign","Complete the first level of the game","Finish a round","Get all collectibles","Win 5 games","Do not complete the story","Complete the campaign chapter","Reach the ending of a DLC expansion"])assert.equal(completionAchievement("Achievement",description),false,description);
});
test("candidates preserve multiple endings, sort by unlock time and use UTC dates",()=>{
  const rows=[achievement("B","Reach the bad ending",Date.parse("2025-06-02T00:01:00Z")/1000),achievement("A","Reach the good ending")];
  const result=parseSteamCompletions(payload(rows),101,"2020-01-01",now);
  assert.deepEqual(result.map(row=>[row.id,row.date]),[["A","2025-06-01"],["B","2025-06-02"]]);
});
test("invalid, locked, zero, pre-release and future timestamps cannot become suggestions",()=>{
  const valid=achievement("valid","Finish the story");
  const rows=[valid,{...valid,apiname:"locked",achieved:0},{...valid,apiname:"old",unlocktime:0},{...valid,apiname:"future",unlocktime:now/1000+1},{...valid,apiname:"before",unlocktime:1},{...valid,apiname:"wrong",unlocktime:"100"},{...valid,apiname:"bad",description:null}];
  assert.deepEqual(parseSteamCompletions(payload(rows),101,"2020-01-01",now).map(row=>row.id),["valid"]);
  for(const value of [null,{playerstats:{success:false}},{playerstats:{success:true,gameID:"102",achievements:[]}}])assert.throws(()=>parseSteamCompletions(value,101,null,now));
});

test("real Steam response without gameID is accepted and the returned Steam identity is verified",()=>{
  const response=payload([achievement("STORY","Complete the game")]);
  assert.equal(parseSteamCompletions(response,101,null,now,"76561198000000000").length,1);
  assert.throws(()=>parseSteamCompletions(response,101,null,now,"76561198000000001"));
});

test("a completion achievement named explicitly can retain an empty Steam description",()=>{
 const row={...achievement("NAME_ONLY",""),name:"Complete the game"};assert.equal(parseSteamCompletions(payload([row]),101,null,now).length,1);
});
