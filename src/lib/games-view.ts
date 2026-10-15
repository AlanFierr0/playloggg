import type { Game, PlaybackStatus } from "../types/domain.ts";
import { matchesCatalogPlatform } from "./catalog-platforms.ts";
import { loggedGames } from "./portfolio-view.ts";

export interface GamesFilters {
  query: string;
  genre: string;
  tag: string;
  platform: string;
  year: string;
  library: "all" | "logged" | "unlogged";
  status: "all" | PlaybackStatus | "unset";
  tier: "all" | "S" | "A" | "B" | "C" | "D" | "F" | "unset";
  rating: "all" | "rated" | "unrated";
  minScore: string;
  maxScore: string;
  sort: "title" | "newest" | "oldest" | "score-desc" | "score-asc" | "platform-desc" | "platform-asc";
}

export const defaultGamesFilters: GamesFilters = { query: "", genre: "", tag: "", platform: "", year: "", library: "all", status: "all", tier: "all", rating: "all", minScore: "", maxScore: "", sort: "title" };

function scoreBound(value: string): number | null | undefined {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 && number <= 100 ? number : undefined;
}

export function validScoreRange(filters: GamesFilters): boolean {
  const min = scoreBound(filters.minScore), max = scoreBound(filters.maxScore);
  return min !== undefined && max !== undefined && (min === null || max === null || min <= max);
}

export function filterGames(games: Game[], filters: GamesFilters): Game[] {
  if (!validScoreRange(filters)) return [];
  const min = scoreBound(filters.minScore), max = scoreBound(filters.maxScore);
  const logged = new Set(loggedGames(games).map((game) => game.slug));
  const words = filters.query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const result = games.filter((game) => {
    const isLogged = logged.has(game.slug);
    const text = `${game.title} ${game.keywords} ${(game.genres ?? []).join(" ")}`.toLocaleLowerCase();
    return words.every((word) => text.includes(word))
      && (!filters.genre || game.genres?.includes(filters.genre))
      && (!filters.tag || (isLogged && game.tags?.some(tag => tag.toLowerCase() === filters.tag.toLowerCase())))
      && matchesCatalogPlatform(game.platforms, filters.platform)
      && (!filters.year || (filters.year === "unknown" ? game.year === null : game.year === Number(filters.year)))
      && (filters.library === "all" || (filters.library === "logged" ? isLogged : !isLogged))
      && (filters.status === "all" || (filters.status === "unset" ? isLogged && !game.status : isLogged && game.status === filters.status))
      && (filters.tier === "all" || (filters.tier === "unset" ? !game.tier : game.tier === filters.tier))
      && (filters.rating === "all" || (filters.rating === "rated" ? game.score !== null : game.score === null))
      && (min == null || (game.score !== null && game.score >= min))
      && (max == null || (game.score !== null && game.score <= max));
  });
  const compareTitle = (a: Game, b: Game) => a.title.localeCompare(b.title) || a.slug.localeCompare(b.slug);
  return result.sort((a, b) => {
    if (filters.sort === "platform-desc" || filters.sort === "platform-asc") {
      const scoreA = a.platformScore ?? null, scoreB = b.platformScore ?? null;
      if (scoreA === null || scoreB === null) return scoreA === scoreB ? compareTitle(a, b) : scoreA === null ? 1 : -1;
      return (filters.sort === "platform-desc" ? scoreB - scoreA : scoreA - scoreB) || compareTitle(a, b);
    }
    if (filters.sort === "score-desc" || filters.sort === "score-asc") {
      if (a.score === null || b.score === null) return a.score === b.score ? compareTitle(a, b) : a.score === null ? 1 : -1;
      return (filters.sort === "score-desc" ? b.score - a.score : a.score - b.score) || compareTitle(a, b);
    }
    if (filters.sort === "newest" || filters.sort === "oldest") {
      const dateA = a.releasedOn ?? (a.year === null ? null : `${a.year}-01-01`);
      const dateB = b.releasedOn ?? (b.year === null ? null : `${b.year}-01-01`);
      if (!dateA || !dateB) return dateA === dateB ? compareTitle(a, b) : !dateA ? 1 : -1;
      return (filters.sort === "newest" ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB)) || compareTitle(a, b);
    }
    return compareTitle(a, b);
  });
}
