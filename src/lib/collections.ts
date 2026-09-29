import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CuratedListSummary } from "@/types/domain";

export async function getLists(profileId: number): Promise<CuratedListSummary[]> {
  const supabase = await createClient();
  const lists: CuratedListSummary[] = [];
  // Read every page instead of silently dropping lists at the Data API row limit.
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await supabase.from("curated_lists").select("id,name,revision")
      .eq("profile_id", profileId).order("id").range(offset, offset + 99);
    if (error) throw new Error("Your curated lists could not be loaded.");
    lists.push(...data);
    if (data.length < 100) return lists;
  }
}
export async function getList(profileId: number, id: number) {
  const supabase = await createClient();
  const { data: list, error } = await supabase.from("curated_lists").select("id,name,revision")
    .eq("profile_id", profileId).eq("id", id).maybeSingle();
  if (error) throw new Error("This list could not be loaded.");
  if (!list) return null;
  const { data: items, error: itemError } = await supabase.from("curated_list_items")
    .select("game_id,position").eq("list_id", id).order("position").limit(500);
  if (itemError) throw new Error("This list's games could not be loaded.");
  return { ...list, gameIds: items.map((item) => item.game_id) };
}
