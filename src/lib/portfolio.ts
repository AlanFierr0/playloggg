import "server-only";
import { cache } from "react";
import type { Database } from "@/types/database";
import type { Game, Portfolio } from "@/types/domain";

type GameRow = Database["public"]["Tables"]["games"]["Row"];
type RatingRow = Database["public"]["Tables"]["ratings"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

async function readPublic<T>(resource: string): Promise<T[]> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key) throw new Error("Configure the Supabase URL and publishable key before running Playlogg.");
  const response = await fetch(`${base.replace(/\/$/, "")}/rest/v1/${resource}`, {
    headers: { apikey: key }, next: { revalidate: 60 }, signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Public portfolio read failed (HTTP ${response.status}).`);
  return response.json() as Promise<T[]>;
}

const image = (id: string, size: "screenshot_huge" | "screenshot_big") => `https://images.igdb.com/igdb/image/upload/t_${size}/${id}.jpg`;

// Only publishable-key reads; no IGDB credentials, provider calls or privileged writes.
export const getPortfolio = cache(async (): Promise<Portfolio> => {
  const [profiles, rows, ratings] = await Promise.all([
    readPublic<ProfileRow>("profiles?handle=eq.alexvance&select=id,handle,display_name&limit=1"),
    readPublic<GameRow>("games?select=slug,title,cover_url,release_year,released_on,genres,artwork_image_ids,screenshot_image_ids,search_keywords,id&order=slug.asc&limit=1000"),
    readPublic<RatingRow & { profiles: { handle: string } }>("ratings?select=game_id,score,tier,profiles!inner(handle)&profiles.handle=eq.alexvance&limit=1000"),
  ]);
  const profile = profiles[0];
  if (!profile) throw new Error("The published sample profile could not be loaded.");
  const byGame = new Map(ratings.map((rating) => [rating.game_id, rating]));
  const games: Game[] = rows.map((row) => {
    const rating = byGame.get(row.id);
    return {
      slug: row.slug, title: row.title, cover: row.cover_url, year: row.release_year,
      releasedOn: row.released_on, genres: row.genres, keywords: row.search_keywords,
      score: rating?.score ?? null, tier: rating?.tier as Game["tier"] ?? null,
      artwork: row.artwork_image_ids[0] ? image(row.artwork_image_ids[0], "screenshot_huge") : row.screenshot_image_ids[0] ? image(row.screenshot_image_ids[0], "screenshot_huge") : null,
      screenshots: row.screenshot_image_ids.map((id) => image(id, "screenshot_big")),
    };
  });
  games.sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.slug.localeCompare(b.slug));
  return { games, profile: { id: String(profile.id), handle: profile.handle, displayName: profile.display_name } };
});

export async function getPublicGame(slug: string) {
  return (await getPortfolio()).games.find((game) => game.slug === slug);
}
