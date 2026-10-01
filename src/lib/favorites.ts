import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Favorite } from "@/types/domain";

export async function readFavorites(client: SupabaseClient<Database>, profileId: number): Promise<Favorite[]> {
  const all: Favorite[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.from("profile_favorites")
      .select("game_id,featured_slot,created_at,games!inner(slug)").eq("profile_id", profileId)
      .order("game_id").range(offset, offset + 499);
    if (error) throw new Error("This profile's favorites could not be loaded.");
    all.push(...data.map(row => ({ slug: row.games.slug, featuredSlot: row.featured_slot, createdAt: row.created_at })));
    if (data.length < 500) return all;
  }
}
