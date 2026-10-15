import { loggedGames } from "./portfolio-view.ts";
import type { Game } from "../types/domain.ts";

export function rankingOrder(games: Game[], manual: Record<string, number> = {}): string[] {
  const scored = loggedGames(games).map(game => game.slug);
  const valid = new Set(scored);
  const slots: (string | undefined)[] = Array(scored.length);
  const pinned = Object.entries(manual).filter(([slug, position]) => valid.has(slug) && Number.isInteger(position) && position >= 0)
    .sort(([slugA, a], [slugB, b]) => a - b || slugA.localeCompare(slugB));
  for (const [slug, position] of pinned) {
    let index = Math.min(position, slots.length - 1);
    while (index < slots.length && slots[index]) index++;
    if (index === slots.length) index = slots.findIndex(value => !value);
    slots[index] = slug;
  }
  const fixed = new Set(pinned.map(([slug]) => slug));
  const automatic = scored.filter(slug => !fixed.has(slug));
  let index = 0;
  return Array.from(slots, slug => slug ?? automatic[index++]);
}
