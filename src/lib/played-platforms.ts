import type { PlayedPlatform } from "../types/domain.ts";

// Keep the legacy pc value for Steam imports and existing PC / Steam entries.
export const playedPlatformLabels: Record<PlayedPlatform, string> = {
  pc: "PC / Steam",
  pc_battlenet: "PC / Battle.net",
  pc_gog: "PC / GOG",
  pc_epic: "PC / Epic Games",
  pc_ea: "PC / EA app",
  pc_ubisoft: "PC / Ubisoft Connect",
  pc_xbox: "PC / Xbox app",
  pc_other: "PC / Other",
  ps5: "PlayStation 5",
  xbox_series_x: "Xbox Series X",
  steam_deck: "Steam Deck",
};

export function isPlayedPlatform(value: unknown): value is PlayedPlatform {
  return typeof value === "string" && Object.hasOwn(playedPlatformLabels, value);
}
