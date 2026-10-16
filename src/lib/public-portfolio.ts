import { parseTierRanges, defaultTierRanges } from "@/lib/tier-ranges";
import { avatarSource } from "@/lib/avatar-input";
import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { getCatalogGame, getCatalogRows, portfolioGames } from "@/lib/portfolio";
import {readPreferenceRanking} from "@/lib/preference-ranking";
import { readFavorites } from "@/lib/favorites";
import { publicProfilePath } from "@/lib/profile-settings";
import type { Database } from "@/types/database";
import type { Portfolio } from "@/types/domain";

type RatingRow = Database["public"]["Tables"]["ratings"]["Row"];
type PublicRating = Pick<RatingRow, "game_id" | "score" | "tier" | "tier_manual" | "review" | "review_updated_at" | "status" | "play_style" | "platform" | "hours_played" | "completed_on" | "tags" | "updated_at">;

export const getPublicPortfolioShell = cache(async (handle: string): Promise<Portfolio | null> => {
  const publicBase = publicProfilePath(handle);
  if (!publicBase) return null;
  const supabase = createPublicClient();
  const { data: profile, error } = await supabase.from("profiles")
    .select("id,handle,display_name,is_public,avatar_url,bio,location,platform_preference,is_discoverable,tier_ranges").eq("handle", handle).eq("is_public", true).maybeSingle();
  if (error) throw new Error("This portfolio could not be loaded.");
  if (!profile) return null;
  return { games: [], lists: [], publicBase,
    profile: { id: String(profile.id), handle: profile.handle, displayName: profile.display_name, isSample: false, avatarUrl: avatarSource(profile.id, profile.avatar_url), bio: profile.bio, location: profile.location, platformPreference: profile.platform_preference, tierRanges: parseTierRanges(profile.tier_ranges) ?? defaultTierRanges, isPublic: true, isDiscoverable:profile.is_discoverable },
    access: { signedIn: false, canEdit: false, canImportCatalog: false },
  };
});

export const getPublicPortfolio = cache(async (handle: string, section: "overview" | "ranking" | "tiers" | "reviews" | "stats" | "favorites" = "overview"): Promise<Portfolio | null> => {
  const shell = await getPublicPortfolioShell(handle);
  if (!shell) return null;
  const supabase = createPublicClient();
  const [ratings, favorites] = await Promise.all([
    (async () => {
      const all: PublicRating[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await (section === "reviews"
          ? supabase.from("ratings").select("game_id,score,tier,tier_manual,review,review_updated_at,status,play_style,platform,hours_played,completed_on,tags,updated_at")
          : supabase.from("ratings").select("game_id,score,tier,tier_manual,status,play_style,platform,hours_played,completed_on,tags,updated_at"))
          .eq("profile_id", Number(shell.profile.id)).order("game_id").range(offset, offset + 499);
        if (error) throw new Error("This portfolio's entries could not be loaded.");
        all.push(...data.map(row => ({...row, review: section === "reviews" && "review" in row ? row.review : null, review_updated_at: "review_updated_at" in row ? row.review_updated_at : null})));
        if (data.length < 500) return all;
      }
    })(),
    ["overview","favorites"].includes(section) ? readFavorites(supabase, Number(shell.profile.id)) : Promise.resolve([]),
  ]);
  const rows = await getCatalogRows(ratings.map(row => row.game_id), favorites.map(favorite => favorite.slug));
  const ranking=section === "ranking" ? await readPreferenceRanking(supabase,Number(shell.profile.id),rows) : undefined;
  // Recheck after the paginated reads in case publishing changed during the request.
  const { data: current, error: currentError } = await supabase.from("profiles").select("id")
    .eq("id", Number(shell.profile.id)).eq("handle", handle).eq("is_public", true).maybeSingle();
  if (currentError) throw new Error("This portfolio could not be loaded.");
  if (!current) return null;
  return {
    ...shell, games: portfolioGames(rows, ratings), favorites, ranking,
  };
});

export const getPublicEntry = cache(async (handle: string, slug: string): Promise<Portfolio | null> => {
  const [shell, row] = await Promise.all([getPublicPortfolioShell(handle), getCatalogGame(slug)]);
  if (!shell || !row) return null;
  const supabase = createPublicClient();
  const {data: rating, error} = await supabase.from("ratings")
    .select("game_id,score,tier,tier_manual,review,review_updated_at,status,play_style,platform,hours_played,completed_on,tags,updated_at")
    .eq("profile_id", Number(shell.profile.id)).eq("game_id", row.id).maybeSingle();
  if (error) throw new Error("This entry could not be loaded.");
  if (!rating) {
    const {data: favorite, error: favoriteError} = await supabase.from("profile_favorites").select("game_id")
      .eq("profile_id", Number(shell.profile.id)).eq("game_id", row.id).maybeSingle();
    if (favoriteError) throw new Error("This entry could not be loaded.");
    if (!favorite) return null;
  }
  // Publication can change while the entry is being read.
  const {data: current, error: currentError} = await supabase.from("profiles").select("id")
    .eq("id", Number(shell.profile.id)).eq("handle", handle).eq("is_public", true).maybeSingle();
  if (currentError) throw new Error("This portfolio could not be loaded.");
  if (!current) return null;
  return {...shell, games: portfolioGames([row], rating ? [rating] : [])};
});
