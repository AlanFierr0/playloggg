"use server";

import { revalidatePath } from "next/cache";
import { getAccount } from "@/lib/owner";
import { maximumPlaytime, validateRating } from "@/lib/rating-input";

export async function saveRating(input: unknown): Promise<{ ok: boolean; message: string; updatedAt?: string }> {
  const rating = validateRating(input, true);
  if (!rating) return { ok: false, message: "Use a score from 0 to 100, a valid tier/status/platform, nonnegative decimal hours, a valid calendar date, up to 20 tags of 1–48 characters, and a review of at most 20,000 characters. Score, platform, hours, and date may be blank." };
  try {
    const owner = await getAccount();
    if (!owner?.profile) return { ok: false, message: "Sign in to your account before saving." };
    const { data: game, error: gameError } = await owner.supabase.from("games").select("id,released_on").eq("slug", rating.slug).single();
    if (gameError || !game) return { ok: false, message: "This game is unavailable. Your draft has been kept." };
    const {data: previous, error: previousError} = await owner.supabase.from("ratings").select("hours_played,completed_on")
      .eq("profile_id", owner.profile.id).eq("game_id", game.id).maybeSingle();
    if (previousError) return {ok:false,message:"This entry could not be loaded. Your draft has been kept."};
    const dateChanged = rating.completedOn !== (previous?.completed_on ?? null);
    const hoursChanged = rating.hoursPlayed !== (previous?.hours_played ?? null);
    if (dateChanged && rating.completedOn && rating.completedOn > new Date().toISOString().slice(0,10)) return {ok:false,message:"Completion date cannot be in the future. Your draft has been kept."};
    if (dateChanged && rating.completedOn && game.released_on && rating.completedOn < game.released_on) return { ok: false, message: "Completion date cannot be before the game’s release date. Your draft has been kept." };
    const maxHours = maximumPlaytime(game.released_on);
    if (hoursChanged && rating.hoursPlayed !== null && maxHours !== null && rating.hoursPlayed > maxHours) return { ok: false, message: "Playtime cannot exceed the hours elapsed since the game’s release. Your draft has been kept." };
    const { data: updatedAt, error } = await owner.supabase.rpc("save_rating", {
      p_game_id: game.id,
      p_expected_updated_at: rating.expectedUpdatedAt ?? null,
      p_values: { score: rating.score, tier: rating.tier, tier_manual: rating.tierManual ?? rating.tier !== null,
        status: rating.status, platform: rating.platform, tags: rating.tags, hours_played: rating.hoursPlayed,
        completed_on: rating.completedOn, review: rating.review || null },
    });
    if (error) return { ok: false, message: error.code === "40001"
      ? "This entry changed in another tab. Your draft is kept; reload and review the latest entry before saving."
      : "Your rating could not be saved. Your draft has been kept; please try again." };
    revalidatePath("/", "layout");
    return { ok: true, updatedAt, message: "Entry saved: score, tier, playback status, platform, playtime, completion date, review and tags." };
  } catch {
    return { ok: false, message: "Saving is unavailable right now. Your draft has been kept; please try again." };
  }
}
