"use server";
import { getAccount } from "@/lib/owner";
import { getReviewHelpfulness } from "@/lib/review-helpfulness";
import { getCatalogGame } from "@/lib/portfolio";
import type { ReviewHelpfulnessData } from "@/types/domain";

export type ReviewVoteState = { message: string; counts?: ReviewHelpfulnessData["reviews"][string] };
export async function reviewVote(_previous: ReviewVoteState, form: FormData): Promise<ReviewVoteState> {
  const target = Number(form.get("profile"));
  const slug = String(form.get("slug") ?? "");
  const raw = form.get("vote");
  if (!Number.isSafeInteger(target) || target < 1 || !["-1", "0", "1"].includes(String(raw))) return { counts: _previous?.counts, message: "Invalid action." };
  try {
    const account = await getAccount();
    if (!account?.profile) return { counts: _previous?.counts, message: "Sign in to vote on reviews." };
    if (account.profile.id === target) return { counts: _previous?.counts, message: "You cannot vote on your own review." };
    const game = await getCatalogGame(slug);
    if (!game) return { counts: _previous?.counts, message: "This review is unavailable." };
    const value = Number(raw);
    const { error } = value === 0
      ? await account.supabase.from("review_votes").delete().eq("reviewer_profile_id", target).eq("game_id", game.id).eq("voter_profile_id", account.profile.id)
      : await account.supabase.from("review_votes").upsert({ reviewer_profile_id: target, game_id: game.id, voter_profile_id: account.profile.id, value }, { onConflict: "reviewer_profile_id,game_id,voter_profile_id" });
    if (error) return { counts: _previous?.counts, message: "Your vote could not be saved. Please retry." };
    const data = await getReviewHelpfulness(target);
    const counts = data.reviews[slug];
    return counts ? { message: "Vote saved.", counts } : { message: "This review is unavailable." };
  } catch {
    return { counts: _previous?.counts, message: "Your vote could not be saved. Please retry." };
  }
}
