import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
export async function readPreferenceRanking(
  client: SupabaseClient<Database>,
  profileId: number,
  rows: { id: number; slug: string }[],
) {
  const { data, error } = await client
    .from("profile_rankings")
    .select("game_ids,revision")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw new Error("Your ranking could not be loaded.");
  if (!data) return undefined;
  const slugs = new Map(rows.map((row) => [row.id, row.slug]));
  return {
    slugs: data.game_ids.flatMap((id) =>
      slugs.get(id) ? [slugs.get(id)!] : [],
    ),
    revision: data.revision,
  };
}
