"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useMessages } from "@/components/site-preferences";
import { importSteamGame, previewSteamLibrary, type LibraryPreview } from "@/app/actions/steam-library";

const button = "inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-container text-on-primary-container px-5 py-3 disabled:opacity-50";
export function SteamLibraryImport({configured}:{configured:boolean}) {
  const t = useMessages();
  const [preview,setPreview] = useState<LibraryPreview|null>(null);
  const [selected,setSelected] = useState<number[]>([]);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [progress,setProgress] = useState(0);
  const [failures,setFailures] = useState<{title:string;message:string}[]>([]);
  const active = useRef(false);
  async function load(page:number) {
    if (active.current) return;
    active.current=true;setBusy(true);setMessage("");setFailures([]);
    try {
      const result=await previewSteamLibrary(page);
      if (result.ok) {setPreview(result);setSelected([]);}
      setMessage(result.message);
    } catch {setMessage("Library import is unavailable right now. Please retry.");}
    finally {active.current=false;setBusy(false);}
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
    <div className="flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={()=>load(preview?.page ?? 1)}>{t(busy ? "Loading…" : preview ? "Refresh library" : "Preview Steam library")}</button><Link href="/profile" className="inline-flex min-h-11 items-center rounded-xl bg-surface-container text-primary px-5 py-3">{t("View profile")}</Link></div>
    <p role="status" aria-live="polite">{t(message)}{busy&&selected.length>0&&<span className="block">{t("Importing games")}: {progress} / {selected.length}</span>}</p>
    {!!failures.length&&<ul className="space-y-2 text-on-surface-variant">{failures.map(failure=><li key={failure.title}><span translate="no">{failure.title}</span>: {t(failure.message)}</li>)}</ul>}
    {preview&&preview.total>0&&<>
      <div className="flex flex-wrap items-center justify-between gap-4"><p>{preview.total} {t("Steam games")} · {t("Page")} {preview.page} / {Math.ceil(preview.total/25)}</p><div className="flex flex-wrap gap-3"><button className="min-h-11 rounded-xl bg-surface-container text-primary px-4" disabled={busy||!available.length} onClick={()=>setSelected(available.map(game=>game.appId))}>{t("Select available games")}</button><button className="min-h-11 rounded-xl bg-surface-container text-primary px-4" disabled={busy||!selected.length} onClick={()=>setSelected([])}>{t("Clear selection")}</button></div></div>
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{preview.games.map(game=><li key={game.appId} className="min-w-0 rounded-xl bg-surface-container-low p-4"><label className="flex items-start gap-4 cursor-pointer"><input type="checkbox" className="mt-2 shrink-0 accent-primary w-5 h-5" checked={selected.includes(game.appId)} disabled={busy||!game.matched||game.logged} onChange={event=>setSelected(current=>event.target.checked ? [...current,game.appId] : current.filter(id=>id!==game.appId))} aria-label={`${t("Select game")} ${game.title}`} />{game.cover&&<img src={game.cover} alt="" className="w-12 aspect-[3/4] object-cover rounded shrink-0" loading="lazy"/>}<span className="min-w-0 space-y-2"><span translate="no" className="block font-headline-md text-headline-md break-words">{game.title}</span><span className="block text-on-surface-variant">{game.hours} {t("hours")}</span><span className="block text-body-sm text-primary">{t(game.logged ? "Already in your profile" : game.matched ? "Ready to import" : "No exact catalog match")}</span></span></label></li>)}</ul>
      <div className="flex flex-wrap items-center justify-between gap-4"><button className={button} disabled={busy||!selected.length} onClick={importSelected}>{t("Import selected games")} ({selected.length})</button><nav aria-label={t("Steam library pages")} className="flex gap-3">{preview.page>1&&<button className="min-h-11 rounded-xl bg-surface-container text-primary px-4" disabled={busy} onClick={()=>load(preview.page-1)}>{t("Previous")}</button>}{preview.page*25<preview.total&&<button className="min-h-11 rounded-xl bg-surface-container text-primary px-4" disabled={busy} onClick={()=>load(preview.page+1)}>{t("Next")}</button>}</nav></div>
    </>}
  </div>;
}
