import type { Game } from "../types/domain.ts";
export interface GamingEvent {
  game_id: number | null;
  kind: string;
  score: number | null;
  score_changed: boolean;
  completion_changed: boolean;
  occurred_at: string;
}
export function gamingYear(events: GamingEvent[], year: number) {
  const eligible = events
    .filter((event) => new Date(event.occurred_at).getUTCFullYear() === year)
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));
  const scores = new Map<number, number>();
  const completed = new Set<number>();
  const favorites = new Set<number>();
  const months = new Map<string, number>();
  for (const event of eligible) {
    if (event.game_id !== null) {
      if (event.score_changed && event.score !== null)
        scores.set(event.game_id, event.score);
      if (event.completion_changed) completed.add(event.game_id);
      if (event.kind === "favorite") favorites.add(event.game_id);
    }
    const month = event.occurred_at.slice(0, 7);
    months.set(month, (months.get(month) ?? 0) + 1);
  }
  return {
    year,
    scored: scores.size,
    completed: completed.size,
    completedIds: [...completed],
    favorites: favorites.size,
    average: scores.size
      ? Math.round(
          ([...scores.values()].reduce((a, b) => a + b, 0) / scores.size) * 10,
        ) / 10
      : null,
    scores: [...scores].sort((a, b) => b[1] - a[1] || a[0] - b[0]),
    months: [...months].sort(([a], [b]) => a.localeCompare(b)),
  };
}
export type GamingYear = ReturnType<typeof gamingYear>;
export function yearGames(
  summary: GamingYear,
  rows: { id: number; slug: string }[],
  games: Game[],
) {
  const slugs = new Map(rows.map((row) => [row.id, row.slug]));
  const bySlug = new Map(games.map((game) => [game.slug, game]));
  return summary.scores.flatMap(([id, score]) => {
    const game = bySlug.get(slugs.get(id) ?? "");
    return game
      ? [
          {
            ...game,
            score,
            logged: true,
            status: summary.completedIds.includes(id)
              ? ("completed" as const)
              : null,
            platform: null,
            hoursPlayed: null,
            completedOn: null,
          },
        ]
      : [];
  });
}
