import { isPlaybackStatus } from "./playback-status.ts";
import { normalizeTags } from "./collection-input.ts";
import { isPlayedPlatform } from "./played-platforms.ts";
import type { PlaybackStatus, PlayedPlatform, Tier } from "../types/domain.ts";

export interface RatingInput {
  slug: string; score: number | null; tier: Tier | null; status: PlaybackStatus | null;
  tierManual?: boolean;
  playStyle?: "campaign" | "ongoing" | null;
  expectedUpdatedAt?: string | null;
  review: string; platform: PlayedPlatform | null; hoursPlayed: number | null; completedOn: string | null; tags: string[];
}

// Empty is unknown; zero is a supplied value. Invalid drafts must not become null.
export function parseHours(value: string): number | null | undefined {
  const text = value.trim();
  if (!text) return null;
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return undefined;
  const hours = Number(text);
  return Number.isFinite(hours) ? hours : undefined;
}

export function maximumPlaytime(releasedOn: string | null | undefined, now = Date.now()): number | null {
  if (!releasedOn) return null;
  const release = Date.parse(`${releasedOn}T00:00:00Z`);
  return Number.isFinite(release) ? Math.max(0, (now - release) / 3_600_000) : null;
}

export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateRating(input: unknown, allowFutureCompletion = false): RatingInput | null {
  if (!input || typeof input !== "object") return null;
  const { expectedUpdatedAt, tierManual, playStyle } = input as Record<string,unknown>;
  if (expectedUpdatedAt !== undefined && expectedUpdatedAt !== null && (typeof expectedUpdatedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(expectedUpdatedAt) || !Number.isFinite(Date.parse(expectedUpdatedAt)))) return null;
  if (playStyle !== undefined && playStyle !== null && playStyle !== "campaign" && playStyle !== "ongoing") return null;
  if (tierManual !== undefined && typeof tierManual !== "boolean") return null;
  const { slug, score, tier, status, review, platform, hoursPlayed, completedOn, tags: rawTags } = input as Record<string, unknown>;
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 200) return null;
  if (score !== null && (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 100)) return null;
  if (tier !== null && !["S", "A", "B", "C", "D", "F"].includes(tier as string)) return null;
  if (status !== null && !isPlaybackStatus(status)) return null;
  if (platform !== null && !isPlayedPlatform(platform)) return null;
  if (hoursPlayed !== null && (typeof hoursPlayed !== "number" || !Number.isFinite(hoursPlayed) || hoursPlayed < 0)) return null;
  if (completedOn !== null && (!isCalendarDate(completedOn) || (!allowFutureCompletion && completedOn > new Date().toISOString().slice(0, 10)))) return null;
  const tags = normalizeTags(rawTags);
  if (!tags) return null;
  if (typeof review !== "string" || review.length > 20000) return null;
  return { ...(playStyle === undefined ? {} : {playStyle: playStyle as "campaign" | "ongoing" | null}), ...(expectedUpdatedAt === undefined ? {} : {expectedUpdatedAt: expectedUpdatedAt as string | null}), ...(tierManual === undefined ? {} : {tierManual: tierManual as boolean}), slug, score, tier: tier as Tier | null, status: status as PlaybackStatus | null,
    review: review.trim(), platform: platform as PlayedPlatform | null,
    hoursPlayed: hoursPlayed as number | null, completedOn: completedOn as string | null, tags };
}
