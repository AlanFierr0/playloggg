"use server";
import { revalidatePath } from "next/cache";
import { getAccount } from "@/lib/owner";
import { validateBulkRating } from "@/lib/bulk-rating-input";

export async function updateBulkRatings(input: unknown) {
  const parsed = validateBulkRating(input);
  if (!parsed) return { ok: false, count: 0, message: "Choose up to 100 games and a status or platform change." };
  try {
    const account = await getAccount();
    if (!account?.profile) return { ok: false, count: 0, message: "Sign in to edit your games." };
    const { data: games, error: gameError } = await account.supabase.from("games").select("id").in("slug", parsed.slugs);
    if (gameError || !games.length) throw new Error("Unavailable games");
    // Update existing owned entries only. Submitted scores, tiers and other fields are ignored.
    const { data, error } = await account.supabase.from("ratings").update({
      ...(parsed.status !== undefined ? { status: parsed.status } : {}),
      ...(parsed.platform !== undefined ? { platform: parsed.platform } : {}),
      updated_at: new Date().toISOString(),
    }).eq("profile_id", account.profile.id).in("game_id", games.map(game => game.id)).select("game_id");
    if (error) throw error;
    revalidatePath("/", "layout");
    return { ok: true, count: data.length, message: "Selected games updated." };
  } catch { return { ok: false, count: 0, message: "Games could not be updated. Please retry." }; }
}
