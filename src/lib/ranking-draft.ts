export type RankingDraft = { version: 1; revision: number | null; manual: Record<string, number> };
export function readRankingDraft(raw: string | null): RankingDraft | null {
  try {
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (value?.version !== 1 || (value.revision !== null && (!Number.isSafeInteger(value.revision) || value.revision < 1)) ||
      !value.manual || typeof value.manual !== "object" || Array.isArray(value.manual)) return null;
    const entries = Object.entries(value.manual);
    if (entries.length > 10000 || entries.some(([slug, position]) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
      !Number.isSafeInteger(position) || Number(position) < 0 || Number(position) >= 10000)) return null;
    return value as RankingDraft;
  } catch { return null; }
}
