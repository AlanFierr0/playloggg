import "server-only";
import {cache} from "react";
import {getCatalogGame} from "@/lib/portfolio";
import {getAccount} from "@/lib/owner";
import {createClient} from "@/lib/supabase/server";
import {avatarSource} from "@/lib/avatar-input";
export const getGameReviews=cache(async(slug:string,offset=0)=>{
 const game=await getCatalogGame(slug);
 if(!game)return null;
 const account=await getAccount(),client=account?.supabase??await createClient();
 const {data,error}=await client.rpc("game_reviews",{p_game_id:game.id,p_offset:offset});
 if(error)throw new Error("Community reviews could not be loaded.");
 return {reviews:data.slice(0,24).map(row=>({...row,avatar_url:avatarSource(row.profile_id,row.avatar_url)})),hasMore:data.length>24&&offset+24<=10000,viewerId:account?.profile?.id??null};
});
export type GameReviewPage=NonNullable<Awaited<ReturnType<typeof getGameReviews>>>;
