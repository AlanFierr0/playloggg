import type { Tier } from "../types/domain.ts";

export interface RatingInput { slug: string; score: number; tier: Tier | null; review: string }

export function validateRating(input: unknown): RatingInput | null {
  if (!input || typeof input !== "object") return null;
  const { slug, score, tier, review } = input as Record<string, unknown>;
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 200) return null;
  if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 100) return null;
  if (tier !== null && !["S", "A", "B", "C", "D", "F"].includes(tier as string)) return null;
  if (typeof review !== "string" || review.length > 20000) return null;
  return { slug, score, tier: tier as Tier | null, review: review.trim() };
}
