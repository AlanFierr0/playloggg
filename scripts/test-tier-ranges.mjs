import {test} from "node:test";
import assert from "node:assert/strict";
import {defaultTierRanges,parseTierRanges,tierForScore} from "../src/lib/tier-ranges.ts";
test("tier ranges cover score boundaries, gaps and reject ambiguous ranges",()=>{
 assert.deepEqual(parseTierRanges(defaultTierRanges),defaultTierRanges);
 for(const [score,tier] of [[0,"F"],[49,"F"],[50,"D"],[69,"D"],[70,"C"],[79,"C"],[80,"B"],[89,"B"],[90,"A"],[94,"A"],[95,"S"],[100,"S"],[null,null]])assert.equal(tierForScore(score),tier);
 const gaps={...defaultTierRanges,B:[81,89]};assert.ok(parseTierRanges(gaps));assert.equal(tierForScore(80,gaps),null);
 for(const ranges of [null,{}, {...defaultTierRanges,S:[90,100]}, {...defaultTierRanges,S:[95,101]}, {...defaultTierRanges,F:[-1,49]}, {...defaultTierRanges,C:[79,70]}, {...defaultTierRanges,C:[70.5,79]}])assert.equal(parseTierRanges(ranges),null);
});
