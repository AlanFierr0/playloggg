"use server";
import { getAccount } from "@/lib/owner";
import { getCatalogGame } from "@/lib/portfolio";
import { queryIgdb } from "@/lib/igdb";
import { igdbId } from "@/lib/catalog-input";
import { recentRead } from "@/lib/recent-read";
import { checkOperationLimit } from "@/lib/operation-limits";
import { classifyPlayStyle, type PlayStyle } from "@/lib/playback-status";

// Shared public metadata only; failures leave the user's choice available.
const styles=recentRead(async(key:string)=>{
  const records=await queryIgdb(`fields id,game_modes.name,keywords.name,genres.name; where id = ${Number(key)}; limit 1;`);
  const record=records[0];
  return records.length===1&&record&&typeof record==="object"&&"id" in record&&record.id===Number(key)?classifyPlayStyle(record):null;
},86_400_000,1000);
export async function getGamePlayStyle(slug:unknown):Promise<PlayStyle|null> {
  if(typeof slug!=="string"||!/^[a-z0-9][a-z0-9-]{0,199}$/.test(slug))return null;
  try {
    const account=await getAccount();
    if(!account?.profile)return null;
    const game=await getCatalogGame(slug);
    if(!game)return null;
    const {data:entry}=await account.supabase.from("ratings").select("play_style").eq("profile_id",account.profile.id).eq("game_id",game.id).maybeSingle();
    if(entry?.play_style==="campaign"||entry?.play_style==="ongoing")return entry.play_style;
    const metadata=game.igdb_metadata&&typeof game.igdb_metadata==="object"&&!Array.isArray(game.igdb_metadata)?game.igdb_metadata:{};
    const known=classifyPlayStyle({...metadata,genres:game.genres});
    if(known)return known;
    if(!igdbId(game.igdb_id))return null;
    await checkOperationLimit(account.user.id,"metadata");
    return await styles(String(game.igdb_id));
  }catch{return null;}
}
