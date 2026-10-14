import { test } from "node:test";
import assert from "node:assert/strict";
import { completionChart, completionTimeline } from "../src/lib/completion-timeline.ts";
const game = (slug, date, extra = {}) => ({slug, title:slug, logged:true, status:"completed", completedOn:date, score:null, hoursPlayed:null, genres:[], ...extra});
test("completion timeline groups real dates newest first and preserves zero and unknown values", () => {
 const input=[game("older","2024-02-29",{score:0,hoursPlayed:0,genres:["Puzzle","Puzzle"]}),game("newer","2025-03-02",{score:90,hoursPlayed:12.5,genres:["Adventure"]}),game("same-month","2025-03-01",{score:70,hoursPlayed:null,genres:["Adventure","Puzzle"]}),game("no-date",null),game("bad-date","2025-02-29"),game("ongoing","2025-03-03",{status:"active"}),game("not-logged","2025-03-03",{logged:false})];
 const before=JSON.stringify(input),result=completionTimeline(input);
 assert.deepEqual(result.months.map(group=>group.month),["2025-03","2024-02"]);
 assert.deepEqual(result.months[0].games.map(game=>game.slug),["newer","same-month"]);
 assert.equal(result.months[0].average,80);assert.equal(result.months[0].hours,12.5);
 assert.deepEqual(result.months[0].genres,["Adventure","Puzzle"]);
 assert.equal(result.months[1].average,0);assert.equal(result.months[1].hours,0);
 assert.deepEqual(result.undated.map(game=>game.slug),["bad-date","no-date"]);
 assert.equal(JSON.stringify(input),before);
});
test("unknown scores and playtime stay unknown and update timestamps never become completion dates",()=>{
 const result=completionTimeline([game("unrated","2024-01-05"),game("imported",null,{updatedAt:"2025-06-01T00:00:00Z"})]);
 assert.equal(result.months[0].average,null);assert.equal(result.months[0].hours,null);
 assert.equal(result.undated[0].slug,"imported");
 assert.deepEqual(completionTimeline([]),{months:[],undated:[]});
});


test("completion orbit aggregates each month across years and retains empty months",()=>{
 const months=completionTimeline([game("a","2025-03-02"),game("b","2025-03-01"),game("c","2024-02-29"),game("d","2024-03-02"),game("undated",null)]).months;
 const chart=completionChart(months);assert.equal(chart.length,12);
 assert.equal(chart[0].period,"01");assert.equal(chart[0].count,0);
 assert.equal(chart[1].count,1);assert.equal(chart[2].period,"03");assert.equal(chart[2].count,3);
 assert.equal(chart[11].period,"12");assert.equal(chart.reduce((sum,point)=>sum+point.count,0),4);
 assert.equal(completionChart(months.filter(group=>group.month.startsWith("2025")))[2].count,2);
 assert.equal(completionChart([]).reduce((sum,point)=>sum+point.count,0),0);
});
