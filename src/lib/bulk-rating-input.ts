import type { PlaybackStatus, PlayedPlatform } from "../types/domain.ts";

export function validateBulkRating(input: unknown) {
  if (!input || typeof input !== "object") return null;
  const { slugs, status, platform } = input as Record<string, unknown>;
  if (!Array.isArray(slugs) || !slugs.length || slugs.length > 100 || slugs.some(slug => typeof slug !== "string" || slug.length > 200 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))) return null;
  if (status !== undefined && status !== null && !["completed", "playing", "backlog", "shelved"].includes(status as string)) return null;
  if (platform !== undefined && platform !== null && !["pc", "ps5", "xbox_series_x", "steam_deck"].includes(platform as string)) return null;
  if (status === undefined && platform === undefined) return null;
  return { slugs: [...new Set(slugs as string[])], status: status as PlaybackStatus | null | undefined, platform: platform as PlayedPlatform | null | undefined };
}
