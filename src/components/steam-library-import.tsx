"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useMessages } from "@/components/site-preferences";
import { importSteamGame, previewSteamLibrary, type LibraryPreview } from "@/app/actions/steam-library";
import { parseSteamBrowse, type SteamBrowse } from "@/lib/steam-library-input";
import { parseHours } from "@/lib/rating-input";
import { SteamGameCover } from "@/components/steam-game-cover";

const button = "inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-container text-on-primary-container px-5 py-3 disabled:opacity-50";
export function SteamLibraryImport({configured}:{configured:boolean}) {
  const t = useMessages();
  const [preview,setPreview] = useState<LibraryPreview|null>(null);
  const [selected,setSelected] = useState<number[]>([]);
  const [busy,setBusy] = useState(false);
  const [loading,setLoading] = useState(false);
  const [amount,setAmount] = useState("25");
  const [filters,setFilters] = useState<Omit<SteamBrowse,"offset">>({sort:"title",minHours:null,maxHours:null});
  const [minHours,setMinHours] = useState("");
  const [maxHours,setMaxHours] = useState("");
  const [message,setMessage] = useState("");
  const [progress,setProgress] = useState(0);
  const [failures,setFailures] = useState<{title:string;message:string}[]>([]);
  const active = useRef(false);
  const stopLoading = useRef(false);
  async function load(query=filters,size=amount,append=false) {
    if (active.current) return;
    active.current=true;stopLoading.current=false;setBusy(true);setLoading(true);setMessage("");setFailures([]);
    let current=append ? preview : null;
    const target=size==="all" ? Infinity : (current?.games.length ?? 0)+Number(size);
    if (!append) {setPreview(null);setSelected([]);}
    try {
      do {
        const offset=current?.nextOffset ?? 0;
        const result=await previewSteamLibrary({...query,offset});
        if (!result.ok) {setMessage(result.message);break;}
        const games=new Map([...(current?.games ?? []),...result.games].map(game=>[game.appId,game]));
        current={...result,games:[...games.values()]};
        setPreview(current);setMessage(result.message);
        if (!result.games.length || current.nextOffset>=current.total) break;
      } while(current.games.length<target&&!stopLoading.current);
    } catch {setMessage("Library import is unavailable right now. Please retry.");}
    finally {active.current=false;setBusy(false);setLoading(false);}
  }
  function applyFilters() {
    const query=parseSteamBrowse({offset:0,sort:filters.sort,minHours:parseHours(minHours),maxHours:parseHours(maxHours)});
    if (!query) {setMessage("Use nonnegative hours and a minimum no greater than the maximum.");return;}
    const next={sort:query.sort,minHours:query.minHours,maxHours:query.maxHours};
    setFilters(next);
    if (preview) void load(next);
  }
  async function importSelected() {
    if (active.current || !selected.length) return;
    active.current=true;setBusy(true);setMessage("");setFailures([]);setProgress(0);
    const remaining:number[]=[];
    const failed:{title:string;message:string}[]=[];
    try {
      for (let index=0;index<selected.length;index++) {
        const appId=selected[index];
        let result;
        try {result=await importSteamGame(appId);}
        catch {result={ok:false,message:"Library import is unavailable right now. Please retry."};}
        if (result.ok) setPreview(current=>current ? {...current,games:current.games.map(game=>game.appId===appId ? {...game,logged:true} : game)} : current);
        else {remaining.push(appId);failed.push({title:preview?.games.find(game=>game.appId===appId)?.title ?? String(appId),message:result.message});}
        setProgress(index+1);
      }
      setSelected(remaining);setFailures(failed);
      setMessage(failed.length ? "Some games could not be imported. Your successful imports are saved; retry the remaining games." : "Import complete. Your games are saved in your profile.");
    } finally {active.current=false;setBusy(false);}
  }
  if (!configured) return <p role="status" className="rounded-xl bg-surface-container-low p-6">{t("Steam library import is not configured yet.")}</p>;
  const available=preview?.games.filter(game=>game.matched&&!game.logged) ?? [];
  return <div className="space-y-6">
    <p className="text-body-sm text-on-surface-variant">{t("Steam Game details must be Public, including playtime. Your Playlogg profile visibility does not change.")}</p>
    <div className="flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={()=>load()}>{t(loading ? "Loading…" : preview ? "Refresh library" : "Preview Steam library")}</button><Link href="/profile" className="inline-flex min-h-11 items-center rounded-xl bg-surface-container text-primary px-5 py-3">{t("View profile")}</Link></div>
    <form onSubmit={event=>{event.preventDefault();applyFilters();}} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end rounded-xl bg-surface-container-low p-5">
      <label className="min-w-0 space-y-2"><span className="block">{t("Sort by")}</span><select aria-label={t("Sort by")} disabled={busy} value={filters.sort} onChange={event=>{const next={...filters,sort:event.target.value as SteamBrowse["sort"]};setFilters(next);if(preview)void load(next);}} className="w-full rounded-xl bg-surface-container p-3"><option value="title">{t("Title A–Z")}</option><option value="hours_desc">{t("Most played")}</option><option value="hours_asc">{t("Least played")}</option></select></label>
      <label className="min-w-0 space-y-2"><span className="block">{t("Minimum hours")}</span><input disabled={busy} type="number" min="0" step="any" value={minHours} onChange={event=>setMinHours(event.target.value)} className="w-full rounded-xl bg-surface-container p-3" /></label>
      <label className="min-w-0 space-y-2"><span className="block">{t("Maximum hours")}</span><input disabled={busy} type="number" min="0" step="any" value={maxHours} onChange={event=>setMaxHours(event.target.value)} className="w-full rounded-xl bg-surface-container p-3" /></label>
      <label className="min-w-0 space-y-2"><span className="block">{t("Games to show")}</span><select aria-label={t("Games to show")} disabled={busy} value={amount} onChange={event=>{const size=event.target.value;setAmount(size);if(preview)void load(filters,size);}} className="w-full rounded-xl bg-surface-container p-3">{["25","50","100","all"].map(size=><option key={size} value={size}>{size==="all" ? t("All") : size}</option>)}</select></label>
      <button disabled={busy} className={button}>{t("Apply filters")}</button>
      <button type="button" disabled={busy} onClick={()=>{const next={...filters,minHours:null,maxHours:null};setMinHours("");setMaxHours("");setFilters(next);if(preview)void load(next);}} className="min-h-11 rounded-xl bg-surface-container text-primary px-4">{t("Clear filters")}</button>
    </form>
    <p role="status" aria-live="polite">{t(message)}{loading&&<span className="block">{t("Loading library")}: {preview?.games.length ?? 0} / {preview?.total ?? "—"}</span>}{busy&&!loading&&selected.length>0&&<span className="block">{t("Importing games")}: {progress} / {selected.length}</span>}</p>
    {loading&&<button type="button" onClick={()=>{stopLoading.current=true;}} className="min-h-11 rounded-xl bg-surface-container text-primary px-4">{t("Stop loading")}</button>}
    {!!failures.length&&<ul className="space-y-2 text-on-surface-variant">{failures.map(failure=><li key={failure.title}><span translate="no">{failure.title}</span>: {t(failure.message)}</li>)}</ul>}
    {preview&&preview.total>0&&<>
      <div className="flex flex-wrap items-center justify-between gap-4"><p>{preview.games.length} / {preview.total} {t("Steam games")}</p><div className="flex flex-wrap gap-3"><button className="min-h-11 rounded-xl bg-surface-container text-primary px-4" disabled={busy||!available.length} onClick={()=>setSelected(available.map(game=>game.appId))}>{t("Select available games")}</button><button className="min-h-11 rounded-xl bg-surface-container text-primary px-4" disabled={busy||!selected.length} onClick={()=>setSelected([])}>{t("Clear selection")}</button></div></div>
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{preview.games.map(game=><li key={game.appId} className="min-w-0 rounded-xl bg-surface-container-low p-4"><label className="flex items-start gap-4 cursor-pointer"><input type="checkbox" className="mt-2 shrink-0 accent-primary w-5 h-5" checked={selected.includes(game.appId)} disabled={busy||!game.matched||game.logged} onChange={event=>setSelected(current=>event.target.checked ? [...current,game.appId] : current.filter(id=>id!==game.appId))} aria-label={`${t("Select game")} ${game.title}`} /><SteamGameCover key={`${game.appId}-${game.cover}`} appId={game.appId} cover={game.cover}/><span className="min-w-0 space-y-2"><span translate="no" className="block font-headline-md text-headline-md break-words">{game.title}</span><span className="block text-on-surface-variant">{game.hours} {t("hours")}</span><span className="block text-body-sm text-primary">{t(game.logged ? "Already in your profile" : game.matched ? "Ready to import" : "No exact catalog match")}</span></span></label></li>)}</ul>
      <div className="flex flex-wrap items-center justify-between gap-4"><button className={button} disabled={busy||!selected.length} onClick={importSelected}>{t("Import selected games")} ({selected.length})</button>{preview.nextOffset<preview.total&&<button type="button" className="min-h-11 rounded-xl bg-surface-container text-primary px-5 py-3" disabled={busy} onClick={()=>load(filters,amount,true)}>{t("Load more")}</button>}</div>
    </>}
  </div>;
}
