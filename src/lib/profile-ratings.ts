import "server-only";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
type RatingRow = Database["public"]["Tables"]["ratings"]["Row"];
export type ProfileRating = Pick<RatingRow, "game_id" | "score" | "tier" | "review" | "status" | "platform" | "hours_played" | "completed_on" | "tags">;
export const ratingFields = "game_id,score,tier,review,status,platform,hours_played,completed_on,tags";

export async function readProfileRatings(supabase: SupabaseClient<Database>, profileId: number): Promise<ProfileRating[]> {
  const all: ProfileRating[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from("ratings").select(ratingFields)
      .eq("profile_id", profileId).order("game_id", { ascending: true }).range(offset, offset + 499);
    if (error) throw new Error("Your ratings could not be loaded.");
    all.push(...data);
    if (data.length < 500) return all;
  }
}
