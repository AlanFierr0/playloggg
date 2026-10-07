"use client";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import Link from "next/link";
import { useMessages } from "@/components/site-preferences";
import { importSteamGames, previewSteamLibrary, syncSteamPlaytime, type LibraryPreview } from "@/app/actions/steam-library";
import { parseSteamBrowse, type SteamBrowse } from "@/lib/steam-library-input";
import { parseHours } from "@/lib/rating-input";
import { SteamRatingPicker, SteamRatingEditor, emptySteamRatingDraft, readSteamRatingSession, type SteamRatingDraft, type SteamRatingGame } from "@/components/steam-import-ratings";
import { SteamGameCover } from "@/components/steam-game-cover";

const button = "inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-container text-on-primary-container px-5 py-3 disabled:opacity-50";
export function SteamLibraryImport({configured,profileId}:{configured:boolean;profileId:number}) {
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
  const [ratingHidden,setRatingHidden] = useState(false);
  const [detailsOpen,setDetailsOpen] = useState(false);
  const [draft,setDraft] = useState<SteamRatingDraft>(emptySteamRatingDraft);
  const [storageReady,setStorageReady] = useState(false);
  // ponytail: browser-local resume; use server persistence if cross-device resume is needed.
  const storageKey = `playlogg-steam-ratings:${profileId}`;
  const modalOpen = choice !== null || (importing && !ratingSession) || (ratingSession && !ratingHidden);
  const detailsToast = useRef<HTMLElement>(null);
  const restoreSession = useEffectEvent(()=>{
    try {
      const raw=localStorage.getItem(storageKey);
      const saved=raw ? readSteamRatingSession(raw) : null;
      if(saved){setRatingGames(saved.games);setRatingIndex(saved.index);setRatingTarget(saved.target);setDraft(saved.draft);setProgress(saved.progress);setImportTotal(saved.total);setRatingSession(true);setRatingHidden(true);}
      else if(raw)localStorage.removeItem(storageKey);
    } catch {setMessage("Your rating session could not be restored in this browser.");}
    setStorageReady(true);
  });
  useEffect(()=>{const timer=setTimeout(()=>restoreSession(),0);return ()=>clearTimeout(timer);},[storageKey]);
  const storageFailure = useEffectEvent(()=>setMessage("This browser could not keep your rating session. Keep this page open to avoid losing your place."));
  useEffect(()=>{
    if(!storageReady)return;
    try {
      if(ratingSession && ratingGames.length)localStorage.setItem(storageKey,JSON.stringify({games:ratingGames,index:ratingIndex,target:ratingTarget,draft,progress,total:importTotal}));
      else if(!ratingSession)localStorage.removeItem(storageKey);
    } catch {queueMicrotask(()=>storageFailure());}
  },[storageReady,storageKey,ratingSession,ratingGames,ratingIndex,ratingTarget,draft,progress,importTotal]);
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
    dialog.showModal();
    return ()=>dialog.close();
  },[modalOpen]);
  useEffect(()=>{
    if(!detailsOpen || !detailsToast.current)return;
    const toast=detailsToast.current;toast.showPopover();
    return ()=>{if(toast.matches(":popover-open"))toast.hidePopover();};
  },[detailsOpen,modalOpen]);
  useEffect(()=>{
    if(!modalOpen)return;
    const overflow=document.body.style.overflow;document.body.style.overflow="hidden";
    return ()=>{document.body.style.overflow=overflow;};
  },[modalOpen]);
  function nextRating(){setRatingIndex(current=>current+1);setDraft(emptySteamRatingDraft);}
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
    const hours=new Map(preview?.games.map(game=>[game.appId,game.hours]));
    const rated=ids.filter(id=>wanted.has(id)).sort((a,b)=>(hours.get(b)??0)-(hours.get(a)??0));
    const queue=[...rated,...ids.filter(id=>!wanted.has(id))];
    if (active.current || !queue.length) return;
    setChoice(null);setDetailsOpen(rateIds.length>0);setRatingHidden(false);setDraft(emptySteamRatingDraft);setRatingSession(rateIds.length>0);setRatingGames([]);setRatingIndex(0);setRatingTarget(rateIds.length);
    setSelected(queue);
    active.current=true;setBusy(true);setImporting(true);setMessage("");setFailures([]);setSummary(null);setImportTotal(queue.length);setProgress(0);
    const remaining:number[]=[];
    const failed:{appId:number;title:string;message:string}[]=[];
    let imported=0,skipped=0;
    try {
      for (let offset=0;offset<queue.length;) {
        // Return the first rated game promptly, then amortize work in bounded batches.
        const batch=queue.slice(offset,offset+(offset===0&&rated.length ? 1 : 25));
        setImportTitle(preview?.games.find(game=>game.appId===batch[0])?.title??"");
        let response;
        try {response=await importSteamGames(batch);}
        catch {response={ok:false,message:"Library import is unavailable right now. Please retry.",results:[]};}
        for(const appId of batch){
          const result=response.results.find(result=>result.appId===appId)??{ok:false,message:response.message};
          const row=preview?.games.find(game=>game.appId===appId);
          if(result.ok){
            if(result.skipped)skipped++;else imported++;
            if(wanted.has(appId)&&result.rating&&row)setRatingGames(current=>[...current,{...row,...result.rating!}]);
            setPreview(current=>current ? {...current,games:current.games.filter(game=>game.appId!==appId),total:Math.max(0,current.total-1),nextOffset:Math.max(0,current.nextOffset-1),syncAppIds:[...new Set([...current.syncAppIds,appId])]} : current);
          }else{remaining.push(appId);failed.push({appId,title:row?.title??String(appId),message:result.message});}
        }
        offset+=batch.length;setProgress(offset);
      }
      setSelected(remaining);setFailures(failed);setSummary({imported,skipped,failed:failed.length});
      setMessage(failed.length ? "Some games could not be imported. Your successful imports are saved; retry the remaining games." : "Import complete. Your games are saved in your profile.");
    } finally {active.current=false;setBusy(false);setImporting(false);setDetailsOpen(false);setImportTitle("");}
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
  const importProgress = <>
    <div role="status" aria-live="polite" className="mt-6 space-y-5">
      <div><p className="text-body-sm text-on-surface-variant">{t(importing ? "Processing now" : progress<importTotal ? "Import interrupted. Refresh the library to import remaining games." : "Import complete")}</p>{importing&&<p translate="no" className="mt-1 font-headline-md break-words">{importTitle}</p>}</div>
      <div className="grid grid-cols-2 gap-4"><div><p className="text-body-sm text-on-surface-variant">{t("Games processed")}</p><p className="mt-1 text-2xl text-primary tabular-nums">{progress} / {importTotal}</p></div><div><p className="text-body-sm text-on-surface-variant">{t("Games remaining")}</p><p className="mt-1 text-2xl text-primary tabular-nums">{Math.max(0,importTotal-progress)}</p></div></div>
    </div>
    <div role="progressbar" aria-label={t("Importing games")} aria-valuemin={0} aria-valuemax={Math.max(1,importTotal)} aria-valuenow={progress} className="mt-4 h-2 overflow-hidden rounded-full bg-surface-container-highest"><div className="h-full rounded-full bg-primary motion-safe:transition-[width]" style={{width:`${importTotal ? progress/importTotal*100 : 0}%`}}/></div>
    {ratingSession&&<p className="mt-4 text-body-sm text-on-surface-variant">{t("Games reviewed")}: {ratingIndex} / {ratingTarget}. {t("Only successful new imports are shown here.")}</p>}
    {importing&&<p className="mt-4 text-body-sm text-on-surface-variant">{t("Import continues while you rate. Keep this page open until it finishes.")}</p>}
  </>;
  const progressToast = detailsOpen ? <aside ref={detailsToast} popover="manual" role="region" aria-labelledby="steam-import-details-title" onKeyDown={event=>{if(event.key==="Escape"){event.stopPropagation();setDetailsOpen(false);}}} className="fixed inset-auto right-4 bottom-4 m-0 w-[calc(100%_-_2rem)] max-w-xs max-h-40 overflow-y-auto rounded-xl border border-primary/20 bg-surface-container-high p-4 text-on-surface shadow-2xl backdrop:bg-transparent">
    <div className="flex items-center justify-between gap-3"><h2 id="steam-import-details-title" className="font-semibold text-body-md">{t("Import details")}</h2><button aria-label={t("Close import details")} className="min-h-11 min-w-11 text-primary -my-2 -mr-2" onClick={()=>setDetailsOpen(false)}>×</button></div>
    <div role="status" className="mt-2 space-y-1 text-body-sm">
      <p className="flex justify-between gap-2"><span>{t("Games processed")}: {progress} / {importTotal}</span><span>{t("Games remaining")}: {Math.max(0,importTotal-progress)}</span></p>
      {importing ? <p translate="no" className="truncate text-on-surface-variant">{importTitle}</p> : <p className="text-on-surface-variant">{t(progress<importTotal ? "Import interrupted. Refresh the library to import remaining games." : "Import complete")}</p>}
      {ratingSession&&<p className="text-on-surface-variant">{t("Games reviewed")}: {ratingIndex} / {ratingTarget}</p>}
    </div>
    <div role="progressbar" aria-label={t("Importing games")} aria-valuemin={0} aria-valuemax={Math.max(1,importTotal)} aria-valuenow={progress} className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-container-highest"><div className="h-full rounded-full bg-primary" style={{width:`${importTotal ? progress/importTotal*100 : 0}%`}}/></div>
  </aside> : null;
  return <div className="space-y-6">
    {ratingSession&&ratingHidden&&<div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-container-low p-4"><button className={button} onClick={()=>{setRatingHidden(false);setDetailsOpen(importing);}}>{t("Resume rating games")} ({Math.max(0,ratingGames.length-ratingIndex)})</button><p className="text-body-sm text-on-surface-variant">{t("Your unfinished ratings are kept in this browser.")}</p></div>}
    <p className="text-body-sm text-on-surface-variant">{t("Steam Game details must be Public, including playtime. Your Playlogg profile visibility does not change.")}</p>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={()=>load(filters,amount,false,true)}>{t(loading ? "Loading…" : "Refresh library")}</button><button className={button} disabled={busy||!preview?.syncAppIds.length} onClick={syncPlaytime}>{t(syncing ? "Syncing playtime…" : "Sync Steam playtime")}</button><Link href="/profile" className="inline-flex min-h-11 items-center rounded-xl bg-surface-container text-primary px-5 py-3">{t("View profile")}</Link></div><button className={`${button} ml-auto`} disabled={busy||ratingSession||!selected.length} onClick={()=>setChoice("ask")}>{t("Import selected games")} ({selected.length})</button></div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end rounded-xl bg-surface-container-low p-5">
      <label className="min-w-0 space-y-2"><span className="block">{t("Sort by")}</span><select aria-label={t("Sort by")} disabled={busy&&!loading} value={filters.sort} onChange={event=>updateFilters(minHours,maxHours,event.target.value as SteamBrowse["sort"],amount,0)} className="w-full rounded-xl bg-surface-container p-3"><option value="title">{t("Title A–Z")}</option><option value="hours_desc">{t("Most played")}</option><option value="hours_asc">{t("Least played")}</option></select></label>
      <label className="min-w-0 space-y-2"><span className="block">{t("Minimum hours")}</span><input disabled={busy&&!loading} type="number" min="0" step="any" value={minHours} onChange={event=>{setMinHours(event.target.value);updateFilters(event.target.value,maxHours);}} className="w-full rounded-xl bg-surface-container p-3" /></label>
      <label className="min-w-0 space-y-2"><span className="block">{t("Maximum hours")}</span><input disabled={busy&&!loading} type="number" min="0" step="any" value={maxHours} onChange={event=>{setMaxHours(event.target.value);updateFilters(minHours,event.target.value);}} className="w-full rounded-xl bg-surface-container p-3" /></label>
      <label className="min-w-0 space-y-2"><span className="block">{t("Games to show")}</span><select aria-label={t("Games to show")} disabled={busy&&!loading} value={amount} onChange={event=>{const size=event.target.value;setAmount(size);updateFilters(minHours,maxHours,filters.sort,size,0);}} className="w-full rounded-xl bg-surface-container p-3">{["25","50","100","all"].map(size=><option key={size} value={size}>{size==="all" ? t("All") : size}</option>)}</select></label>
      <button type="button" disabled={busy&&!loading} onClick={()=>{setMinHours("");setMaxHours("");updateFilters("","",filters.sort,amount,0);}} className="min-h-11 rounded-xl bg-surface-container text-primary px-4">{t("Clear filters")}</button>
    </div>
    <p role="status" aria-live="polite">{t(message)}{loading&&<span className="flex items-center gap-2"><span aria-hidden="true" className="w-5 h-5 rounded-full border-2 border-primary/25 border-t-primary motion-safe:animate-spin"/>{t("Loading library")}: {preview?.games.length ?? 0} / {preview?.total ?? "—"}</span>}</p>
    <dialog ref={importDialog} tabIndex={-1} aria-labelledby="steam-import-title" onCancel={event=>{if(ratingSession){event.preventDefault();setRatingHidden(true);}else if(importing)event.preventDefault();else setChoice(null);}} className={`fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-lg max-h-[calc(100dvh_-_2rem)] overflow-y-auto rounded-2xl bg-surface-container-high text-on-surface p-6 sm:p-8 shadow-2xl border border-primary/20 backdrop:bg-black/65 backdrop:backdrop-blur-sm ${detailsOpen ? "max-xl:!mt-4 max-xl:!mb-auto max-xl:!max-h-[calc(100dvh_-_13rem)]" : ""}`}>
      <div className="flex items-center gap-3">
        {importing&&!ratingSession&&<span aria-hidden="true" className="h-6 w-6 shrink-0 rounded-full border-[3px] border-primary/25 border-t-primary motion-safe:animate-spin"/>}
        <h2 id="steam-import-title" className="font-headline-md text-headline-md">{t(choice ? "How would you like to rate your games?" : ratingSession ? "Rate imported games" : "Importing games")}</h2>
        {ratingSession&&!choice&&<button aria-label={t("Close rating session")} className="ml-auto min-h-11 min-w-11 rounded-xl text-primary" onClick={()=>setRatingHidden(true)}>×</button>}
      </div>
      {choice==="ask"&&<div className="mt-5 space-y-4"><p>{t("Import every selected game, then choose how many you want to rate.")}</p><div className="grid gap-3"><button className={button} onClick={()=>importSelected(false,selected)}>{t("Rate all games")}</button><button className={button} onClick={()=>setChoice("some")}>{t("Rate some games")}</button><button className={button} onClick={()=>importSelected()}>{t("Just import")}</button></div><button className="min-h-11 text-primary px-3" onClick={()=>setChoice(null)}>{t("Cancel")}</button></div>}
      {choice==="some"&&<SteamRatingPicker games={preview?.games.filter(game=>selected.includes(game.appId))??[]} onBack={()=>setChoice("ask")} onStart={ids=>importSelected(false,ids)}/>}
      {!choice&&<>
      {!ratingSession&&importProgress}
      {ratingSession&&<>{ratingGames[ratingIndex] ? <SteamRatingEditor key={ratingGames[ratingIndex].slug} game={ratingGames[ratingIndex]} draft={draft} onDraft={setDraft} onNext={nextRating}/> : importing ? <p role="status" className="mt-5">{t("Waiting for the next imported game…")}</p> : <div className="mt-5 space-y-4"><p>{t(progress<importTotal ? "Your imported games have been reviewed. Refresh the library to import remaining games." : "Your imports and rating session are complete.")}</p><button className={button} onClick={()=>setRatingSession(false)}>{t("Done")}</button></div>}</>}
      </>}
      {modalOpen&&progressToast}
    </dialog>
    {!modalOpen&&progressToast}
    {loading&&<button type="button" onClick={()=>{stopLoading.current=true;}} className="min-h-11 rounded-xl bg-surface-container text-primary px-4">{t("Stop loading")}</button>}
    {summary&&<p role="status">{t("Imported")}: {summary.imported} · {t("Skipped")}: {summary.skipped} · {t("Failed")}: {summary.failed}</p>}
    {!!failures.length&&<button disabled={busy||ratingSession} onClick={()=>importSelected(true)} className={button}>{t("Retry failed games")}</button>}
    {!!failures.length&&<ul className="space-y-2 text-on-surface-variant">{failures.map(failure=><li key={failure.appId}><span translate="no">{failure.title}</span>: {t(failure.message)}</li>)}</ul>}
    {preview&&(amount!=="all"||!loading)&&preview.total>0&&<>
      <div className="flex flex-wrap items-center justify-between gap-4"><p>{preview.games.length} / {preview.total} {t("Steam games")}</p><div className="flex flex-wrap gap-3"><button className="min-h-11 rounded-xl bg-surface-container text-primary px-4" disabled={busy||!available.length} onClick={()=>setSelected(available.map(game=>game.appId))}>{t("Select available games")}</button><button className="min-h-11 rounded-xl bg-surface-container text-primary px-4" disabled={busy||!selected.length} onClick={()=>setSelected([])}>{t("Clear selection")}</button></div></div>
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{preview.games.map(game=><li key={game.appId} className="min-w-0 rounded-xl bg-surface-container-low p-4"><label className="flex items-start gap-4 cursor-pointer"><input type="checkbox" className="mt-2 shrink-0 accent-primary w-5 h-5" checked={selected.includes(game.appId)} disabled={busy||!game.matched||game.logged} onChange={event=>setSelected(current=>event.target.checked ? [...current,game.appId] : current.filter(id=>id!==game.appId))} aria-label={`${t("Select game")} ${game.title}`} /><SteamGameCover key={`${game.appId}-${game.cover}`} appId={game.appId} cover={game.cover}/><span className="min-w-0 space-y-2"><span translate="no" className="block font-headline-md text-headline-md break-words">{game.title}</span><span className="block text-on-surface-variant">{game.hours} {t("hours")}</span><span className="block text-body-sm text-primary">{t(game.logged ? "Already in your profile" : game.matched ? "Ready to import" : "No exact catalog match")}</span></span></label>{!game.matched&&<Link href={`/search?${new URLSearchParams({q:game.title,from:"/profile/import/steam"})}`} className="mt-3 min-h-11 inline-flex items-center text-primary">{t("Find this game manually")}</Link>}</li>)}</ul>
      {preview.nextOffset<preview.total&&<div className="flex justify-end"><button type="button" className="min-h-11 rounded-xl bg-surface-container text-primary px-5 py-3" disabled={busy} onClick={()=>load(filters,amount,true)}>{t("Load more")}</button></div>}
    </>}
  </div>;
}
