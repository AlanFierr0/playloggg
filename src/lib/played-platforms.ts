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
  ps1: "PlayStation",
  ps2: "PlayStation 2",
  ps3: "PlayStation 3",
  ps4: "PlayStation 4",
  ps5: "PlayStation 5",
  psp: "PSP",
  ps_vita: "PS Vita",
  xbox: "Xbox",
  xbox_360: "Xbox 360",
  xbox_one: "Xbox One",
  xbox_series_x: "Xbox Series X",
  xbox_series_s: "Xbox Series S",
  steam_deck: "Steam Deck",
};

export function isPlayedPlatform(value: unknown): value is PlayedPlatform {
  return typeof value === "string" && Object.hasOwn(playedPlatformLabels, value);
}
