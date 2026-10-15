import {test} from "node:test";
import assert from "node:assert/strict";
import {portfolioExport,portfolioCsv} from "../src/lib/portfolio-export.ts";
test("portable exports preserve zero/null, rankings, ranges and favorites without account credentials",()=>{
 const portfolio={profile:{id:"private-id",handle:"owner",displayName:"Owner",isPublic:false,tierRanges:{S:[95,100]}},games:[{slug:"zero",title:"Zero",logged:true,score:0,hoursPlayed:0,review:'=HYPERLINK("https://example.invalid")\nsecond line',tags:["Co-op"],tierManual:true,reviewUpdatedAt:"2020-01-01T00:00:00Z"},{slug:"unknown",title:"Unknown",logged:true,score:null},{slug:"catalog-only",title:"Unused",logged:false,score:null}],favorites:[{slug:"unknown",featuredSlot:1,createdAt:"2026-10-13"}],ranking:{slugs:["unknown","zero"],manualPositions:{zero:1},revision:4}};
 const data=portfolioExport(portfolio,"2026-10-13T00:00:00Z");
 assert.equal(data.logs.length,2);assert.equal(data.logs[0].score,0);assert.equal(data.logs[0].hoursPlayed,0);assert.equal(data.logs[1].score,null);assert.equal(data.logs[1].hoursPlayed,null);
 assert.equal(data.logs[0].reviewUpdatedAt,"2020-01-01T00:00:00Z");assert.equal(data.logs[1].reviewUpdatedAt,null);
 assert.deepEqual(data.ranking,{slugs:["unknown","zero"],manualPositions:{zero:1}});assert.deepEqual(data.profile.tierRanges,{S:[95,100]});assert.equal(data.favorites[0].featuredSlot,1);
 assert.ok(!JSON.stringify(data).includes("private-id"));
 const csv=portfolioCsv(data);assert.ok(csv.startsWith("\uFEFF"));assert.match(csv,/"range",""/);assert.ok(csv.includes("'="));assert.ok(csv.includes('HYPERLINK(""https://example.invalid"")'));assert.ok(csv.includes("\nsecond line"));
 for(const type of ["profile","log","ranking","favorite","range"])assert.ok(csv.includes(`"${type}"`));
});
