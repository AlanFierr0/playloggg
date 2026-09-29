"use server";

import { revalidatePath } from "next/cache";
import { getOwner } from "@/lib/owner";
import { validateRating } from "@/lib/rating-input";

export async function saveRating(input: unknown): Promise<{ ok: boolean; message: string }> {
  const rating = validateRating(input);
  if (!rating) return { ok: false, message: "Choose an optional score from 0 to 100, a valid tier/status, and a review of at most 20,000 characters." };
  try {
    const owner = await getOwner();
    if (!owner?.profile) return { ok: false, message: "Sign in to your owner account before saving." };
    const { data: game, error: gameError } = await owner.supabase.from("games").select("id").eq("slug", rating.slug).single();
    if (gameError || !game) return { ok: false, message: "This game is unavailable. Your draft has been kept." };
    const { error } = await owner.supabase.from("ratings").upsert({
      profile_id: owner.profile.id, game_id: game.id, score: rating.score,
      tier: rating.tier, status: rating.status, review: rating.review || null, updated_at: new Date().toISOString(),
    }, { onConflict: "profile_id,game_id" });
    if (error) return { ok: false, message: "Your rating could not be saved. Your draft has been kept; please try again." };
    revalidatePath("/", "layout");
    return { ok: true, message: "Entry saved: score, tier, playback status, and review. Other fields are still temporary; nothing was broadcast." };
  } catch {
    return { ok: false, message: "Saving is unavailable right now. Your draft has been kept; please try again." };
  }
}
