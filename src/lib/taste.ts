import type { Game } from "../types/domain.ts";

export interface TasteGroup {
  name: string;
  count: number;
  average: number;
  delta: number;
}
const round = (value: number) => Math.round(value * 10) / 10;
export function tasteStats(games: Game[]) {
  const entries = games.filter((game) => game.logged);
  const rated = entries.filter(
    (game): game is Game & { score: number } => game.score !== null,
  );
  const average = rated.length
    ? rated.reduce((sum, game) => sum + game.score, 0) / rated.length
    : null;
  function groups(field: "genres" | "developers" | "publishers"): TasteGroup[] {
    const map = new Map<string, number[]>();
    for (const game of rated)
      for (const name of new Set(
        game[field]?.map((name) => name.trim()).filter(Boolean) ?? [],
      ))
        map.set(name, [...(map.get(name) ?? []), game.score]);
    return [...map]
      .map(([name, scores]) => {
        const value =
          scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return {
          name,
          count: scores.length,
          average: round(value),
          delta: round(value - average!),
        };
      })
      .sort(
        (a, b) =>
          b.count - a.count ||
          b.average - a.average ||
          a.name.localeCompare(b.name),
      );
  }
  const eras = new Map<string, number>();
  const platforms = new Map<string, number>();
  for (const game of entries) {
    if (game.year !== null) {
      const era = `${Math.floor(game.year / 10) * 10}s`;
      eras.set(era, (eras.get(era) ?? 0) + 1);
    }
    if (game.platform)
      platforms.set(game.platform, (platforms.get(game.platform) ?? 0) + 1);
  }
  const genres = groups("genres"),
    studios = groups("developers"),
    publishers = groups("publishers");
  const preferred = (groups: TasteGroup[]) =>
    groups
      .filter((group) => group.count >= 3)
      .sort(
        (a, b) =>
          b.average - a.average ||
          b.count - a.count ||
          a.name.localeCompare(b.name),
      );
  const completed = entries.filter(
    (game) => game.status === "completed",
  ).length;
  return {
    rated: rated.length,
    logged: entries.length,
    average: average === null ? null : round(average),
    genres,
    studios,
    publishers,
    preferredGenres: preferred(genres),
    preferredStudios: preferred(studios),
    completed,
    completionRate: entries.length
      ? round((completed / entries.length) * 100)
      : null,
    shelved: entries.filter((game) => game.status === "shelved").length,
    highScores: rated.filter((game) => game.score >= 90).length,
    eras: [...eras].sort(([a], [b]) => a.localeCompare(b)),
    platforms: [...platforms].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    ),
    unknownYears: entries.filter((game) => game.year === null).length,
  };
}
