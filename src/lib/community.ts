import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import {
  communityStats,
  tasteRecommendations,
  tasteNeighbors,
} from "@/lib/community-stats";
import { getAccount } from "@/lib/owner";
export const getCommunity = cache(async () => {
  const client = createPublicClient();
  const { data: participants, error: participantError } = await client
    .from("profiles")
    .select("id")
    .eq("is_public", true)
    .eq("is_discoverable", true)
    .limit(1);
  if (participantError)
    throw new Error("Discovery consent could not be checked.");
  if (!participants.length)
    return {
      scores: [],
      controversial: [],
      trending: [],
      ratings: [],
      reviews: [],
      lists: [],
    };
  const ratings = [];
  const events = [];
  const lists = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client
      .from("ratings")
      .select(
        "profile_id,game_id,score,review,updated_at,profiles!inner(handle,display_name,is_public,is_discoverable)",
      )
      .eq("profiles.is_public", true)
      .eq("profiles.is_discoverable", true)
      .order("profile_id")
      .order("game_id")
      .range(offset, offset + 499);
    if (error) throw new Error("Community ratings could not be loaded.");
    ratings.push(...data);
    if (data.length < 500) break;
  }
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client
      .from("profile_activity")
      .select("profile_id,game_id,occurred_at,score_changed")
      .eq("score_changed", true)
      .gte("occurred_at", new Date(Date.now() - 30 * 86400000).toISOString())
      .order("id")
      .range(offset, offset + 499);
    if (error) throw new Error("Community activity could not be loaded.");
    events.push(...data);
    if (data.length < 500) break;
  }
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await client
      .from("curated_lists")
      .select(
        "id,name,description,profile_id,profiles!inner(handle,display_name,is_public,is_discoverable),curated_list_items(game_id,position)",
      )
      .eq("is_public", true)
      .eq("profiles.is_public", true)
      .eq("profiles.is_discoverable", true)
      .order("id")
      .range(offset, offset + 99);
    if (error) throw new Error("Community lists could not be loaded.");
    lists.push(...data);
    if (data.length < 100) break;
  }
  const { data: likeRows, error: likesError } = await client.rpc(
    "public_list_like_counts",
  );
  if (likesError)
    throw new Error("Public list popularity could not be loaded.");
  const likes = new Map(likeRows.map((row) => [row.list_id, row.likes]));
  // Recheck consent after reading data; anonymous RLS also protects every underlying read.
  const eligible = new Set<number>();
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client
      .from("profiles")
      .select("id")
      .eq("is_public", true)
      .eq("is_discoverable", true)
      .order("id")
      .range(offset, offset + 499);
    if (error) throw new Error("Discovery consent could not be checked.");
    data.forEach((row) => eligible.add(row.id));
    if (data.length < 500) break;
  }
  const publicLists = new Set<number>();
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client
      .from("curated_lists")
      .select("id")
      .eq("is_public", true)
      .order("id")
      .range(offset, offset + 499);
    if (error) throw new Error("List visibility could not be checked.");
    data.forEach((row) => publicLists.add(row.id));
    if (data.length < 500) break;
  }
  const visible = ratings.filter((row) => eligible.has(row.profile_id));
  const stats = communityStats(
    visible,
    events.filter((row) => eligible.has(row.profile_id)),
  );
  return {
    ...stats,
    ratings: visible,
    reviews: visible
      .filter((row) => row.review?.trim())
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, 6),
    lists: lists
      .filter((row) => eligible.has(row.profile_id) && publicLists.has(row.id))
      .map((row) => ({ ...row, likes: likes.get(row.id) ?? 0 }))
      .sort((a, b) => b.likes - a.likes || b.id - a.id),
  };
});
export const getTasteDiscovery = cache(async () => {
  const account = await getAccount();
  if (!account?.profile) return { recommendations: [], neighbors: [] };
  const own = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await account.supabase
      .from("ratings")
      .select("profile_id,game_id,score")
      .eq("profile_id", account.profile.id)
      .order("game_id")
      .range(offset, offset + 499);
    if (error) throw new Error("Recommendations could not be loaded.");
    own.push(...data);
    if (data.length < 500) break;
  }
  const community = await getCommunity();
  const { data: blocks, error } = await account.supabase
    .from("profile_blocks")
    .select("blocker_id,blocked_id");
  if (error) throw new Error("Recommendation access could not be checked.");
  const excluded = new Set(
    blocks.map((row) =>
      row.blocker_id === account.profile!.id ? row.blocked_id : row.blocker_id,
    ),
  );
  const eligible = community.ratings.filter(
    (row) => !excluded.has(row.profile_id),
  );
  const neighbors = tasteNeighbors(own, eligible, account.profile.id).flatMap(
    (neighbor) => {
      const profile = eligible.find(
        (row) => row.profile_id === neighbor.profileId,
      )?.profiles;
      return profile
        ? [
            {
              ...neighbor,
              handle: profile.handle,
              displayName: profile.display_name,
            },
          ]
        : [];
    },
  );
  return {
    recommendations: tasteRecommendations(own, eligible, account.profile.id),
    neighbors,
  };
});
export async function getTasteRecommendations() {
  return (await getTasteDiscovery()).recommendations;
}
