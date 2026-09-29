import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export function isOwnerEmail(email: string | undefined) {
  const allowed = process.env.PLAYLOGG_OWNER_EMAIL?.trim().toLowerCase();
  return Boolean(allowed && email?.trim().toLowerCase() === allowed);
}

// Verify identity with Auth, then resolve ownership from the database, never metadata.
export const getOwner = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || !isOwnerEmail(user.email)) return null;
  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("id,handle,display_name,is_sample,is_public")
    .eq("owner_user_id", user.id).eq("is_sample", false).maybeSingle();
  if (profileError) throw new Error("Your profile could not be loaded.");
  return { supabase, user, profile };
});
