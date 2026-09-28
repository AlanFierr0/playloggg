import sourceGames from "./games.json";
import type { Game, PlaybackStatus, Profile } from "@/types/domain";

export const games: Game[] = sourceGames;
export const sampleProfiles: Profile[] = [
  { id: "owner-preview", displayName: "Alex Vance", handle: "alexvance" },
  { id: "comparison-preview", displayName: "Hideo Kojima", handle: "kojima-preview" },
];

export function getGame(slug: string): Game | undefined {
  return games.find((game) => game.slug === slug);
}

export type RankingFilter = "all" | "masterpieces" | "recommended" | "backlog";

export function matchesRankingFilter(filter: RankingFilter, score: number, status: PlaybackStatus): boolean {
  if (filter === "masterpieces") return score >= 90;
  if (filter === "recommended") return score >= 75;
  if (filter === "backlog") return status === "backlog";
  return true;
}

export function searchGames(query: string): Game[] {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return games.filter((game) => words.every((word) => `${game.title} ${game.keywords}`.toLocaleLowerCase().includes(word)));
}
