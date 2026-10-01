import "server-only";
import { avatarSource } from "@/lib/avatar-input";
import { createPublicClient } from "@/lib/supabase/public";
import { publicProfilePath } from "@/lib/profile-settings";
import { getCatalog } from "@/lib/portfolio";
import type { Database } from "@/types/database";
import type { Game, Profile } from "@/types/domain";

type Entry = Pick<Database["public"]["Tables"]["ratings"]["Row"], "game_id" | "score" | "tier" | "status">;
export async function getPublicComparison(left: string, right: string) {
  if (!publicProfilePath(left) || !publicProfilePath(right) || left === right) return null;
  const supabase = createPublicClient();
  async function read(handle: string) {
    const { data: profile, error } = await supabase.from("profiles").select("id,handle,display_name,is_sample,is_public,avatar_url")
      .eq("handle",handle).eq("is_public",true).eq("is_sample",false).maybeSingle();
    if (error) throw new Error("Comparison could not be loaded.");
    if (!profile) return null;
    const entries: Entry[] = [];
    for (let offset=0;;offset+=500) {
      const { data, error } = await supabase.from("ratings").select("game_id,score,tier,status")
        .eq("profile_id",profile.id).order("game_id").range(offset,offset+499);
      if (error) throw new Error("Comparison entries could not be loaded.");
      entries.push(...data);
      if (data.length < 500) break;
    }
    return { profile, entries };
  }
  const [a,b] = await Promise.all([read(left),read(right)]);
  if (!a || !b) return null;
  const rows = await getCatalog();
  // Recheck both profiles after all paginated reads, even for signed-in visitors.
  const current = await Promise.all([a,b].map(async side => {
    const { data,error } = await supabase.from("profiles").select("id").eq("id",side.profile.id).eq("handle",side.profile.handle).eq("is_public",true).eq("is_sample",false).maybeSingle();
    if (error) throw new Error("Comparison could not be loaded.");
    return data;
  }));
  if (current.some(profile => !profile)) return null;
  function portfolio(side: NonNullable<typeof a>) {
    const entries = new Map(side.entries.map(entry => [entry.game_id,entry]));
    const games: Game[] = rows.filter(row => entries.has(row.id)).map(row => {
      const entry = entries.get(row.id)!;
      return { slug:row.slug,title:row.title,cover:row.cover_url,year:row.release_year,keywords:"",score:entry.score,tier:entry.tier as Game["tier"],status:entry.status as Game["status"],logged:true };
    });
    const profile: Profile = {id:String(side.profile.id),handle:side.profile.handle,displayName:side.profile.display_name,avatarUrl:avatarSource(side.profile.id,side.profile.avatar_url),isSample:false,isPublic:true};
    return {profile,games};
  }
  return {left:portfolio(a),right:portfolio(b)};
}
