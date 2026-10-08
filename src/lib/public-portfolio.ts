import { parseTierRanges, defaultTierRanges } from "@/lib/tier-ranges";
import { avatarSource } from "@/lib/avatar-input";
import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { getCatalog, portfolioGames } from "@/lib/portfolio";
import {readPreferenceRanking} from "@/lib/preference-ranking";
import { readFavorites } from "@/lib/favorites";
import { publicProfilePath } from "@/lib/profile-settings";
import type { Database } from "@/types/database";
import type { CuratedList, Portfolio } from "@/types/domain";

type RatingRow = Database["public"]["Tables"]["ratings"]["Row"];
type PublicRating = Pick<RatingRow, "game_id" | "score" | "tier" | "tier_manual" | "review" | "status" | "platform" | "hours_played" | "completed_on" | "tags" | "updated_at">;

export const getPublicPortfolio = cache(async (handle: string): Promise<Portfolio | null> => {
  const publicBase = publicProfilePath(handle);
  if (!publicBase) return null;
  const supabase = createPublicClient();
  const { data: profile, error } = await supabase.from("profiles")
    .select("id,handle,display_name,is_public,avatar_url,bio,location,platform_preference,is_discoverable,tier_ranges").eq("handle", handle).eq("is_public", true).maybeSingle();
  if (error) throw new Error("This portfolio could not be loaded.");
  if (!profile) return null;
  const [rows, ratings, favorites] = await Promise.all([
    getCatalog(),
    (async () => {
      const all: PublicRating[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await supabase.from("ratings")
          .select("game_id,score,tier,tier_manual,review,status,platform,hours_played,completed_on,tags,updated_at")
          .eq("profile_id", profile.id).order("game_id").range(offset, offset + 499);
        if (error) throw new Error("This portfolio's entries could not be loaded.");
        all.push(...data);
        if (data.length < 500) return all;
      }
    })(),
    readFavorites(supabase, profile.id),
  ]);
  const ranking=await readPreferenceRanking(supabase,profile.id,rows);
  // Recheck after the paginated reads in case publishing changed during the request.
  const { data: current, error: currentError } = await supabase.from("profiles").select("id")
    .eq("id", profile.id).eq("handle", handle).eq("is_public", true).maybeSingle();
  if (currentError) throw new Error("This portfolio could not be loaded.");
  if (!current) return null;
  return {
    games: portfolioGames(rows, ratings), lists: [], favorites, publicBase, ranking,
    profile: { id: String(profile.id), handle: profile.handle, displayName: profile.display_name, isSample: false, avatarUrl: avatarSource(profile.id, profile.avatar_url), bio: profile.bio, location: profile.location, platformPreference: profile.platform_preference, tierRanges: parseTierRanges(profile.tier_ranges) ?? defaultTierRanges, isPublic: true, isDiscoverable:profile.is_discoverable },
    access: { signedIn: false, canEdit: false, canImportCatalog: false },
  };
});

export async function getPublicList(handle: string, id: string): Promise<CuratedList | null> {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) return null;
  const portfolio = await getPublicPortfolio(handle);
  if (!portfolio) return null;
  const supabase = createPublicClient();
  const { data: list, error } = await supabase.from("curated_lists").select("id,name,revision,description,is_public,is_ranked")
    .eq("profile_id", Number(portfolio.profile.id)).eq("id", Number(id)).maybeSingle();
  if (error) throw new Error("This list could not be loaded.");
  if (!list) return null;
  const { data: items, error: itemError } = await supabase.from("curated_list_items")
    .select("game_id,position").eq("list_id", list.id).order("position").limit(500);
  if (itemError) throw new Error("This list's games could not be loaded.");
  const { data: current, error: currentError } = await supabase.from("profiles").select("id")
    .eq("id", Number(portfolio.profile.id)).eq("handle", handle).eq("is_public", true).maybeSingle();
  if (currentError) throw new Error("This portfolio could not be loaded.");
  if (!current) return null;
  const {data:currentList,error:listVisibilityError}=await supabase.from("curated_lists").select("id").eq("id",list.id).eq("profile_id",Number(portfolio.profile.id)).eq("is_public",true).maybeSingle();
  if(listVisibilityError)throw new Error("List visibility could not be checked.");if(!currentList)return null;
  const rows = await getCatalog();
  const byId = new Map(rows.map((row) => [row.id, row.slug]));
  const slugs = items.map((item) => byId.get(item.game_id));
  if (slugs.some((slug) => !slug)) throw new Error("Some list games could not be loaded.");
  return { ...list, slugs: slugs as string[] };
}
