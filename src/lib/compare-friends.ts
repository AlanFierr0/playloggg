import "server-only";
import { getAccount } from "@/lib/owner";

export async function getCompareFriends(account: Awaited<ReturnType<typeof getAccount>>) {
  if (!account?.profile) return [];
  const ids: number[]=[];
  for(let offset=0;;offset+=500){
    const {data,error}=await account.supabase.from("profile_follows").select("followed_id").eq("follower_id",account.profile.id).order("followed_id").range(offset,offset+499);
    if(error)throw new Error("Friends could not be loaded.");
    ids.push(...data.map(row=>row.followed_id));if(data.length<500)break;
  }
  const {data:blocks,error:blockError}=await account.supabase.from("profile_blocks").select("blocker_id,blocked_id");
  if(blockError)throw new Error("Friend access could not be checked.");
  const excluded=new Set(blocks.map(row=>row.blocker_id===account.profile!.id ? row.blocked_id : row.blocker_id));
  const visible=ids.filter(id=>!excluded.has(id));
  const friends:{handle:string;display_name:string}[]=[];
  for(let offset=0;offset<visible.length;offset+=100){
    const {data,error}=await account.supabase.from("profiles").select("handle,display_name").in("id",visible.slice(offset,offset+100)).eq("is_public",true).eq("is_discoverable",true);
    if(error)throw new Error("Friends could not be loaded.");friends.push(...data);
  }
  return friends.sort((a,b)=>a.display_name.localeCompare(b.display_name));
}
