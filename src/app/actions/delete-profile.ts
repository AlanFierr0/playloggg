"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAccount } from "@/lib/owner";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";
import { avatarPath } from "@/lib/avatar-input";

export async function deleteProfile(_previous: {message:string}, form: FormData) {
  try {
    const account=await getAccount();
    if(!account?.profile)return {message:"Sign in to manage your own profile."};
    if(form.get("handle")!==account.profile.handle)return {message:"Type your exact handle to confirm deletion."};
    const admin=createAuthAdmin();
    // The privileged RPC is unavailable to browser roles; never accept a submitted owner ID.
    const {data,error}=await admin.rpc("delete_owned_profile",{p_owner:account.user.id,p_handle:account.profile.handle});
    if(error || !data || typeof data!=="object" || Array.isArray(data) || data.id!==account.profile.id)return {message:"Your profile could not be deleted. Please retry."};
    // Storage cleanup follows the committed deletion. The old picture becomes inaccessible
    // immediately because avatar reads recheck the profile; never use a browser-supplied path.
    if(avatarPath(data.avatar) && data.avatar.startsWith(`${account.profile.id}/`)) {
      try {await admin.storage.from("profile-pictures").remove([data.avatar]);} catch { /* Profile deletion is already committed. */ }
    }
  } catch {return {message:"Your profile could not be deleted. Please retry."};}
  revalidatePath("/","layout");
  redirect("/signup");
}
