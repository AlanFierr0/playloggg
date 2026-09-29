export type Tier = "S" | "A" | "B" | "C" | "D" | "F";
export type PlayedPlatform = "pc" | "ps5" | "xbox_series_x" | "steam_deck";
export type PlaybackStatus = "completed" | "playing" | "backlog" | "shelved";

// Screen shape: shared game metadata plus the selected profile's sample rating.
export interface Game {
  slug: string;
  title: string;
  cover: string;
  year: number | null;
  score: number | null;
  review?: string | null;
  status?: PlaybackStatus | null;
  logged?: boolean;
  platform?: PlayedPlatform | null;
  hoursPlayed?: number | null;
  completedOn?: string | null;
  keywords: string;
  releasedOn?: string | null;
  genres?: string[];
  tier?: Tier | null;
  artwork?: string | null;
  screenshots?: string[];
}

export interface Profile {
  id: string;
  displayName: string;
  handle: string;
  isSample?: boolean;
  isPublic?: boolean;
}

export interface Portfolio {
  games: Game[];
  profile: Profile;
  access?: { signedIn: boolean; canEdit: boolean };
}

export interface Rating {
  profileId: Profile["id"];
  gameSlug: Game["slug"];
  score: number | null;
  tier: Tier | null;
  status: PlaybackStatus | null;
  review: string;
  platform: PlayedPlatform | null;
  hoursPlayed: number | null;
  completedOn: string | null;
}
