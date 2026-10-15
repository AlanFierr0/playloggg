import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { avatarSource } from "@/lib/avatar-input";
export function profileSearch(value: string) {
  return value.normalize("NFKC").trim().replace(/^@/, "").replace(/[^\p{L}\p{N}_ .-]/gu, "").slice(0, 80);
}
export async function discoverProfiles(limit = 24, offset = 0, query = "", excludedIds: number[] = []) {
  const client = createPublicClient();
  let request = client
    .from("profiles")
    .select("id,handle,display_name,avatar_url,bio,is_discoverable")
    .eq("is_public", true);
  const search = profileSearch(query).replace(/_/g, "\\_");
  if (search) request = request.or(`handle.ilike.%${search}%,display_name.ilike.%${search}%`);
  else request = request.eq("is_discoverable", true);
  const excluded = excludedIds.filter(id => Number.isSafeInteger(id) && id > 0);
  if (excluded.length) request = request.not("id", "in", `(${excluded.join(",")})`);
  const { data, error } = await request.order("handle").range(offset, offset + limit - 1);
  if (error) throw new Error("Profile discovery could not be loaded.");
  return data.map((profile) => ({
    ...profile,
    avatar_url: avatarSource(profile.id, profile.avatar_url),
  }));
}
