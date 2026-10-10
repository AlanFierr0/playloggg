import "server-only";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";
import { getPortfolioShell } from "@/lib/portfolio";
import { validScoreRange, type GamesFilters } from "@/lib/games-view";
import type { GamesPageData } from "@/lib/games-page";

export async function getCatalogPage(filters: GamesFilters, page: number) {
  const shell = await getPortfolioShell();
  const valid = validScoreRange(filters);
  const {data, error} = await createAuthAdmin().rpc("catalog_page", {p_profile_id: shell.profile.id ? Number(shell.profile.id) : null,
    p_filters: {...filters, valid, ...(!valid ? {minScore:"", maxScore:""} : {})}, p_page: page});
  if (error || !data) throw new Error("The game catalog could not be loaded.");
  const result = data as unknown as GamesPageData;
  result.filters = filters;
  if (filters.genre && !result.genres.includes(filters.genre)) result.genres.unshift(filters.genre);
  if (filters.tag && !result.tags.some(tag => tag.toLowerCase() === filters.tag.toLowerCase())) result.tags.unshift(filters.tag);
  if (filters.year && filters.year !== "unknown" && !result.years.includes(Number(filters.year))) result.years.unshift(Number(filters.year));
  return {data: result, profile: shell.profile, access: shell.access};
}
