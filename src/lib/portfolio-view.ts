import type { Game, Portfolio, Tier } from "@/types/domain";

export type RatedGame = Game & { score: number };
export type RankingFilter = "all" | "masterpieces" | "recommended" | "backlog";
export const tiers: Tier[] = ["S", "A", "B", "C", "D", "F"];

export function ratedGames(games: Game[]): RatedGame[] {
  return games.filter((game): game is RatedGame => game.score !== null)
    .sort((a, b) => b.score - a.score || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
}

export function averageScore(games: RatedGame[]): string {
  return games.length ? (games.reduce((sum, game) => sum + game.score, 0) / games.length).toFixed(1) : "—";
}

export function filterRankings(games: RatedGame[], filter: RankingFilter): RatedGame[] {
  if (filter === "backlog") return []; // Playback status is not persisted yet.
  if (filter === "masterpieces") return games.filter((game) => game.score >= 90);
  if (filter === "recommended") return games.filter((game) => game.score >= 75);
  return games;
}

export function groupTiers(games: RatedGame[]) {
  return [...tiers, null].map((tier) => ({ tier, games: games.filter((game) => (game.tier ?? null) === tier) }));
}

function matches(query: string, content: string): boolean {
  const text = content.toLocaleLowerCase();
  return query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean).every((word) => text.includes(word));
}

export function getSearchMatches(query: string, portfolio: Portfolio) {
  return {
    titles: portfolio.games.filter((game) => matches(query, `${game.title} ${game.keywords} ${(game.genres ?? []).join(" ")}`)),
    profiles: matches(query, `${portfolio.profile.displayName} ${portfolio.profile.handle}`) ? [portfolio.profile] : [],
    listMatches: false, // Curated lists are not persisted yet.
  };
}
