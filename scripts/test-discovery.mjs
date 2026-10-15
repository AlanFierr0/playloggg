import { test } from "node:test";
import assert from "node:assert/strict";
import { discoverySelection } from "../src/lib/discovery-selection.ts";

test("discovery selection lasts ten minutes, respects token expiry and rotates expired or invalid cookies", () => {
  const now=1_800_000_000_000;
  const first=discoverySelection(undefined, undefined, now);
  assert.equal(first.expiresAt, now+600_000);
  assert.deepEqual(discoverySelection(first.value, undefined, now+60_000), first);
  const capped=discoverySelection(first.value, (now+120_000)/1000, now+60_000);
  assert.equal(capped.seed, first.seed);
  assert.equal(capped.expiresAt, now+120_000);
  assert.notEqual(discoverySelection(capped.value, (now+900_000)/1000, now+120_000).seed, first.seed);
  assert.notEqual(discoverySelection(first.value, undefined, now+600_000).seed, first.seed);
  for(const invalid of ["bad", first.value+"oops", `${first.seed}.${now+900_000}`]) {
    assert.notEqual(discoverySelection(invalid, undefined, now).seed, first.seed);
  }
});
