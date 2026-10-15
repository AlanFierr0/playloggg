import "server-only";
import { createHash } from "node:crypto";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";
import type { Json } from "@/types/database";

const inFlight=new Map<string,Promise<Json>>();
export function cachedSteamAchievementRead(key:string,ownerId:string|null,seconds:900|86400,load:()=>Promise<Json>,refresh=false):Promise<Json> {
  const hash=createHash("sha256").update(JSON.stringify([ownerId,key])).digest("hex");
  const requestKey=hash+(refresh?":refresh":"");
  const previous=inFlight.get(requestKey);if(previous)return previous;
  const request=read();inFlight.set(requestKey,request);
  void request.then(()=>inFlight.delete(requestKey),()=>inFlight.delete(requestKey));
  return request;
  async function read(){
    let admin:ReturnType<typeof createAuthAdmin>|undefined;
    try {
      admin=createAuthAdmin();
      if(!refresh){const cached=await admin.rpc("read_steam_achievement_cache",{p_key:hash,p_owner:ownerId});if(!cached.error&&cached.data!==null)return cached.data;}
    } catch { /* Cache outages must not prevent Steam reads. */ }
    const data=await load();
    try {await admin?.rpc("store_steam_achievement_cache",{p_key:hash,p_owner:ownerId,p_data:data,p_seconds:seconds});} catch { /* Valid provider results remain usable if storage is unavailable. */ }
    return data;
  }
}
