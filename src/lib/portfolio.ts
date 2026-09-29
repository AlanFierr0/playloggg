import "server-only";
import { cache } from "react";
import type { Database } from "@/types/database";
import type { Game, Portfolio } from "@/types/domain";
import { getLists } from "@/lib/collections";
import { getAccount, isOwnerEmail } from "@/lib/owner";

type GameRow = Database["public"]["Tables"]["games"]["Row"];
type RatingRow = Database["public"]["Tables"]["ratings"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

async function readPublic<T>(resource: string, tags: string[] = []): Promise<T[]> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key) throw new Error("Configure the Supabase URL and publishable key before running Playlogg.");
  const response = await fetch(`${base.replace(/\/$/, "")}/rest/v1/${resource}`, {
    headers: { apikey: key }, next: { revalidate: 60, tags }, signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Public portfolio read failed (HTTP ${response.status}).`);
  return response.json() as Promise<T[]>;
}

const image = (id: string, size: "screenshot_huge" | "screenshot_big") => `https://images.igdb.com/igdb/image/upload/t_${size}/${id}.jpg`;

// Shared catalog can be cached; authenticated profile data is always request-local.
export const getCatalog = cache(async () => {
  const rows: GameRow[] = [];
  let offset = 0;
  while (true) {
    const page = await readPublic<GameRow>(`games?select=slug,title,cover_url,release_year,released_on,genres,artwork_image_ids,screenshot_image_ids,search_keywords,id,is_sample,igdb_metadata,igdb_url&order=id.asc&limit=500&offset=${offset}`, ["game-catalog"]);
    rows.push(...page);
    if (page.length < 500) return rows;
    offset += page.length;
  }
});

export const getPortfolio = cache(async (): Promise<Portfolio> => {
  const [owner, rows] = await Promise.all([getAccount(), getCatalog()]);
  let profile: Pick<ProfileRow, "id" | "handle" | "display_name" | "is_sample" | "is_public"> | undefined;
  let ratings: Pick<RatingRow, "game_id" | "score" | "tier" | "review" | "status" | "platform" | "hours_played" | "completed_on" | "tags">[];
  if (owner?.profile) {
    profile = owner.profile;
    const { data, error } = await owner.supabase.from("ratings").select("game_id,score,tier,review,status,platform,hours_played,completed_on,tags").eq("profile_id", profile.id).limit(1000);
    if (error) throw new Error("Your ratings could not be loaded.");
    ratings = data;
  } else {
    const [profiles, sampleRatings] = await Promise.all([
      readPublic<ProfileRow>("profiles?handle=eq.alexvance&select=id,handle,display_name,is_sample,is_public&limit=1"),
      readPublic<RatingRow>("ratings?select=game_id,score,tier,review,status,platform,hours_played,completed_on,tags,profiles!inner(handle)&profiles.handle=eq.alexvance&limit=1000"),
    ]);
    profile = profiles[0];
    ratings = sampleRatings;
  }
  if (!profile) throw new Error("The published sample profile could not be loaded.");
  const byGame = new Map(ratings.map((rating) => [rating.game_id, rating]));
  const games: Game[] = rows.map((row) => {
    const rating = byGame.get(row.id);
    const metadata = row.igdb_metadata && typeof row.igdb_metadata === "object" && !Array.isArray(row.igdb_metadata) ? row.igdb_metadata : {};
    const names = (value: unknown): string[] => Array.isArray(value) ? value.slice(0, 50).flatMap((item) => typeof item === "string" ? [item.slice(0, 120)] : item && typeof item === "object" && "name" in item && typeof item.name === "string" ? [item.name.slice(0, 120)] : []) : [];
    return {
      slug: row.slug, title: row.title, cover: row.cover_url, year: row.release_year,
      releasedOn: row.released_on, genres: row.genres, keywords: row.search_keywords,
      score: rating?.score ?? null, tier: rating?.tier as Game["tier"] ?? null,
      review: rating?.review ?? null,
      status: rating?.status as Game["status"] ?? null, logged: Boolean(rating),
      platform: rating?.platform as Game["platform"] ?? null,
      hoursPlayed: rating?.hours_played ?? null, completedOn: rating?.completed_on ?? null, tags: rating?.tags ?? [],
      artwork: row.artwork_image_ids[0] ? image(row.artwork_image_ids[0], "screenshot_huge") : row.screenshot_image_ids[0] ? image(row.screenshot_image_ids[0], "screenshot_huge") : null,
      screenshots: row.screenshot_image_ids.map((id) => image(id, "screenshot_big")),
      isSampleCatalog: row.is_sample, summary: typeof metadata.summary === "string" ? metadata.summary.slice(0, 10000) : null,
      developers: names(metadata.developers), publishers: names(metadata.publishers), platforms: names(metadata.platforms),
      kind: typeof metadata.game_type === "string" ? metadata.game_type.slice(0, 80) : null, sourceUrl: row.igdb_url,
    };
  });
  games.sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.slug.localeCompare(b.slug));
  return { games, lists: await getLists(profile.id), profile: { id: String(profile.id), handle: profile.handle, displayName: profile.display_name, isSample: profile.is_sample, isPublic: profile.is_public }, access: { signedIn: Boolean(owner), canEdit: Boolean(owner?.profile), canImportCatalog: Boolean(owner?.profile && isOwnerEmail(owner.user.email)) } };
});

export async function getPublicGame(slug: string) {
  return (await getPortfolio()).games.find((game) => game.slug === slug);
}
