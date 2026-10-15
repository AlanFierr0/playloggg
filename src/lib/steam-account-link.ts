import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "../types/database";

export async function findSteamAccount(admin: SupabaseClient<Database>, steamId: string) {
  const { data, error } = await admin.from("steam_accounts").select("user_id").eq("steam_id", steamId).maybeSingle();
  if (error) throw new Error("Steam account lookup failed");
  return data?.user_id;
}
export async function linkSteamAccount(admin: SupabaseClient<Database>, steamId: string, user: User) {
  if (user.app_metadata.playlogg_steam_id && user.app_metadata.playlogg_steam_id !== steamId) throw new Error("steam-linked");
  // Unique database keys arbitrate concurrent claims; neither identity can be reassigned.
  const { error } = await admin.from("steam_accounts").upsert({ steam_id: steamId, user_id: user.id }, { onConflict: "steam_id", ignoreDuplicates: true });
  if (error) throw new Error(error.code === "23505" ? "steam-linked" : "Steam account reservation failed");
  if (await findSteamAccount(admin, steamId) !== user.id) throw new Error("steam-linked");
  const updated = await admin.auth.admin.updateUserById(user.id, { app_metadata: { ...user.app_metadata, playlogg_steam_id: steamId } });
  if (updated.error) throw new Error("Steam account update failed");
}
