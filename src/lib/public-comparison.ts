import "server-only";
import { avatarSource } from "@/lib/avatar-input";
import { createPublicClient } from "@/lib/supabase/public";
import { publicProfilePath } from "@/lib/profile-settings";
import { readFavorites } from "@/lib/favorites";
import { getCatalog } from "@/lib/portfolio";
import { getAccount } from "@/lib/owner";
import type { Database } from "@/types/database";
import type { Game, Profile } from "@/types/domain";

type Entry = Pick<Database["public"]["Tables"]["ratings"]["Row"], "game_id" | "score" | "tier" | "status">;
export async function getPublicComparison(left: string, right: string) {
  return readComparison(left, right, null);
}

export async function getOwnerComparison(right: string) {
  const account = await getAccount();
  if (!account?.profile) return null;
  return readComparison(account.profile.handle, right, account);
}

async function readComparison(left: string, right: string, account: Awaited<ReturnType<typeof getAccount>>) {
  if (!publicProfilePath(left) || !publicProfilePath(right) || left === right) return null;
  const supabase = createPublicClient();
  async function read(handle: string) {
    const owned = Boolean(account?.profile && handle === account.profile.handle);
    const client = owned && account ? account.supabase : supabase;
    let request = client.from("profiles").select("id,handle,display_name,is_public,avatar_url").eq("handle",handle);
    request = owned && account ? request.eq("owner_user_id",account.user.id) : request.eq("is_public",true);
    const { data: profile, error } = await request.maybeSingle();
    if (error) throw new Error("Comparison could not be loaded.");
    if (!profile) return null;
    const entries: Entry[] = [];
    for (let offset=0;;offset+=500) {
      const { data, error } = await client.from("ratings").select("game_id,score,tier,status")
        .eq("profile_id",profile.id).order("game_id").range(offset,offset+499);
      if (error) throw new Error("Comparison entries could not be loaded.");
      entries.push(...data);
      if (data.length < 500) break;
    }
    const favorites=await readFavorites(client,profile.id);
    return { profile, entries, favorites, client, owned };
  }
  const [a,b] = await Promise.all([read(left),read(right)]);
  if (!a || !b) return null;
  const rows = await getCatalog();
  // Recheck both profiles after all paginated reads, even for signed-in visitors.
  const current = await Promise.all([a,b].map(async side => {
    let request = side.client.from("profiles").select("id").eq("id",side.profile.id).eq("handle",side.profile.handle);
    request = side.owned && account ? request.eq("owner_user_id",account.user.id) : request.eq("is_public",true);
    const { data,error } = await request.maybeSingle();
    if (error) throw new Error("Comparison could not be loaded.");
    return data;
  }));
  if (current.some(profile => !profile)) return null;
  function portfolio(side: NonNullable<typeof a>) {
    const entries = new Map(side.entries.map(entry => [entry.game_id,entry]));
    const games: Game[] = rows.filter(row => entries.has(row.id) || side.favorites.some(favorite=>favorite.slug===row.slug)).map(row => {
      const entry = entries.get(row.id)!;
      return { slug:row.slug,title:row.title,cover:row.cover_url,year:row.release_year,keywords:"",score:entry?.score ?? null,tier:entry?.tier as Game["tier"],status:entry?.status as Game["status"],genres:row.genres,developers:Array.isArray((row.igdb_metadata as {developers?:unknown})?.developers) ? (row.igdb_metadata as {developers:string[]}).developers : [],logged:Boolean(entry) };
    });
    const profile: Profile = {id:String(side.profile.id),handle:side.profile.handle,displayName:side.profile.display_name,avatarUrl:avatarSource(side.profile.id,side.profile.avatar_url),isSample:false,isPublic:side.profile.is_public};
    return {profile,games,favorites:side.favorites};
  }
  return {left:portfolio(a),right:portfolio(b)};
}
