"use server";
import { revalidatePath } from "next/cache";
import { getAccount } from "@/lib/owner";
import { positiveId, validateList } from "@/lib/collection-input";
import type { CuratedListSummary } from "@/types/domain";

type Result = { ok: boolean; message: string; list?: CuratedListSummary };
export async function saveList(input: unknown): Promise<Result> {
  const draft = validateList(input);
  if (!draft) return { ok: false, message: "Use a name of 1–80 characters and up to 500 different catalog games. Your draft has been kept." };
  try {
    const owner = await getAccount();
    if (!owner?.profile) return { ok: false, message: "Sign in to your account before saving lists." };
    let ids: number[] = [];
    if (draft.slugs.length) {
      const { data, error } = await owner.supabase.from("games").select("id,slug").in("slug", draft.slugs);
      if (error || data.length !== draft.slugs.length) return { ok: false, message: "A selected game is unavailable. Your draft has been kept." };
      const bySlug = new Map(data.map((game) => [game.slug, game.id]));
      ids = draft.slugs.map((slug) => bySlug.get(slug)!);
    }
    const { data, error } = await owner.supabase.rpc("save_curated_list_v2", {
      p_profile_id: owner.profile.id, p_list_id: draft.id as number, p_name: draft.name,
      p_game_ids: ids, p_expected_revision: draft.revision as number, p_description:draft.description,p_public:draft.isPublic,p_ranked:draft.isRanked,
    });
    if (error) return { ok: false, message: error.code === "40001"
      ? "This list changed in another tab. Your draft has been kept; reload to get its latest version."
      : error.code === "23505" ? "You already have a list with this name. Your draft has been kept."
      : "The list could not be saved. Your draft has been kept; please try again." };
    const list = data as unknown as CuratedListSummary;
    revalidatePath("/", "layout");
    return { ok: true, message: "List saved. Your ratings, tiers, and playback status are unchanged.", list };
  } catch { return { ok: false, message: "Saving is unavailable. Your draft has been kept; please try again." }; }
}
export async function deleteList(id: unknown, revision: unknown): Promise<Result> {
  if (!positiveId(id) || !positiveId(revision)) return { ok: false, message: "This list is unavailable." };
  try {
    const owner = await getAccount();
    if (!owner?.profile) return { ok: false, message: "Sign in to your account before deleting lists." };
    const { data, error } = await owner.supabase.from("curated_lists").delete()
      .eq("id", id).eq("profile_id", owner.profile.id).eq("revision", revision).select("id").maybeSingle();
    if (error || !data) return { ok: false, message: "This list changed or could not be deleted. Reload and try again." };
    revalidatePath("/", "layout");
    return { ok: true, message: "List deleted. Its games and ratings are unchanged." };
  } catch { return { ok: false, message: "Deleting is unavailable. The list has been kept." }; }
}
