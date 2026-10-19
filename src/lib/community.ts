import "server-only";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { getAccount } from "@/lib/owner";
import { avatarSource } from "@/lib/avatar-input";
type CommunityScore={gameId:number;count:number;average:number;deviation:number};
const toScore=(row:{game_id:number;sample_count:number;average:number;deviation:number}):CommunityScore=>({
  gameId:row.game_id,count:row.sample_count,average:row.average,deviation:row.deviation,
});

export const getCommunity = cache(async () => {
  const account=await getAccount(), client=account?.supabase??createPublicClient();
  const [scoreResult,trendResult,reviewResult]=await Promise.allSettled([
    createAuthAdmin().rpc("anonymous_game_scores").gte("sample_count",5).order("deviation",{ascending:false}).order("sample_count",{ascending:false}).order("game_id").limit(5),
    client.rpc("community_trending_games"),
    client.rpc("home_reviews",{p_limit:12}),
  ]);
  const scores=scoreResult.status==="fulfilled"&&!scoreResult.value.error ? scoreResult.value.data : null;
  const trends=trendResult.status==="fulfilled"&&!trendResult.value.error ? trendResult.value.data : null;
  const reviews=reviewResult.status==="fulfilled"&&!reviewResult.value.error ? reviewResult.value.data : null;
  return {
    controversial:(scores??[]).map(toScore),
    trending:(trends??[]).map(row=>({gameId:row.game_id,count:row.sample_count})),
    reviews:reviews??[],viewerId:account?.profile?.id??null,
    unavailable:!scores||!trends||!reviews,
  };
});

const readCommunityScores=cache(async (key:string)=>{
  const gameIds=key ? key.split(",").map(Number) : [];
  const scores:CommunityScore[]=[];
  const client=createAuthAdmin();
  for(let offset=0;offset<gameIds.length;offset+=200){
    const batches=[gameIds.slice(offset,offset+100),gameIds.slice(offset+100,offset+200)].filter(batch=>batch.length);
    const results=await Promise.all(batches.map(batch=>client.rpc("anonymous_game_scores",{p_ids:batch}).limit(100)));
    for(const {data,error} of results){
      if(error)throw new Error("Community score could not be loaded.");
      scores.push(...data.map(toScore));
    }
  }
  return scores;
});
export function getCommunityScores(gameIds:number[]){
  return readCommunityScores([...new Set(gameIds)].sort((a,b)=>a-b).join(","));
}

export const getCommunityGameScore=cache(async (gameId:number)=>(await getCommunityScores([gameId]))[0]);

export type TasteDiscovery = {
  neighbors: {profileId:number;shared:number;match:number;handle:string;displayName:string;avatarUrl:string|null}[];
  recommendations: {gameId:number;average:number;count:number;bestMatch:number}[];
};
export const getTasteDiscovery = cache(async ():Promise<TasteDiscovery> => {
  const account=await getAccount();
  if(!account?.profile)return {neighbors:[],recommendations:[]};
  const {data,error}=await account.supabase.rpc("home_taste");
  if(error||!data)throw new Error("Recommendations could not be loaded.");
  const result=data as unknown as TasteDiscovery;
  return {...result,neighbors:result.neighbors.map(profile=>({...profile,avatarUrl:avatarSource(profile.profileId,profile.avatarUrl)}))};
});
