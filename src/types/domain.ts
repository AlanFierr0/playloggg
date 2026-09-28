export type Tier = "S" | "A" | "B" | "C" | "D" | "F";
export type PlaybackStatus = "completed" | "playing" | "backlog" | "shelved";

// Frontend prototype shapes. These do not establish the future database schema.
export interface Game {
  slug: string;
  title: string;
  cover: string;
  year: number | null;
  score: number;
  keywords: string;
}

export interface Profile {
  id: string;
  displayName: string;
  handle: string;
}

export interface Rating {
  profileId: Profile["id"];
  gameSlug: Game["slug"];
  score: number;
  tier: Tier;
  review: string;
}
