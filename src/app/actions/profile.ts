"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAccount } from "@/lib/owner";
import { validSteamId, profileNames } from "@/lib/steam-openid";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";

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
