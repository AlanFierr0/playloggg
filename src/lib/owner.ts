import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { eligibleAccount } from "@/lib/account-identity";

export function isOwnerEmail(email: string | undefined) {
  const allowed = process.env.PLAYLOGG_OWNER_EMAIL?.trim().toLowerCase();
  return Boolean(allowed && email?.trim().toLowerCase() === allowed);
}

// Verify identity with Auth, then resolve ownership from the database, never metadata.
export const getAccount = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || !eligibleAccount(user)) return null;
  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("id,handle,display_name,is_public,avatar_url,bio,location,platform_preference")
    .eq("owner_user_id", user.id).maybeSingle();
  if (profileError) throw new Error("Your profile could not be loaded.");
  return { supabase, user, profile };
});

// Catalog administration stays restricted to the original email owner.
export const getOwner = cache(async () => {
  const account = await getAccount();
  return account && isOwnerEmail(account.user.email) ? account : null;
});
