import type { Portfolio } from "../types/domain.ts";
import { tasteStats } from "./taste.ts";
export interface ShareCard {
  title: string;
  subtitle: string;
  items: {
    label: string;
    value: string;
    cover?: string;
    translateLabel?: boolean;
  }[];
}
export function profileCard(portfolio: Portfolio, kind: string): ShareCard {
  const stats = tasteStats(portfolio.games),
    bySlug = new Map(portfolio.games.map((game) => [game.slug, game]));
  if (kind === "taste")
    return {
      title: portfolio.profile.displayName,
      subtitle: "Taste Fingerprint",
      items: [
        ...stats.preferredGenres.slice(0, 3),
        ...stats.preferredStudios.slice(0, 3),
      ].map((group) => ({
        label: group.name,
        value: `${group.average} / 100 · ${group.count}`,
      })),
    };
  if (kind === "tiers")
    return {
      title: portfolio.profile.displayName,
      subtitle: "My Tier List",
      items: portfolio.games
        .filter((game) => game.logged && game.tier)
        .sort(
          (a, b) =>
            "SABCDF".indexOf(a.tier!) - "SABCDF".indexOf(b.tier!) ||
            a.slug.localeCompare(b.slug),
        )
        .map((game) => ({
          label: game.title,
          value: game.tier!,
          cover: game.cover,
        })),
    };
  const favorites = [...(portfolio.favorites ?? [])].sort(
    (a, b) =>
      (a.featuredSlot ?? 99) - (b.featuredSlot ?? 99) ||
      a.slug.localeCompare(b.slug),
  );
  const games = favorites.flatMap((favorite) =>
    bySlug.get(favorite.slug) ? [bySlug.get(favorite.slug)!] : [],
  );
  return {
    title: portfolio.profile.displayName,
    subtitle: "My Favorite Games",
    items: games.map((game) => ({
      label: game.title,
      value: favorites.find((favorite) => favorite.slug === game.slug)
        ?.featuredSlot
        ? `#${favorites.find((favorite) => favorite.slug === game.slug)!.featuredSlot}`
        : "Favorite",
      cover: game.cover,
    })),
  };
}
