"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAccount } from "@/lib/owner";
import { validSteamId, profileNames } from "@/lib/steam-openid";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";
import { profileSettings } from "@/lib/profile-settings";

export async function updateProfile(_previous: { message: string }, form: FormData) {
  const input = profileSettings(form);
  if (!input) return { message: "Check your profile settings. Handles need 3–30 lowercase letters, numbers or underscores; display names need 1–80 characters." };
  try {
    const account = await getAccount();
    if (!account?.profile) return { message: "Sign in to edit your own profile." };
    // Public roles cannot update profiles. Whitelist fields and fix ownership from Auth.
    const { data, error } = await createAuthAdmin().from("profiles")
      .update({ ...input.values, updated_at: new Date().toISOString() })
      .eq("id", account.profile.id).eq("owner_user_id", account.user.id).eq("is_sample", false)
      .select("handle,is_public").maybeSingle();
    if (error || !data) return { message: error?.code === "23505" ? "That handle is taken. Choose another one." : "Your profile could not be updated. Please retry." };
    revalidatePath("/", "layout");
    return { message: input.setting === "names" ? "Profile names saved." : data.is_public ? "Your profile and curated lists are now public." : "Your profile and curated lists are now private." };
  } catch { return { message: "Saving is unavailable. Your draft has been kept; please retry." }; }
}

export async function createProfile(_previous: { message: string }, form: FormData) {
  const names = profileNames({ handle: form.get("handle"), displayName: form.get("displayName") });
  if (!names) return { message: "Use a handle of 3–30 lowercase letters, numbers or underscores, and a display name of 1–80 characters." };
  try {
    const account = await getAccount();
    if (!account || !validSteamId(account.user.app_metadata.playlogg_steam_id)) return { message: "Sign in with Steam before creating your profile." };
    if (!account.profile) {
      const admin = createAuthAdmin();
      const { error } = await admin.from("profiles").insert({ ...names, owner_user_id: account.user.id, is_sample: false, is_public: false });
      if (error) {
        // A concurrent submission may already have created this user's one profile.
        const { data: existing } = await account.supabase.from("profiles").select("id").eq("owner_user_id", account.user.id).maybeSingle();
        if (!existing) return { message: error.code === "23505" ? "That handle is taken. Choose another one." : "Your profile could not be created. Please retry." };
      }
    }
  } catch { return { message: "Profile setup is unavailable. Please retry." }; }
  revalidatePath("/", "layout");
  redirect("/profile");
}
