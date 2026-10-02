"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePortfolio } from "@/components/portfolio-provider";
import { useMessages } from "@/components/site-preferences";
import { parseHours } from "@/lib/rating-input";
import { updateBulkRatings } from "@/app/actions/bulk-ratings";
import type { PlaybackStatus, PlayedPlatform } from "@/types/domain";
import { playedPlatformLabels as platforms } from "@/lib/played-platforms";

const control="min-h-11 w-full rounded-xl bg-surface-container p-3";
const statuses={completed:"Completed",playing:"In Progress",backlog:"Backlog",shelved:"Shelved"};
export function ManageGames() {
  const { games, access }=usePortfolio(),t=useMessages(),router=useRouter();
  const [query,setQuery]=useState(""),[platformFilter,setPlatformFilter]=useState(""),[minimum,setMinimum]=useState(""),[maximum,setMaximum]=useState("");
  const [selected,setSelected]=useState<string[]>([]),[status,setStatus]=useState("keep"),[platform,setPlatform]=useState("keep"),[message,setMessage]=useState("");
  const [pending,startTransition]=useTransition();
  const [limit,setLimit]=useState(25);
  if (!access?.canEdit) return null;
  const minHours=parseHours(minimum),maxHours=parseHours(maximum);
  const validBounds=minHours!==undefined&&maxHours!==undefined&&(minHours===null||maxHours===null||minHours<=maxHours);
  const filtered=validBounds ? games.filter(game=>game.logged&&game.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())&&(!platformFilter||(platformFilter==="unset" ? !game.platform : game.platform===platformFilter))&&(!minimum||(game.hoursPlayed!=null&&game.hoursPlayed>=Number(minimum)))&&(!maximum||(game.hoursPlayed!=null&&game.hoursPlayed<=Number(maximum)))) : [];
  function resetSelection(){setSelected([]);setLimit(25);}
  function save(){startTransition(async()=>{
    try {
      const result=await updateBulkRatings({slugs:selected,...(status!=="keep" ? {status:status==="unset" ? null : status as PlaybackStatus} : {}),...(platform!=="keep" ? {platform:platform==="unset" ? null : platform as PlayedPlatform} : {})});
      setMessage(`${t(result.message)}${result.ok ? ` (${result.count})` : ""}`);
      if(result.ok){setSelected([]);router.refresh();}
    } catch {setMessage(t("Games could not be updated. Please retry."));}
  });}
  return <details className="rounded-xl bg-surface-container-low p-5 sm:p-8 mb-8">
    <summary className="cursor-pointer font-headline-md text-headline-md text-primary">{t("Manage your games")}</summary>
    <div className="mt-6 space-y-5">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label>{t("Search your games")}<input className={control} value={query} onChange={e=>{setQuery(e.target.value);resetSelection();}}/></label>
        <label>{t("Platform")}<select className={control} value={platformFilter} onChange={e=>{setPlatformFilter(e.target.value);resetSelection();}}><option value="">{t("All platforms")}</option><option value="unset">{t("Unassigned")}</option>{Object.entries(platforms).map(([id,label])=><option key={id} value={id}>{t(label)}</option>)}</select></label>
        <label>{t("Minimum hours")}<input className={control} type="number" min="0" step="any" value={minimum} onChange={e=>{setMinimum(e.target.value);resetSelection();}}/></label>
        <label>{t("Maximum hours")}<input className={control} type="number" min="0" step="any" value={maximum} onChange={e=>{setMaximum(e.target.value);resetSelection();}}/></label>
      </div>
      {!validBounds&&<p role="alert">{t("Use nonnegative hours and a minimum no greater than the maximum.")}</p>}
      <p role="status" aria-live="polite">{filtered.length} {t("Logged games")} · {selected.length} {t("Selected games")}</p>
      <div className="flex flex-wrap gap-3"><button disabled={pending} onClick={()=>setSelected(filtered.slice(0,Math.min(limit,100)).map(game=>game.slug))} className="min-h-11 rounded-xl bg-surface-container px-4 text-primary">{t("Select visible games")}</button><button disabled={pending} onClick={()=>setSelected([])} className="min-h-11 rounded-xl bg-surface-container px-4 text-primary">{t("Clear selection")}</button></div>
      <ul className="grid sm:grid-cols-2 gap-3">{filtered.slice(0,limit).map(game=><li key={game.slug} className="flex items-center gap-3 rounded-xl bg-surface-container p-3"><label className="flex items-center gap-3 min-w-0 flex-1"><input type="checkbox" disabled={pending||(!selected.includes(game.slug)&&selected.length>=100)} checked={selected.includes(game.slug)} onChange={e=>setSelected(current=>e.target.checked?[...current,game.slug]:current.filter(slug=>slug!==game.slug))} className="w-5 h-5 accent-primary shrink-0"/><span translate="no" className="min-w-0 break-words">{game.title}<span className="block text-body-sm text-on-surface-variant">{game.hoursPlayed ?? "—"} {t("hours")} · {game.platform ? t(platforms[game.platform]) : t("Unassigned")}</span></span></label><Link href={`/log?game=${game.slug}`} aria-label={`${t("Edit log entry")} ${game.title}`} className="text-primary min-h-11 inline-flex items-center px-2">{t("Edit")}</Link></li>)}</ul>
      {filtered.length>limit&&<button disabled={pending} onClick={()=>setLimit(current=>current+25)} className="min-h-11 rounded-xl bg-surface-container text-primary px-4">{t("Load more")}</button>}
      <fieldset disabled={pending} className="grid sm:grid-cols-[1fr_1fr_auto] gap-4 items-end"><legend className="mb-3 font-headline-md">{t("Edit selected games")}</legend>
        <label>{t("Status")}<select className={control} value={status} onChange={e=>setStatus(e.target.value)}><option value="keep">{t("Keep unchanged")}</option><option value="unset">{t("Unassigned")}</option>{Object.entries(statuses).map(([id,label])=><option key={id} value={id}>{t(label)}</option>)}</select></label>
        <label>{t("Platform")}<select className={control} value={platform} onChange={e=>setPlatform(e.target.value)}><option value="keep">{t("Keep unchanged")}</option><option value="unset">{t("Unassigned")}</option>{Object.entries(platforms).map(([id,label])=><option key={id} value={id}>{t(label)}</option>)}</select></label>
        <button onClick={save} disabled={!selected.length||(status==="keep"&&platform==="keep")} className="min-h-11 rounded-xl bg-primary-container text-on-primary-container px-5 py-3 disabled:opacity-50">{t(pending ? "Saving…" : "Update selected games")}</button>
      </fieldset><p role="status" aria-live="polite">{message}</p>
    </div>
  </details>;
}
