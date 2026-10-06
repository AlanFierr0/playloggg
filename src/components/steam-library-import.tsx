"use client";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import Link from "next/link";
import { useMessages } from "@/components/site-preferences";
import { importSteamGame, previewSteamLibrary, syncSteamPlaytime, type LibraryPreview } from "@/app/actions/steam-library";
import { parseSteamBrowse, type SteamBrowse } from "@/lib/steam-library-input";
import { parseHours } from "@/lib/rating-input";
import { SteamRatingPicker, SteamRatingEditor, type SteamRatingGame } from "@/components/steam-import-ratings";
import { SteamGameCover } from "@/components/steam-game-cover";

const button = "inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-container text-on-primary-container px-5 py-3 disabled:opacity-50";
export function SteamLibraryImport({configured}:{configured:boolean}) {
  const t = useMessages();
  const [preview,setPreview] = useState<LibraryPreview|null>(null);
  const [selected,setSelected] = useState<number[]>([]);
  const [busy,setBusy] = useState(configured);
  const [loading,setLoading] = useState(configured);
  const [syncing,setSyncing] = useState(false);
  const [importing,setImporting] = useState(false);
  const [importTitle,setImportTitle] = useState("");
  const [amount,setAmount] = useState("all");
  const [filters,setFilters] = useState<Omit<SteamBrowse,"offset">>({sort:"title",minHours:null,maxHours:null});
  const [minHours,setMinHours] = useState("");
  const [maxHours,setMaxHours] = useState("");
  const [message,setMessage] = useState("");
  const [progress,setProgress] = useState(0);
  const [failures,setFailures] = useState<{appId:number;title:string;message:string}[]>([]);
  const [summary,setSummary]=useState<{imported:number;skipped:number;failed:number}|null>(null);
  const [importTotal,setImportTotal]=useState(0);
  const [choice,setChoice] = useState<"ask"|"some"|null>(null);
  const [ratingSession,setRatingSession] = useState(false);
  const [ratingGames,setRatingGames] = useState<SteamRatingGame[]>([]);
  const [ratingIndex,setRatingIndex] = useState(0);
  const [ratingTarget,setRatingTarget] = useState(0);
  const modalOpen = choice !== null || importing || ratingSession;
  const active = useRef(false);
  const importDialog = useRef<HTMLDialogElement>(null);
  const stopLoading = useRef(false);
  const hasPreview = useRef(false);
  const revision = useRef(0);
  const filterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingLoad = useRef<{query:Omit<SteamBrowse,"offset">;size:string}|null>(null);
  useEffect(()=>()=>{if(filterTimer.current)clearTimeout(filterTimer.current);revision.current++;pendingLoad.current=null;},[]);
  useEffect(()=>{
    const dialog=importDialog.current;
    if(!modalOpen || !dialog)return;
    const overflow=document.body.style.overflow;
    dialog.showModal();document.body.style.overflow="hidden";
    return ()=>{dialog.close();document.body.style.overflow=overflow;};
  },[modalOpen]);
  const loadOnOpen = useEffectEvent(()=>{void load(filters,amount,false,true);});
  useEffect(()=>{if(configured)loadOnOpen();},[configured]);
  async function load(query=filters,size=amount,append=false,refresh=false) {
    if (active.current) {if(!append)pendingLoad.current={query,size};return;}
    hasPreview.current=true;
    const requestRevision=revision.current;
    active.current=true;stopLoading.current=false;setBusy(true);setLoading(true);setMessage("");setFailures([]);
    let current=append ? preview : null;
    const target=size==="all" ? Infinity : (current?.games.length ?? 0)+Number(size);
    if (!append) {setPreview(null);setSelected([]);}
    try {
      do {
        const offset=current?.nextOffset ?? 0;
        const result=await previewSteamLibrary({...query,offset,refresh:refresh && offset===0});
        if(requestRevision!==revision.current)break;
        if (!result.ok) {setMessage(result.message);break;}
        hasPreview.current=true;
        const games=new Map([...(current?.games ?? []),...result.games].map(game=>[game.appId,game]));
        current={...result,games:[...games.values()]};
        setPreview(current);setMessage(result.message);
        if (!result.games.length || current.nextOffset>=current.total) break;
      } while(current.games.length<target&&!stopLoading.current);
    } catch {if(requestRevision===revision.current)setMessage("Library import is unavailable right now. Please retry.");}
    finally {
      active.current=false;setBusy(false);setLoading(false);
      const next=pendingLoad.current;pendingLoad.current=null;
      if(next)void load(next.query,next.size);
    }
  }
  function updateFilters(min=minHours,max=maxHours,sort=filters.sort,size=amount,delay=350) {
    revision.current++;stopLoading.current=true;pendingLoad.current=null;
    setSelected([]);
    if(filterTimer.current)clearTimeout(filterTimer.current);
    const query=parseSteamBrowse({offset:0,sort,minHours:parseHours(min),maxHours:parseHours(max)});
    if (!query) {setMessage("Use nonnegative hours and a minimum no greater than the maximum.");return;}
    const next={sort:query.sort,minHours:query.minHours,maxHours:query.maxHours};
    setFilters(next);setMessage("");
    if(hasPreview.current)filterTimer.current=setTimeout(()=>{filterTimer.current=null;void load(next,size);},delay);
  }
  async function importSelected(retry=false,rateIds:number[]=[]) {
    const ids=retry ? failures.map(failure=>failure.appId) : selected;
    const wanted=new Set(rateIds);
    const queue=[...ids.filter(id=>wanted.has(id)),...ids.filter(id=>!wanted.has(id))];
    if (active.current || !queue.length) return;
    setChoice(null);setRatingSession(rateIds.length>0);setRatingGames([]);setRatingIndex(0);setRatingTarget(rateIds.length);
    setSelected(queue);
    active.current=true;setBusy(true);setImporting(true);setMessage("");setFailures([]);setSummary(null);setImportTotal(queue.length);setProgress(0);
    const remaining:number[]=[];
    const failed:{appId:number;title:string;message:string}[]=[];
    let imported=0,skipped=0;
    try {
      for (let index=0;index<queue.length;index++) {
        const appId=queue[index];
        setImportTitle(preview?.games.find(game=>game.appId===appId)?.title ?? "");
        let result;
        try {result=await importSteamGame(appId);}
        catch {result={ok:false,message:"Library import is unavailable right now. Please retry."};}
        if(result.ok){
          if(result.skipped)skipped++;else imported++;
          const row=preview?.games.find(game=>game.appId===appId);
          if(wanted.has(appId)&&result.rating&&row)setRatingGames(current=>[...current,{...row,...result.rating!}]);
        }
        if (result.ok) setPreview(current=>current ? {...current,games:current.games.filter(game=>game.appId!==appId),total:Math.max(0,current.total-1),nextOffset:Math.max(0,current.nextOffset-1),syncAppIds:[...new Set([...current.syncAppIds,appId])]} : current);
        else {remaining.push(appId);failed.push({appId,title:preview?.games.find(game=>game.appId===appId)?.title ?? String(appId),message:result.message});}
        setProgress(index+1);
      }
      setSelected(remaining);setFailures(failed);setSummary({imported,skipped,failed:failed.length});
      setMessage(failed.length ? "Some games could not be imported. Your successful imports are saved; retry the remaining games." : "Import complete. Your games are saved in your profile.");
    } finally {active.current=false;setBusy(false);setImporting(false);setImportTitle("");}
  }
  async function syncPlaytime() {
    if(active.current || !preview?.syncAppIds.length)return;
    active.current=true;setBusy(true);setSyncing(true);setMessage("");setFailures([]);
    let updated=0;
    try {
      for(let offset=0;offset<preview.syncAppIds.length;offset+=25) {
        const result=await syncSteamPlaytime(preview.syncAppIds.slice(offset,offset+25));
        updated+=result.updated;
        if(!result.ok){setMessage(`${t(result.message)} ${t("Updated games")}: ${updated}`);return;}
      }
      setMessage(`${t("Playtime synced. Other entry details were kept unchanged.")} ${t("Updated games")}: ${updated}`);
    } catch {setMessage(`${t("Some playtimes could not be synced. Retry to update the remaining games.")} ${t("Updated games")}: ${updated}`);}
    finally {active.current=false;setBusy(false);setSyncing(false);}
  }
  if (!configured) return <p role="status" className="rounded-xl bg-surface-container-low p-6">{t("Steam library import is not configured yet.")}</p>;
  const available=preview?.games.filter(game=>game.matched&&!game.logged) ?? [];
  return <div className="space-y-6">
    <p className="text-body-sm text-on-surface-variant">{t("Steam Game details must be Public, including playtime. Your Playlogg profile visibility does not change.")}</p>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={()=>load(filters,amount,false,true)}>{t(loading ? "Loading…" : "Refresh library")}</button><button className={button} disabled={busy||!preview?.syncAppIds.length} onClick={syncPlaytime}>{t(syncing ? "Syncing playtime…" : "Sync Steam playtime")}</button><Link href="/profile" className="inline-flex min-h-11 items-center rounded-xl bg-surface-container text-primary px-5 py-3">{t("View profile")}</Link></div><button className={`${button} ml-auto`} disabled={busy||!selected.length} onClick={()=>setChoice("ask")}>{t("Import selected games")} ({selected.length})</button></div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end rounded-xl bg-surface-container-low p-5">
      <label className="min-w-0 space-y-2"><span className="block">{t("Sort by")}</span><select aria-label={t("Sort by")} disabled={busy&&!loading} value={filters.sort} onChange={event=>updateFilters(minHours,maxHours,event.target.value as SteamBrowse["sort"],amount,0)} className="w-full rounded-xl bg-surface-container p-3"><option value="title">{t("Title A–Z")}</option><option value="hours_desc">{t("Most played")}</option><option value="hours_asc">{t("Least played")}</option></select></label>
      <label className="min-w-0 space-y-2"><span className="block">{t("Minimum hours")}</span><input disabled={busy&&!loading} type="number" min="0" step="any" value={minHours} onChange={event=>{setMinHours(event.target.value);updateFilters(event.target.value,maxHours);}} className="w-full rounded-xl bg-surface-container p-3" /></label>
      <label className="min-w-0 space-y-2"><span className="block">{t("Maximum hours")}</span><input disabled={busy&&!loading} type="number" min="0" step="any" value={maxHours} onChange={event=>{setMaxHours(event.target.value);updateFilters(minHours,event.target.value);}} className="w-full rounded-xl bg-surface-container p-3" /></label>
      <label className="min-w-0 space-y-2"><span className="block">{t("Games to show")}</span><select aria-label={t("Games to show")} disabled={busy&&!loading} value={amount} onChange={event=>{const size=event.target.value;setAmount(size);updateFilters(minHours,maxHours,filters.sort,size,0);}} className="w-full rounded-xl bg-surface-container p-3">{["25","50","100","all"].map(size=><option key={size} value={size}>{size==="all" ? t("All") : size}</option>)}</select></label>
      <button type="button" disabled={busy&&!loading} onClick={()=>{setMinHours("");setMaxHours("");updateFilters("","",filters.sort,amount,0);}} className="min-h-11 rounded-xl bg-surface-container text-primary px-4">{t("Clear filters")}</button>
    </div>
    <p role="status" aria-live="polite">{t(message)}{loading&&<span className="flex items-center gap-2"><span aria-hidden="true" className="w-5 h-5 rounded-full border-2 border-primary/25 border-t-primary motion-safe:animate-spin"/>{t("Loading library")}: {preview?.games.length ?? 0} / {preview?.total ?? "—"}</span>}</p>
    <dialog ref={importDialog} tabIndex={-1} aria-labelledby="steam-import-title" onCancel={event=>{if(importing||ratingSession)event.preventDefault();else setChoice(null);}} className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-lg max-h-[calc(100dvh_-_2rem)] overflow-y-auto rounded-2xl bg-surface-container-high text-on-surface p-6 sm:p-8 shadow-2xl border border-primary/20 backdrop:bg-black/65 backdrop:backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {importing&&<span aria-hidden="true" className="h-6 w-6 shrink-0 rounded-full border-[3px] border-primary/25 border-t-primary motion-safe:animate-spin"/>}
        <h2 id="steam-import-title" className="font-headline-md text-headline-md">{t(choice ? "How would you like to rate your games?" : ratingSession ? "Rate imported games" : "Importing games")}</h2>
      </div>
      {choice==="ask"&&<div className="mt-5 space-y-4"><p>{t("Import every selected game, then choose how many you want to rate.")}</p><div className="grid gap-3"><button className={button} onClick={()=>importSelected(false,selected)}>{t("Rate all games")}</button><button className={button} onClick={()=>setChoice("some")}>{t("Rate some games")}</button><button className={button} onClick={()=>importSelected()}>{t("Just import")}</button></div><button className="min-h-11 text-primary px-3" onClick={()=>setChoice(null)}>{t("Cancel")}</button></div>}
      {choice==="some"&&<SteamRatingPicker games={preview?.games.filter(game=>selected.includes(game.appId))??[]} onBack={()=>setChoice("ask")} onStart={ids=>importSelected(false,ids)}/>}
      {!choice&&<><div role="status" aria-live="polite" className="mt-6 space-y-5">
        <div><p className="text-body-sm text-on-surface-variant">{t(importing ? "Processing now" : "Import complete")}</p>{importing&&<p translate="no" className="mt-1 font-headline-md break-words">{importTitle}</p>}</div>
        <div className="grid grid-cols-2 gap-4"><div><p className="text-body-sm text-on-surface-variant">{t("Games processed")}</p><p className="mt-1 text-2xl text-primary tabular-nums">{progress} / {importTotal}</p></div><div><p className="text-body-sm text-on-surface-variant">{t("Games remaining")}</p><p className="mt-1 text-2xl text-primary tabular-nums">{Math.max(0,importTotal-progress)}</p></div></div>
      </div>
      <div role="progressbar" aria-label={t("Importing games")} aria-valuemin={0} aria-valuemax={importTotal} aria-valuenow={progress} className="mt-4 h-2 overflow-hidden rounded-full bg-surface-container-highest"><div className="h-full rounded-full bg-primary motion-safe:transition-[width]" style={{width:`${importTotal ? progress/importTotal*100 : 0}%`}}/></div>
      {ratingSession&&<><p className="mt-4 text-body-sm text-on-surface-variant">{t("Games reviewed")}: {ratingIndex} / {ratingTarget}. {t("Only successful new imports are shown here.")}</p>{ratingGames[ratingIndex] ? <SteamRatingEditor key={ratingGames[ratingIndex].slug} game={ratingGames[ratingIndex]} onNext={()=>setRatingIndex(current=>current+1)}/> : importing ? <p role="status" className="mt-5">{t("Waiting for the next imported game…")}</p> : <div className="mt-5 space-y-4"><p>{t("Your imports and rating session are complete.")}</p><button className={button} onClick={()=>setRatingSession(false)}>{t("Done")}</button></div>}{importing&&<p className="mt-4 text-body-sm text-on-surface-variant">{t("Import continues while you rate. Keep this page open until it finishes.")}</p>}</>}
      </>}
    </dialog>
    {loading&&<button type="button" onClick={()=>{stopLoading.current=true;}} className="min-h-11 rounded-xl bg-surface-container text-primary px-4">{t("Stop loading")}</button>}
    {summary&&<p role="status">{t("Imported")}: {summary.imported} · {t("Skipped")}: {summary.skipped} · {t("Failed")}: {summary.failed}</p>}
    {!!failures.length&&<button disabled={busy} onClick={()=>importSelected(true)} className={button}>{t("Retry failed games")}</button>}
    {!!failures.length&&<ul className="space-y-2 text-on-surface-variant">{failures.map(failure=><li key={failure.appId}><span translate="no">{failure.title}</span>: {t(failure.message)}</li>)}</ul>}
    {preview&&(amount!=="all"||!loading)&&preview.total>0&&<>
      <div className="flex flex-wrap items-center justify-between gap-4"><p>{preview.games.length} / {preview.total} {t("Steam games")}</p><div className="flex flex-wrap gap-3"><button className="min-h-11 rounded-xl bg-surface-container text-primary px-4" disabled={busy||!available.length} onClick={()=>setSelected(available.map(game=>game.appId))}>{t("Select available games")}</button><button className="min-h-11 rounded-xl bg-surface-container text-primary px-4" disabled={busy||!selected.length} onClick={()=>setSelected([])}>{t("Clear selection")}</button></div></div>
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{preview.games.map(game=><li key={game.appId} className="min-w-0 rounded-xl bg-surface-container-low p-4"><label className="flex items-start gap-4 cursor-pointer"><input type="checkbox" className="mt-2 shrink-0 accent-primary w-5 h-5" checked={selected.includes(game.appId)} disabled={busy||!game.matched||game.logged} onChange={event=>setSelected(current=>event.target.checked ? [...current,game.appId] : current.filter(id=>id!==game.appId))} aria-label={`${t("Select game")} ${game.title}`} /><SteamGameCover key={`${game.appId}-${game.cover}`} appId={game.appId} cover={game.cover}/><span className="min-w-0 space-y-2"><span translate="no" className="block font-headline-md text-headline-md break-words">{game.title}</span><span className="block text-on-surface-variant">{game.hours} {t("hours")}</span><span className="block text-body-sm text-primary">{t(game.logged ? "Already in your profile" : game.matched ? "Ready to import" : "No exact catalog match")}</span></span></label>{!game.matched&&<Link href={`/search?${new URLSearchParams({q:game.title,from:"/profile/import/steam"})}`} className="mt-3 min-h-11 inline-flex items-center text-primary">{t("Find this game manually")}</Link>}</li>)}</ul>
      {preview.nextOffset<preview.total&&<div className="flex justify-end"><button type="button" className="min-h-11 rounded-xl bg-surface-container text-primary px-5 py-3" disabled={busy} onClick={()=>load(filters,amount,true)}>{t("Load more")}</button></div>}
    </>}
  </div>;
}
