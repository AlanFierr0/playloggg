import "server-only";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
type RatingRow = Database["public"]["Tables"]["ratings"]["Row"];
export type ProfileRating = Pick<RatingRow, "game_id" | "score" | "tier" | "tier_manual" | "review" | "review_updated_at" | "status" | "play_style" | "platform" | "hours_played" | "completed_on" | "tags" | "updated_at">;
export const ratingFields = "game_id,score,tier,tier_manual,review,review_updated_at,status,play_style,platform,hours_played,completed_on,tags,updated_at";

export async function readProfileRatings(supabase: SupabaseClient<Database>, profileId: number, includeReviews = true): Promise<ProfileRating[]> {
  const all: ProfileRating[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await (includeReviews ? supabase.from("ratings").select(ratingFields) : supabase.from("ratings").select("game_id,score,tier,tier_manual,review_updated_at,status,play_style,platform,hours_played,completed_on,tags,updated_at"))
      .eq("profile_id", profileId).order("game_id", { ascending: true }).range(offset, offset + 499);
    if (error) throw new Error("Your ratings could not be loaded.");
    all.push(...data.map(row => ({...row, review: "review" in row ? row.review : null})));
    if (data.length < 500) return all;
  }
}
