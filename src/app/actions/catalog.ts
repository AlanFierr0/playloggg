"use server";
import { revalidatePath, updateTag } from "next/cache";
import { checkOperationLimit, operationFailure } from "@/lib/operation-limits";
import { getAccount } from "@/lib/owner";
import { catalogQuery, igdbId, normalizeImport, normalizeMatch, searchBody, type IgdbMatch } from "@/lib/catalog-input";
import { queryIgdb } from "@/lib/igdb";
import { createCatalogAdmin } from "@/lib/supabase/catalog-admin";
import type { Game } from "@/types/domain";

type SearchResult = { ok: boolean; message: string; games: IgdbMatch[] };
type ImportResult = { ok: boolean; message: string; game?: Game };
const fields = "id,slug,title,cover_url,release_year,search_keywords";

export async function searchIgdb(input: unknown, hideRated = false): Promise<SearchResult> {
  const query = catalogQuery(input);
  if (!query || typeof hideRated !== "boolean") return { ok: false, message: "Enter a title of 2–100 characters.", games: [] };
  try {
    const owner = await getAccount();
    if (!owner?.profile) return { ok: false, message: "Sign in to search more games.", games: [] };
    await checkOperationLimit(owner.user.id,"search");
    const records = await queryIgdb(searchBody(query));
    const seen = new Set<number>();
    let games = records.slice(0, 20).map(normalizeMatch).filter((game): game is IgdbMatch => Boolean(game && !seen.has(game.id) && seen.add(game.id)));
    if (games.length) {
      const { data: stored, error } = await owner.supabase.from("games").select("id,igdb_id,slug").in("igdb_id", games.map(game => game.id));
      if (error) return { ok: false, games: [], message: "The catalog could not be checked. Please retry." };
      for (const game of games) { const existing = stored.find(row => row.igdb_id === game.id); if (existing) game.catalogSlug = existing.slug; }
      if (hideRated && stored.length) {
        const {data:rated,error:ratingError}=await owner.supabase.from("ratings").select("game_id").eq("profile_id",owner.profile.id).in("game_id",stored.map(row=>row.id)).not("score","is",null);
        if(ratingError) return {ok:false,games:[],message:"Your ratings could not be loaded."};
        const excluded=new Set(stored.filter(row=>rated.some(rating=>rating.game_id===row.id)).map(row=>row.igdb_id));
        games=games.filter(game=>!excluded.has(game.id));
      }
    }
    return { ok: true, games, message: games.length ? "" : "No games found. Try another title." };
  } catch(error) {
    return { ok: false, games: [], message: operationFailure(error,"Game search is unavailable right now. Please retry.") };
  }
}

export async function importIgdb(input: unknown): Promise<ImportResult> {
  if (!igdbId(input)) return { ok: false, message: "Choose a valid game." };
  try {
    const owner = await getAccount();
    if (!owner?.profile) return { ok: false, message: "Sign in before importing games." };
    // Reuse the reviewed shared catalog even when provider import is unconfigured.
    const { data: existing, error: readError } = await owner.supabase.from("games").select(fields).eq("igdb_id", input).maybeSingle();
    if (readError) return { ok: false, message: "The catalog could not be checked. Please retry." };
    let row = existing;
    if (!row) {
      await checkOperationLimit(owner.user.id,"import");
      const admin = createCatalogAdmin();
      // The browser supplies only the numeric ID. Re-fetch all metadata from IGDB.
      const records = await queryIgdb(`fields id,name,slug,first_release_date,cover.image_id,genres.name,platforms.name,artworks.image_id,screenshots.image_id,url,summary,game_type.type,involved_companies.company.name,involved_companies.developer,involved_companies.publisher; where id = ${input}; limit 1;`);
      const game = records.length === 1 ? normalizeImport(records[0]) : null;
      if (!game || game.igdb_id !== input) return { ok: false, message: "This game is unavailable. Nothing was imported." };
      // Unique igdb_id + DO NOTHING handles concurrent imports without replacing
      // existing metadata, slugs, sample flags, or personal ratings.
      const { error } = await admin.from("games").upsert(game, { onConflict: "igdb_id", ignoreDuplicates: true });
      if (error) return { ok: false, message: "The game could not be imported. Please retry." };
      const { data, error: resultError } = await admin.from("games").select(fields).eq("igdb_id", input).single();
      if (resultError || !data) return { ok: false, message: "The catalog could not be refreshed. Please retry; an existing import will be reused." };
      row = data;
    }
    updateTag("game-catalog");
    revalidatePath("/", "layout");
    return { ok: true, message: existing ? "This game is already in the catalog." : "Game imported. You can now log this game.", game: { slug: row.slug, title: row.title, cover: row.cover_url, year: row.release_year, keywords: row.search_keywords, score: null, logged: false } };
  } catch(error) {
    return { ok: false, message: operationFailure(error,"Import is unavailable or busy. Please retry; existing games will be reused.") };
  }
}
