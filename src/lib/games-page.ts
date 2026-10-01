import { filterGames, type GamesFilters } from "./games-view.ts";
import type { GamesPageSize } from "./games-query.ts";
import type { Game } from "../types/domain.ts";
export function gamesPage(games: Game[], filters: GamesFilters, requestedPage: number, pageSize: GamesPageSize = 25) {
  const filtered = filterGames(games, filters);
  const pageCount = Math.max(1, pageSize === "all" ? 1 : Math.ceil(filtered.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const offset = 0;
  const limit = pageSize === "all" ? filtered.length : page * pageSize;
  const genres = [...new Set(games.flatMap((game) => game.genres ?? []))].sort();
  const platforms = [...new Set(games.flatMap((game) => game.platforms ?? []))].sort();
  if (filters.genre && !genres.includes(filters.genre)) genres.unshift(filters.genre);
  if (filters.platform && !platforms.includes(filters.platform)) platforms.unshift(filters.platform);
  const years = [...new Set(games.flatMap((game) => game.year === null ? [] : [game.year]))].sort((a, b) => b - a);
  if (filters.year && filters.year !== "unknown" && !years.includes(Number(filters.year))) years.unshift(Number(filters.year));
  const visible = filtered.slice(0, limit).map(({ slug, title, cover, year, score, tier, status, logged, genres }) => ({ slug, title, cover, year, score, tier, status, logged, genres, keywords: "" }));
  return { games: visible, filters, total: games.length, matched: filtered.length, page, pageCount, pageSize, offset, genres, platforms, years };
}
export type GamesPageData = ReturnType<typeof gamesPage>;
