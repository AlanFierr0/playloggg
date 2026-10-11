export function normalizeTags(input: unknown): string[] | null {
  if (!Array.isArray(input) || input.length > 20) return null;
  const tags: string[] = [];
  for (const value of input) {
    if (typeof value !== "string") return null;
    const tag = value.trim();
    if (!tag || tag.length > 48 || /[\u0000-\u001f\u007f]/.test(tag)) return null;
    if (!tags.some((saved) => saved.toLowerCase() === tag.toLowerCase())) tags.push(tag);
  }
  return tags;
}
