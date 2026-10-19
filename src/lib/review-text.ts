export function reviewParts(text: string): string[] {
  return text.split(/(https?:\/\/[^\s<>]+)/g).flatMap(part => {
    if (!/^https?:\/\//.test(part)) return [part];
    const excess: Record<string, number> = {};
    for (const [open, close] of [["(", ")"], ["[", "]"], ["{", "}"]]) {
      excess[close] = part.split(close).length - part.split(open).length;
    }
    let end = part.length;
    while (end) {
      const last = part[end - 1];
      if (/[.,!?;:'"“”‘’]/u.test(last)) end--;
      else if ((excess[last] ?? 0) > 0) { excess[last]--; end--; }
      else break;
    }
    return [part.slice(0, end), part.slice(end)];
  });
}

export function hasReviewProse(text: string) {
  return reviewParts(text).some(part => !/^https?:\/\//.test(part) && /[\p{L}\p{N}]/u.test(part));
}
