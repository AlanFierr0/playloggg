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
export const positiveId = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value > 0;
export function validateList(input: unknown) {
  if (!input || typeof input !== "object") return null;
  const { id, revision, name, slugs, description="", isPublic=false, isRanked=true } = input as Record<string, unknown>;
  if (id !== null && !positiveId(id)) return null;
  if (id === null ? revision !== null : !positiveId(revision) || revision > 2147483647) return null;
  if (typeof name !== "string" || !name.trim() || name.trim().length > 80 || /[\u0000-\u001f\u007f]/.test(name)) return null;
  if (!Array.isArray(slugs) || slugs.length > 500 || new Set(slugs).size !== slugs.length) return null;
  if (slugs.some((slug) => typeof slug !== "string" || slug.length > 200 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))) return null;
  if(typeof description!=="string"||description.length>2000||typeof isPublic!=="boolean"||typeof isRanked!=="boolean")return null;
  return { description:description.trim(),isPublic,isRanked,id: id as number | null, revision: revision as number | null, name: name.trim(), slugs: slugs as string[] };
}
