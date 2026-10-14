import type { Game } from "../types/domain.ts";
import { isCalendarDate } from "./rating-input.ts";

export function completionTimeline(games: Game[]) {
  const completed = games.filter(game => game.logged && game.status === "completed");
  const months = new Map<string, Game[]>();
  const undated: Game[] = [];
  for (const game of completed) {
    if (!isCalendarDate(game.completedOn)) { undated.push(game); continue; }
    const month = game.completedOn.slice(0, 7);
    const entries = months.get(month) ?? [];
    entries.push(game);
    months.set(month, entries);
  }
  return {
    months: [...months].sort(([a], [b]) => b.localeCompare(a)).map(([month, entries]) => {
      const rated = entries.filter(game => game.score !== null);
      const hours = entries.filter(game => game.hoursPlayed != null);
      const genres = new Map<string, number>();
      for (const game of entries) for (const genre of new Set(game.genres ?? [])) genres.set(genre, (genres.get(genre) ?? 0) + 1);
      return { month, games: entries.sort((a, b) => b.completedOn!.localeCompare(a.completedOn!) || a.slug.localeCompare(b.slug)),
        average: rated.length ? Math.round(rated.reduce((sum, game) => sum + game.score!, 0) / rated.length * 10) / 10 : null,
        hours: hours.length ? hours.reduce((sum, game) => sum + game.hoursPlayed!, 0) : null,
        genres: [...genres].sort(([a, x], [b, y]) => y - x || a.localeCompare(b)).slice(0, 3).map(([genre]) => genre),
      };
    }),
    undated: undated.sort((a, b) => a.title.localeCompare(b.title)),
  };
}


export function completionChart(months: { month: string; games: Game[] }[]) {
  const counts = new Map<string, number>();
  for (const group of months) {
    const period = group.month.slice(-2);
    counts.set(period, (counts.get(period) ?? 0) + group.games.length);
  }
  return Array.from({ length: 12 }, (_, index) => {
    const period = String(index + 1).padStart(2, "0");
    return { period, count: counts.get(period) ?? 0 };
  });
}
