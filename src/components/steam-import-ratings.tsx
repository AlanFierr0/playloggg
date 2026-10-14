"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMessages } from "@/components/site-preferences";
import { TierBadge, ScoreStars } from "@/components/rating-controls";
import { SteamGameCover } from "@/components/steam-game-cover";
import { getSteamReviewSummary, saveSteamImportRating, type SteamReviewSummary, type LibraryRow, type ImportedSteamRating } from "@/app/actions/steam-library";
import { playbackLabels } from "@/lib/playback-status";
import type { Tier, PlaybackStatus } from "@/types/domain";

const button = "min-h-11 rounded-xl bg-primary-container text-on-primary-container px-5 py-3 disabled:opacity-50";
export type SteamRatingGame = LibraryRow & ImportedSteamRating;
export type SteamRatingDraft = { score: string; tier: Tier|null; status: PlaybackStatus|null };
export const emptySteamRatingDraft: SteamRatingDraft = {score:"",tier:null,status:null};
export function readSteamRatingSession(raw: string) {
  const value = JSON.parse(raw);
  if (!value || !Array.isArray(value.games) || !value.games.length || value.games.length>10000 || !Number.isInteger(value.index) || value.index<0 || value.index>value.games.length || !Number.isInteger(value.target) || value.target<value.games.length || !Number.isInteger(value.progress) || !Number.isInteger(value.total) || value.progress<0 || value.total<value.progress) return null;
  if (!value.games.every((game: SteamRatingGame)=>game && Number.isSafeInteger(game.appId) && game.appId>0 && typeof game.slug==="string" && typeof game.title==="string" && Number.isFinite(game.hours) && game.hours>=0 && (game.cover===null || typeof game.cover==="string") && (game.updatedAt===null || typeof game.updatedAt==="string"))) return null;
  const draft = value.draft;
  if (!draft || typeof draft.score!=="string" || !/^\d{0,3}$/.test(draft.score) || Number(draft.score)>100 || (draft.tier!==null && !["S","A","B","C","D","F"].includes(draft.tier)) || (draft.status!==null && !Object.hasOwn(playbackLabels,draft.status))) return null;
  return value as {games:SteamRatingGame[];index:number;target:number;progress:number;total:number;draft:SteamRatingDraft};
}

export function SteamRatingEditor({ game, draft, onDraft, onNext }: { game: SteamRatingGame; draft: SteamRatingDraft; onDraft: (draft: SteamRatingDraft) => void; onNext: () => void }) {
  const t = useMessages();
  const {score,tier,status} = draft;
  const setScore = (score:string)=>onDraft({...draft,score});
  const setTier = (tier:Tier|null)=>onDraft({...draft,tier});
  const setStatus = (status:PlaybackStatus|null)=>onDraft({...draft,status});
  const [saving,setSaving] = useState(false);
  const [message,setMessage] = useState("");
  const [reviews,setReviews] = useState<{summary:SteamReviewSummary|null}|null>(null);
  useEffect(()=>{
    let ignore=false;
    getSteamReviewSummary(game.appId).then(summary=>{if(!ignore)setReviews({summary});}).catch(()=>{if(!ignore)setReviews({summary:null});});
    return ()=>{ignore=true;};
  },[game.appId]);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(()=>{heading.current?.focus();},[]);
  async function save() {
    setSaving(true);setMessage("");
    try {
      const result = await saveSteamImportRating({slug:game.slug,score:score==="" ? null : Number(score),tier,tierManual:tier!==null,status,review:"",tags:[],platform:null,hoursPlayed:null,completedOn:null},game.updatedAt);
      if (result.ok) onNext(); else setMessage(result.message);
    } catch { setMessage("Your rating could not be saved. Please retry or skip this game."); }
    finally { setSaving(false); }
  }
  return <div className="mt-5 min-w-0 space-y-6">
    <div className="flex items-center gap-3"><SteamGameCover appId={game.appId} cover={game.cover}/><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 ref={heading} tabIndex={-1} translate="no" className="outline-none font-headline-lg text-headline-lg break-words min-w-0">{game.title}</h3><Link href={`/game/${encodeURIComponent(game.slug)}`} target="_blank" rel="noopener noreferrer" prefetch={false} className="inline-flex shrink-0 min-h-11 items-center gap-2 rounded-xl border border-outline-variant px-2 sm:px-4 py-2 text-body-sm text-primary hover:bg-surface-container-highest">{t("Game info")}<span aria-hidden="true" className="material-symbols-outlined text-[18px]">open_in_new</span><span className="sr-only">{t("Opens in a new tab")}</span></Link></div><p className="text-on-surface-variant">PC / Steam · {game.hours} {t("hours")}</p></div></div>
    <div className="space-y-3">
      <div role="status" className="rounded-xl bg-surface-container p-3 text-body-sm">
        <p className="text-on-surface-variant">{t("Steam overall reviews")}</p>
        {!reviews ? <p>{t("Loading Steam reviews…")}</p> : reviews.summary ? <><a href={`https://store.steampowered.com/app/${game.appId}/#app_reviews_hash`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline underline-offset-4">{t(reviews.summary.description)}<span aria-hidden="true" className="material-symbols-outlined text-[16px]">open_in_new</span><span className="sr-only">{t("Opens in a new tab")}</span></a>{reviews.summary.total>0&&<p className="text-on-surface-variant">{Math.round(reviews.summary.positive/reviews.summary.total*100)}% {t("positive")} · {reviews.summary.total.toLocaleString()} {t("reviews")} · {t("All languages")}</p>}</> : <p>{t("Steam reviews unavailable")}</p>}
      </div>
    </div>
    <fieldset disabled={saving} className="min-w-0 space-y-5 disabled:opacity-60">
      <div className="flex items-center justify-between gap-3"><span>{t("Tier")}</span><TierBadge value={tier} onChange={setTier}/></div>
      <div className="space-y-3"><label className="block text-center">{t("Score")}<span className="flex justify-center items-baseline gap-2"><input aria-label={t("Score")} inputMode="numeric" maxLength={3} style={{fontSize:"clamp(2rem, 6vw, 3rem)"}} value={score} placeholder="—" onChange={event=>{const value=event.target.value;if(/^\d{0,3}$/.test(value)&&(value===""||Number(value)<=100))setScore(value);}} className="w-[3ch] min-h-14 border-0 bg-transparent text-center font-display-lg text-display-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded"/><span className="text-on-surface-variant">/100</span></span></label>{score!=="" && <ScoreStars score={Number(score)}/>}<input type="range" aria-label={t("Numerical score from 0 to 100")} min={0} max={100} step={1} value={Number(score)} onChange={event=>setScore(event.target.value)} className="score-slider w-full"/>{score!=="" && <button type="button" className="block mx-auto min-h-11 text-primary" onClick={()=>setScore("")}>{t("Remove score")}</button>}</div>
      <div role="group" aria-label={t("Playback status")} className="space-y-2">
        <div className="flex items-center justify-between gap-2"><span>{t("Playback status")}</span>{!status&&<span className="text-body-sm text-on-surface-variant">{t("Not set")}</span>}</div>
        <div className="flex w-full min-w-0 flex-wrap gap-2">{Object.entries(playbackLabels).map(([value,label])=><button key={value} type="button" aria-pressed={status===value} onClick={()=>setStatus(status===value ? null : value as PlaybackStatus)} className={`min-h-11 shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-xs sm:text-sm leading-snug focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${status===value ? "bg-primary-container text-on-primary-container font-semibold" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"}`}>{t(label)}</button>)}</div>
      </div>
    </fieldset>
    {message && <p role="alert" className="text-error">{t(message)}</p>}
    <div className="flex flex-wrap justify-between gap-3"><button disabled={saving} className="min-h-11 text-primary px-3 disabled:opacity-50" onClick={onNext}>{t("Skip this game")}</button><button disabled={saving} className={button} onClick={save}>{t(saving ? "Saving…" : "Save and next")}</button></div>
  </div>;
}
