"use server";
import { revalidatePath } from "next/cache";
import { getAccount } from "@/lib/owner";
import { favoriteInput } from "@/lib/favorite-input";

export async function updateFavorite(_previous: { message: string }, form: FormData) {
  const input = favoriteInput(form);
  if (!input) return { message: "Choose a catalog game and a featured position from 1 to 4." };
  try {
    const account = await getAccount();
    if (!account?.profile) return { message: "Sign in to edit your own favorites." };
    const { data: game, error: gameError } = await account.supabase.from("games").select("id").eq("slug", input.slug).maybeSingle();
    if (!game || gameError) return { message: "This game is unavailable. Your favorites have not changed." };
    // The invoker RPC derives ownership from Auth and moves a featured slot atomically.
    const { error } = await account.supabase.rpc("set_profile_favorite", {
      p_game_id: game.id, p_favorite: input.favorite, p_featured_slot: input.featuredSlot ?? undefined,
    });
    if (error) return { message: "Your favorites could not be saved. Please retry." };
    revalidatePath("/", "layout");
    return { message: input.favorite ? "Favorite saved independently of your score, tier and status." : "Favorite removed. Your rating and status have not changed." };
  } catch { return { message: "Saving is unavailable. Please retry." }; }
}
