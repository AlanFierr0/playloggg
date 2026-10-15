"use server";
import { revalidatePath } from "next/cache";
import { getAccount } from "@/lib/owner";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";
import { parseTierRanges } from "@/lib/tier-ranges";
import { tiers } from "@/lib/portfolio-view";

export async function updateGameTier(slug: unknown, tier: unknown, automatic = false) {
  if (typeof automatic !== "boolean" || typeof slug !== "string" || slug.length > 200 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || (tier !== null && !tiers.includes(tier as typeof tiers[number]))) {
    return {ok:false,message:"Choose a valid game and tier."};
  }
  try {
    const account=await getAccount();
    if(!account?.profile)return {ok:false,message:"Sign in to edit your games."};
    const {data:game,error:gameError}=await account.supabase.from("games").select("id").eq("slug",slug).single();
    if(gameError||!game)throw new Error("Unavailable game");
    // Only an existing entry belonging to verified Auth can change; never upsert a log.
    const {data,error}=await account.supabase.from("ratings").update({tier:tier as typeof tiers[number]|null,tier_manual:!automatic,updated_at:new Date().toISOString()})
      .eq("profile_id",account.profile.id).eq("game_id",game.id).select("game_id");
    if(error||data?.length!==1)throw new Error("Tier update failed");
    revalidatePath("/","layout");
    return {ok:true,message:"Tier saved."};
  } catch {return {ok:false,message:"Tier could not be saved. Your game stayed in its previous tier. Please retry."};}
}

export async function saveTierRanges(input: unknown) {
  const ranges = parseTierRanges(input);
  if (!ranges) return {ok:false,message:"Use non-overlapping whole-number ranges from 0 to 100."};
  try {
    const account = await getAccount();
    if (!account?.profile) return {ok:false,message:"Sign in to edit your games."};
    const {data,error} = await createAuthAdmin().from("profiles").update({tier_ranges:ranges,updated_at:new Date().toISOString()})
      .eq("id",account.profile.id).eq("owner_user_id",account.user.id).select("id");
    if (error || data?.length !== 1) throw new Error("Range update failed");
    revalidatePath("/","layout");
    return {ok:true,message:"Score ranges saved. Manual tiers were kept."};
  } catch { return {ok:false,message:"Score ranges could not be saved. Please retry."}; }
}
