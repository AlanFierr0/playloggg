import {test} from "node:test";
import assert from "node:assert/strict";
import {coverImage} from "../src/lib/cover-image.ts";
test("responsive IGDB covers use CDN variants without rewriting private or external URLs",()=>{
  const result=coverImage("https://images.igdb.com/igdb/image/upload/t_cover_big/co123.jpg","48px");
  assert.equal(result.sizes,"48px");
  assert.match(result.srcSet,/t_cover_small\/co123.webp 90w/);
  assert.match(result.srcSet,/t_cover_big_2x\/co123.webp 528w/);
  for(const src of ["/api/profiles/2/avatar","/images/missing-cover.svg","https://images.igdb.com.evil.test/igdb/image/upload/t_cover_big/co123.jpg","https://shared.steamstatic.com/cover.jpg"])assert.deepEqual(coverImage(src,"48px"),{src});
});
