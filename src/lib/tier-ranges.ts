import type { Tier } from "../types/domain.ts";
export const defaultTierRanges: Record<Tier, [number, number]> = {S:[95,100],A:[90,94],B:[80,89],C:[70,79],D:[50,69],F:[0,49]};
export function parseTierRanges(value: unknown): typeof defaultTierRanges | null {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).length !== 6) return null;
  const ranges = value as typeof defaultTierRanges;
  const occupied = new Set<number>();
  for (const tier of Object.keys(defaultTierRanges) as Tier[]) {
    const range = ranges[tier];
    if (!Array.isArray(range) || range.length !== 2 || !range.every(Number.isInteger) || range[0]<0 || range[1]>100 || range[0]>range[1]) return null;
    for (let score=range[0];score<=range[1];score++) { if (occupied.has(score)) return null; occupied.add(score); }
  }
  return ranges;
}

export function tierForScore(score: number | null, ranges = defaultTierRanges): Tier | null {
  if (score === null) return null;
  return (Object.keys(ranges) as Tier[]).find(tier => score >= ranges[tier][0] && score <= ranges[tier][1]) ?? null;
}
