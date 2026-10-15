"use server";
import {getAccount} from "@/lib/owner";
import {getCatalogGame} from "@/lib/portfolio";
import {revalidatePath} from "next/cache";
export async function removeRating(slug:unknown,expectedUpdatedAt:unknown):Promise<{ok:boolean;message:string}>{
 if(typeof slug!=="string"||!/^[a-z0-9][a-z0-9-]{0,199}$/.test(slug)||typeof expectedUpdatedAt!=="string"||!/^\d{4}-\d{2}-\d{2}T/.test(expectedUpdatedAt)||!Number.isFinite(Date.parse(expectedUpdatedAt)))return {ok:false,message:"Invalid action."};
 try{
  const account=await getAccount();
  if(!account?.profile)return {ok:false,message:"Sign in to your account before saving."};
  const game=await getCatalogGame(slug);
  if(!game)return {ok:false,message:"This game is unavailable. Your draft has been kept."};
  const {data,error}=await account.supabase.rpc("remove_rating",{p_game_id:game.id,p_expected_updated_at:expectedUpdatedAt});
  if(error)return {ok:false,message:error.code==="40001"?"This entry changed in another tab. Reload the latest entry before removing it.":"The log could not be removed. Your entry and draft have been kept."};
  if(!data)return {ok:false,message:"This entry is no longer available. Reload your profile."};
  revalidatePath("/","layout");
  return {ok:true,message:"Log removed. Favorites are unchanged."};
 }catch{return {ok:false,message:"The log could not be removed. Your entry and draft have been kept."};}
}
