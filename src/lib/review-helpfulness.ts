import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getAccount } from "@/lib/owner";
import type { ReviewHelpfulnessData } from "@/types/domain";

export const getReviewHelpfulness = cache(async (profileId: number): Promise<ReviewHelpfulnessData> => {
  const account = await getAccount();
  const client = account?.supabase ?? await createClient();
  const reviews: ReviewHelpfulnessData["reviews"] = {};
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.rpc("review_helpfulness", { p_profile_id: profileId }).order("game_slug").range(offset, offset + 499);
    if (error) throw new Error("Review votes could not be loaded.");
    for (const row of data) reviews[row.game_slug] = { upvotes: row.upvotes, downvotes: row.downvotes, vote: row.viewer_vote };
    if (data.length < 500) break;
  }
  return {
    signedIn: Boolean(account?.profile),
    canVote: Boolean(account?.profile && account.profile.id !== profileId),
    reviews,
  };
});
