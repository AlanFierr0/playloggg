"use client";
import { useEffect, useState } from "react";
import { getGamePlayStyle } from "@/app/actions/play-style";
import { playbackGroups, playbackLabels, statusPlayStyle, type PlayStyle } from "@/lib/playback-status";
import { usePortfolio } from "@/components/portfolio-provider";
import { useMessages } from "@/components/site-preferences";
import type { PlaybackStatus } from "@/types/domain";

export function PlaybackStatusPicker({slug,value,onChange}:{slug:string;value:PlaybackStatus|null;onChange:(value:PlaybackStatus|null)=>void}) {
  const t=useMessages();
  const {profile}=usePortfolio();
  const storageKey=`playlogg-play-style:${profile.id}:${slug}`;
  const [notice,setNotice]=useState("");
  const [chosen,setChosen]=useState<PlayStyle|null>(null);
  const [detected,setDetected]=useState<PlayStyle|null>(null);
  useEffect(()=>{
    let ignore=false;
    queueMicrotask(()=>{
      if(ignore)return;
      try{const saved=localStorage.getItem(storageKey);if(saved==="campaign"||saved==="ongoing")setChosen(saved);}catch{}
    });
    getGamePlayStyle(slug).then(style=>{if(!ignore)setDetected(style);}).catch(()=>{});
    return ()=>{ignore=true;};
  },[slug,storageKey]);
  const style=chosen??statusPlayStyle(value)??detected??"campaign";
  const choices=playbackGroups[style];
  // Keep an existing saved status visible when the user switches groups.
  const visible=value&&!choices.includes(value)?[...choices,value]:choices;
  return <div id="status-group" role="group" aria-label={t("Playback status")} className="min-w-0 space-y-3">
    <label className="flex flex-wrap items-center justify-between gap-2 text-body-sm"><span>{t("Game type")}</span><select aria-label={t("Game type")} value={style} onChange={event=>{
      const next=event.target.value as PlayStyle;setChosen(next);setNotice("");
      // shortcut: this view preference is browser-local; add account storage if cross-device overrides are needed.
      try{localStorage.setItem(storageKey,next);}catch{setNotice("Game type preference could not be saved in this browser.");}
    }} className="min-h-11 max-w-full rounded-xl border border-outline-variant bg-surface-container px-3 text-on-surface"><option value="campaign">{t("Campaign")}</option><option value="ongoing">{t("Ongoing online")}</option></select></label>
    <div className="flex items-center justify-between gap-2"><span>{t("Playback status")}</span><button id="clear-status" type="button" onClick={()=>onChange(null)} className="min-h-11 text-body-sm text-on-surface-variant">{t(value?"Clear status":"Not set")}</button></div>
    <div data-playback-options className="flex w-full min-w-0 flex-wrap gap-2">{visible.map(status=><button key={status} type="button" aria-pressed={value===status} onClick={()=>onChange(value===status?null:status)} className={`status-btn min-h-11 shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-xs sm:text-sm leading-snug focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${value===status?"bg-primary-container text-on-primary-container font-semibold":"bg-surface-container text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"}`}>{t(playbackLabels[status])}</button>)}</div>
    {notice&&<p role="status" className="text-body-sm text-on-surface-variant">{t(notice)}</p>}
  </div>;
}
