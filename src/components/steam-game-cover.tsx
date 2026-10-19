"use client";
import { coverImage } from "@/lib/cover-image";
import {useState} from "react";

export function SteamGameCover({appId,cover}:{appId:number;cover:string|null}) {
  const [failed,setFailed] = useState<string[]>([]);
  const sources = [cover,`https://shared.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`,`https://shared.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`].filter((url):url is string=>Boolean(url));
  const src=sources.find(url=>!failed.includes(url));
  return <span className="w-12 aspect-[3/4] shrink-0 rounded overflow-hidden bg-surface-container flex items-center justify-center text-primary" aria-hidden="true">
    {src ? <img {...coverImage(src, "48px")} decoding="async" width={90} height={128} alt="" loading="lazy" className="w-full h-full object-cover" onError={()=>setFailed(current=>[...current,src])}/> : <span className="material-symbols-outlined">sports_esports</span>}
  </span>;
}
