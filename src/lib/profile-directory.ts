import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { avatarSource } from "@/lib/avatar-input";
export async function discoverProfiles(limit = 24, offset = 0) {
  const client = createPublicClient();
  const { data, error } = await client
    .from("profiles")
    .select("id,handle,display_name,avatar_url,bio")
    .eq("is_public", true)
    .eq("is_discoverable", true)
    .order("handle")
    .range(offset, offset + limit - 1);
  if (error) throw new Error("Profile discovery could not be loaded.");
  return data.map((profile) => ({
    ...profile,
    avatar_url: avatarSource(profile.id, profile.avatar_url),
  }));
}
