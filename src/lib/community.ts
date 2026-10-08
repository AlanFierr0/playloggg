import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import {
  tasteRecommendations,
  tasteNeighbors,
} from "@/lib/community-stats";
import { getAccount } from "@/lib/owner";
type CommunityScore={gameId:number;count:number;average:number;deviation:number};
const toScore=(row:{game_id:number;sample_count:number;average:number;deviation:number}):CommunityScore=>({
  gameId:row.game_id,count:row.sample_count,average:row.average,deviation:row.deviation,
});

export const getCommunity = cache(async () => {
  const client=createPublicClient();
  const [scoreResult,trendResult,reviewResult]=await Promise.all([
    client.rpc("community_game_scores").gte("sample_count",5).order("deviation",{ascending:false}).order("sample_count",{ascending:false}).order("game_id").limit(5),
    client.rpc("community_trending_games"),
    client.from("ratings").select("profile_id,game_id,review,updated_at,profiles!ratings_profile_id_fkey!inner(handle,display_name,is_public,is_discoverable)")
      .eq("profiles.is_public",true).eq("profiles.is_discoverable",true).not("review","is",null).order("updated_at",{ascending:false}).limit(6),
  ]);
  if(scoreResult.error||trendResult.error||reviewResult.error)throw new Error("Community results could not be loaded.");
  const ids=[...new Set(reviewResult.data.map(row=>row.profile_id))];
  const {data:profiles,error}=ids.length
    ? await client.from("profiles").select("id").in("id",ids).eq("is_public",true).eq("is_discoverable",true)
    : {data:[],error:null};
  if(error)throw new Error("Discovery consent could not be checked.");
  const eligible=new Set(profiles.map(row=>row.id));
  return {
    controversial:scoreResult.data.map(toScore),
    trending:trendResult.data.map(row=>({gameId:row.game_id,count:row.sample_count})),
    reviews:reviewResult.data.filter(row=>eligible.has(row.profile_id)&&row.review?.trim()),
  };
});

export const getCommunityScores=cache(async (gameIds:number[])=>{
  const scores:CommunityScore[]=[];
  for(let offset=0;offset<gameIds.length;offset+=100){
    const {data,error}=await createPublicClient().rpc("community_game_scores",{p_ids:gameIds.slice(offset,offset+100)}).limit(100);
    if(error)throw new Error("Community score could not be loaded.");
    scores.push(...data.map(toScore));
  }
  return scores;
});
export const getCommunityGameScore=cache(async (gameId:number)=>(await getCommunityScores([gameId]))[0]);

// Recommendations need individual scores; load those only for signed-in taste discovery.
const readDiscoveryRatings=cache(async()=>{
  const client=createPublicClient(),all=[];
  for(let offset=0;;offset+=500){
    const {data,error}=await client.from("ratings").select("profile_id,game_id,score,profiles!ratings_profile_id_fkey!inner(handle,display_name,is_public,is_discoverable)")
      .eq("profiles.is_public",true).eq("profiles.is_discoverable",true).order("profile_id").order("game_id").range(offset,offset+499);
    if(error)throw new Error("Recommendations could not be loaded.");
    all.push(...data);
    if(data.length<500)break;
  }
  const ids=[...new Set(all.map(row=>row.profile_id))],eligible=new Set<number>();
  for(let offset=0;offset<ids.length;offset+=100){
    const {data,error}=await client.from("profiles").select("id").in("id",ids.slice(offset,offset+100)).eq("is_public",true).eq("is_discoverable",true);
    if(error)throw new Error("Discovery consent could not be checked.");
    data.forEach(row=>eligible.add(row.id));
  }
  return all.filter(row=>eligible.has(row.profile_id));
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
  const ratings = await readDiscoveryRatings();
  const { data: blocks, error } = await account.supabase
    .from("profile_blocks")
    .select("blocker_id,blocked_id");
  if (error) throw new Error("Recommendation access could not be checked.");
  const excluded = new Set(
    blocks.map((row) =>
      row.blocker_id === account.profile!.id ? row.blocked_id : row.blocker_id,
    ),
  );
  const eligible = ratings.filter(
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
