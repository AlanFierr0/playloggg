export type Tier = "S" | "A" | "B" | "C" | "D" | "F";
export type PlayedPlatform = "pc" | "pc_battlenet" | "pc_gog" | "pc_epic" | "pc_ea" | "pc_ubisoft" | "pc_xbox" | "pc_other" | "ps1" | "ps2" | "ps3" | "ps4" | "ps5" | "psp" | "ps_vita" | "xbox" | "xbox_360" | "xbox_one" | "xbox_series_x" | "xbox_series_s" | "steam_deck";
export type PlaybackStatus = "completed" | "playing" | "backlog" | "shelved" | "active" | "paused" | "stopped";

// Screen shape: shared game metadata plus the selected profile's sample rating.
export interface Game {
  slug: string;
  title: string;
  cover: string;
  year: number | null;
  score: number | null;
  platformScore?: number | null;
  platformRatingCount?: number;
  review?: string | null;
  status?: PlaybackStatus | null;
  logged?: boolean;
  platform?: PlayedPlatform | null;
  hoursPlayed?: number | null;
  completedOn?: string | null;
  tags?: string[];
  updatedAt?: string;
  keywords: string;
  releasedOn?: string | null;
  genres?: string[];
  tier?: Tier | null;
  artwork?: string | null;
  screenshots?: string[];
  isSampleCatalog?: boolean;
  summary?: string | null;
  developers?: string[];
  publishers?: string[];
  platforms?: string[];
  kind?: string | null;
  sourceUrl?: string | null;
}

export interface Profile {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  platformPreference?: string | null;
  isSample?: boolean;
  isPublic?: boolean;
  isDiscoverable?: boolean;
}

export interface ReviewHelpfulnessData {
  signedIn: boolean;
  canVote: boolean;
  reviews: Record<string, { upvotes: number; downvotes: number; vote: number }>;
}

export interface Portfolio {
  reviewHelpfulness?: ReviewHelpfulnessData;
  games: Game[];
  profile: Profile;
  publicBase?: string;
  lists?: CuratedListSummary[];
  favorites?: Favorite[];
  ranking?: {slugs:string[];revision:number};
  access?: { signedIn: boolean; canEdit: boolean; canImportCatalog?: boolean };
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
  tags: string[];
}

export interface CuratedListSummary { id: number; name: string; revision: number; description?: string; is_public?: boolean; is_ranked?: boolean }
export interface CuratedList extends CuratedListSummary { slugs: string[] }

export interface Favorite { slug: string; featuredSlot: number | null; createdAt: string }
