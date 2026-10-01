import type { Game } from "../types/domain.ts";

export function compareGames(left: Game[], right: Game[]) {
  const bySlug = new Map(right.filter(game => game.logged).map(game => [game.slug, game]));
  const shared = left.filter(game => game.logged && bySlug.has(game.slug)).map(game => {
    const other = bySlug.get(game.slug)!;
    return { game, other, difference: game.score !== null && other.score !== null ? Math.abs(game.score - other.score) : null };
  }).sort((a,b) => a.game.slug < b.game.slug ? -1 : a.game.slug > b.game.slug ? 1 : 0);
  const scored = shared.filter((entry): entry is typeof entry & { difference: number } => entry.difference !== null);
  const affinity = scored.length >= 5 ? Math.round((100 - scored.reduce((total,entry) => total + entry.difference,0) / scored.length) * 10) / 10 : null;
  const divergences = scored.filter(entry => entry.difference > 0).sort((a,b) => b.difference - a.difference || (a.game.slug < b.game.slug ? -1 : a.game.slug > b.game.slug ? 1 : 0)).slice(0,2);
  const masterpieces = scored.filter(entry => entry.game.score! >= 90 && entry.other.score! >= 90).slice(0,3);
  return { shared, scored: scored.length, unrated: shared.length - scored.length, affinity, divergences, masterpieces };
}
