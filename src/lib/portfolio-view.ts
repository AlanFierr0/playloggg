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

export function loggedGames(games: Game[]): Game[] {
  return games.filter((game) => game.logged ?? (game.score !== null || game.status != null || game.tier != null || Boolean(game.review) || game.platform != null || game.hoursPlayed != null || game.completedOn != null))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
}

export function filterRankings(games: Game[], filter: RankingFilter): Game[] {
  if (filter === "backlog") return loggedGames(games).filter((game) => game.status === "backlog");
  const rated = ratedGames(games);
  if (filter === "masterpieces") return rated.filter((game) => game.score >= 90);
  if (filter === "recommended") return rated.filter((game) => game.score >= 75);
  return rated;
}

export function groupTiers(games: Game[]) {
  const logged = loggedGames(games);
  return [...tiers, null].map((tier) => ({ tier, games: logged.filter((game) => (game.tier ?? null) === tier) }));
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
