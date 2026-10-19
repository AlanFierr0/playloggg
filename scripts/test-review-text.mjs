import { test } from "node:test";
import assert from "node:assert/strict";
import { reviewParts, hasReviewProse } from "../src/lib/review-text.ts";

const links = text => reviewParts(text).filter(part => /^https?:\/\//.test(part));
test("review links keep query strings and balanced parentheses while excluding surrounding punctuation", () => {
  for (const [text, expected] of [
    ['Watch (https://www.youtube.com/watch?v=example&t=637s).', ['https://www.youtube.com/watch?v=example&t=637s']],
    ['See https://example.test/Game_(edition).', ['https://example.test/Game_(edition)']],
    ['[https://example.test/a] and “https://example.test/b”.', ['https://example.test/a', 'https://example.test/b']],
    ['See (https://example.test/Game_(edition)).', ['https://example.test/Game_(edition)']],
    ['https://example.test/?q=a%21&ending=%29!', ['https://example.test/?q=a%21&ending=%29']],
    ['No links here.', []],
  ]) {
    assert.deepEqual(links(text), expected);
    assert.equal(reviewParts(text).join(""), text);
  }
  assert.equal(hasReviewProse('(https://youtu.be/example).'), false);
  assert.equal(hasReviewProse('¡Excelente! https://youtu.be/example.'), true);
});
