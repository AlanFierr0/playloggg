"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAccount } from "@/lib/owner";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";

type DeletionState = {message:string;accountOnly:boolean};
export async function deleteAccount(_previous: DeletionState, form: FormData): Promise<DeletionState> {
  let accountOnly=false;
  let deleted=false;
  try {
    const account=await getAccount();
    if(!account)return {message:"Sign in to delete your own account.",accountOnly:false};
    accountOnly=!account.profile;
    const confirmation=account.profile?.handle ?? "DELETE";
    if(form.get("handle")!==confirmation)return {message:account.profile ? "Type your exact handle to confirm deletion." : "Type DELETE to confirm account deletion.",accountOnly};
    const admin=createAuthAdmin();
    // All identifiers and file paths come from verified Auth and server-owned records.
    const {data:files,error:filesError}=await admin.rpc("account_deletion_objects",{p_owner:account.user.id});
    if(filesError||!files)throw new Error("Storage enumeration failed");
    const buckets=new Map<string,string[]>();
    for(const file of files){const paths=buckets.get(file.bucket_id)??[];paths.push(file.object_name);buckets.set(file.bucket_id,paths);}
    for(const [bucket,paths] of buckets)for(let offset=0;offset<paths.length;offset+=100){
      const {error}=await admin.storage.from(bucket).remove(paths.slice(offset,offset+100));
      if(error)throw new Error("Storage cleanup failed");
    }
    if(account.profile){
      const {data,error}=await admin.rpc("delete_owned_profile",{p_owner:account.user.id,p_handle:account.profile.handle});
      if(error||!data||typeof data!=="object"||Array.isArray(data)||data.id!==account.profile.id)throw new Error("Profile deletion failed");
      accountOnly=true;
    }
    const {error:limitsError}=await admin.rpc("clear_account_operation_limits",{p_owner:account.user.id});
    if(limitsError)throw new Error("Private data cleanup failed");
    // Revoke refresh sessions before hard deletion. An existing JWT never supplies ownership.
    const {data:{session}}=await account.supabase.auth.getSession();
    if(session){
      const {error}=await admin.auth.admin.signOut(session.access_token,"global");
      if(error&&![401,403,404].includes(error.status??0))throw new Error("Session revocation failed");
    }
    const {error:authError}=await admin.auth.admin.deleteUser(account.user.id,false);
    if(authError)throw new Error("Auth deletion failed");
    deleted=true;
    try {await account.supabase.auth.signOut({scope:"local"});} catch { /* Explicit cookie clearing below also handles provider errors. */ }
  } catch {
    if(!deleted)return {message:accountOnly ? "Your profile data is removed, but account deletion is incomplete. Type DELETE and retry, or sign in again if your session expired." : "Your account could not be deleted. Please retry.",accountOnly};
  }
  // Expire every chunk and verifier for this project's session, even if logout failed.
  const store=await cookies();
  const project=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0];
  const prefix=`sb-${project}-auth-token`;
  for(const cookie of store.getAll())if(cookie.name===prefix||cookie.name.startsWith(`${prefix}.`)||cookie.name===`${prefix}-code-verifier`)store.set(cookie.name,"",{path:"/",maxAge:0});
  store.set("playlogg-steam-state","",{path:"/auth/steam",maxAge:0});
  revalidatePath("/","layout");
  redirect("/login?deleted=1");
}
