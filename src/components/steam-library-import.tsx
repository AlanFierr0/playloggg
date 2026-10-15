"use client";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import Link from "next/link";
import { useReturnNavigation } from "@/components/return-navigation";
import { useMessages } from "@/components/site-preferences";
import { importSteamGames, previewSteamLibrary, syncSteamPlaytime, type LibraryPreview } from "@/app/actions/steam-library";
import { browseSteamLibrary, parseSteamBrowse, type SteamBrowse } from "@/lib/steam-library-input";
import { parseHours } from "@/lib/rating-input";
import { SteamRatingEditor, emptySteamRatingDraft, readSteamRatingSession, type SteamRatingDraft, type SteamRatingGame } from "@/components/steam-import-ratings";
import { readSteamImportWork, type SteamImportWork } from "@/lib/steam-import-work";
import { SteamCompletionScan } from "@/components/steam-completion-scan";
import { SteamGameCover } from "@/components/steam-game-cover";

const button = "inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-container text-on-primary-container px-5 py-3 disabled:opacity-50";
export function SteamLibraryImport({configured,profileId}:{configured:boolean;profileId:number}) {
  const t = useMessages();
  const { goBack } = useReturnNavigation("/profile/import/steam");
  const [preview,setPreview] = useState<LibraryPreview|null>(null);
  const [selected,setSelected] = useState<number[]>([]);
  const [busy,setBusy] = useState(configured);
  const [loading,setLoading] = useState(configured);
  const [syncing,setSyncing] = useState(false);
  const [importing,setImporting] = useState(false);
  const [importTitle,setImportTitle] = useState("");
  const [amount,setAmount] = useState("all");
  const [filters,setFilters] = useState<Omit<SteamBrowse,"offset">>({sort:"title",minHours:null,maxHours:null});
  // Keep fetch order stable so local sorting never changes the next page offset.
  const [displaySort,setDisplaySort] = useState<SteamBrowse["sort"]>("title");
  const [minHours,setMinHours] = useState("");
  const [maxHours,setMaxHours] = useState("");
  const [message,setMessage] = useState("");
  const [progress,setProgress] = useState(0);
  const [failures,setFailures] = useState<{appId:number;title:string;message:string}[]>([]);
  const [summary,setSummary]=useState<{imported:number;skipped:number;failed:number}|null>(null);
  const [importTotal,setImportTotal]=useState(0);
  const [ratingSession,setRatingSession] = useState(false);
  const [ratingGames,setRatingGames] = useState<SteamRatingGame[]>([]);
  const [ratingIndex,setRatingIndex] = useState(0);
  const [ratingTarget,setRatingTarget] = useState(0);
  const [ratingHidden,setRatingHidden] = useState(false);
  const [detailsOpen,setDetailsOpen] = useState(false);
  const [draft,setDraft] = useState<SteamRatingDraft>(emptySteamRatingDraft);
  const [recoveryWarning,setRecoveryWarning] = useState("");
  const [importWork,setImportWork] = useState<SteamImportWork|null>(null);
  const pauseImport = useRef(false);
  const mounted = useRef(true);
  const [storageReady,setStorageReady] = useState(false);
  // ponytail: browser-local resume; use server persistence if cross-device resume is needed.
  const storageKey = `playlogg-steam-ratings:${profileId}`;
  const workKey = `playlogg-steam-import:${profileId}`;
  const modalOpen = (importing && !ratingSession) || (ratingSession && !ratingHidden);
  const detailsToast = useRef<HTMLElement>(null);
  const restoreSession = useEffectEvent(()=>{
    try {
      const raw=localStorage.getItem(storageKey);
      const saved=raw ? readSteamRatingSession(raw) : null;
      if(saved){setRatingGames(saved.games);setRatingIndex(saved.index);setRatingTarget(saved.target);setDraft(saved.draft);setProgress(saved.progress);setImportTotal(saved.total);setRatingSession(true);setRatingHidden(true);}
      else if(raw)localStorage.removeItem(storageKey);
    } catch {setMessage("Your rating session could not be restored in this browser.");}
    try {
      const raw=localStorage.getItem(workKey);
      const work=raw ? readSteamImportWork(raw) : null;
      if(work){setImportWork(work);setImportTotal(work.total);setProgress(work.total-work.pending.length);}
      else if(raw)localStorage.removeItem(workKey);
    } catch {setMessage("Your unfinished import could not be restored in this browser.");}
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
  useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;pauseImport.current=true;};},[]);
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
  function keepImport(work:SteamImportWork|null) {
    setImportWork(work);
    try {if(work)localStorage.setItem(workKey,JSON.stringify(work));else localStorage.removeItem(workKey);}
    catch {setRecoveryWarning("This browser could not save your import queue. Keep this page open until it finishes.");}
  }
  async function importSelected(retry=false,rateIds:number[]=[],resume:SteamImportWork|null=null) {
    const ids=retry ? failures.map(failure=>failure.appId) : selected;
    const wanted=new Set(resume?.rateIds ?? rateIds);
    const rows=resume?.rows ?? preview?.games.filter(game=>ids.includes(game.appId)) ?? [];
    const byId=new Map(rows.map(game=>[game.appId,game]));
    const rated=ids.filter(id=>wanted.has(id)).sort((a,b)=>(byId.get(b)?.hours??0)-(byId.get(a)?.hours??0));
    const queue=resume?.pending ?? [...rated,...ids.filter(id=>!wanted.has(id))];
    if (active.current || !queue.length) return;
    let work:SteamImportWork=resume ? {...resume} : {version:1,rows,pending:queue,rateIds,total:queue.length,imported:0,skipped:0};
    // Save before the first request; an interrupted batch can be safely replayed.
    keepImport(work);pauseImport.current=false;
    setDetailsOpen(wanted.size>0);setRatingHidden(false);
    if(!resume){setDraft(emptySteamRatingDraft);setRatingGames([]);setRatingIndex(0);setRatingTarget(rateIds.length);}
    if(wanted.size){setRatingSession(true);setRatingTarget(work.rateIds.length);}
    setSelected(queue);
    active.current=true;setBusy(true);setImporting(true);setMessage("");setFailures([]);setSummary(null);setImportTotal(work.total);setProgress(work.total-queue.length);
    const failed:{appId:number;title:string;message:string}[]=[];
    const failedIds:number[]=[];
    try {
      for (let offset=0;offset<queue.length&&!pauseImport.current;) {
        const batch=queue.slice(offset,offset+(offset===0&&wanted.size ? 1 : 25));
        setImportTitle(byId.get(batch[0])?.title??"");
        let response;
        try {response=await importSteamGames(batch,Boolean(resume));}
        catch {response={ok:false,message:"Library import is unavailable right now. Please retry.",results:[]};}
        // Leave the in-flight IDs saved if this component was unmounted.
        if(!mounted.current)return;
        const additions:SteamRatingGame[]=[];
        for(const appId of batch){
          const result=response.results.find(result=>result.appId===appId)??{ok:false,message:response.message};
          const row=byId.get(appId);
          if(result.ok){
            if(result.skipped)work.skipped++;else work.imported++;
            if(wanted.has(appId)&&result.rating&&row)additions.push({...row,...result.rating});
            setPreview(current=>current ? {...current,games:current.games.filter(game=>game.appId!==appId),total:Math.max(0,current.total-1),nextOffset:Math.max(0,current.nextOffset-1),syncAppIds:[...new Set([...current.syncAppIds,appId])]} : current);
          }else{failedIds.push(appId);failed.push({appId,title:row?.title??String(appId),message:result.message});}
        }
        if(additions.length){
          setRatingGames(current=>[...new Map([...current,...additions].map(game=>[game.appId,game])).values()]);
          // Checkpoint ratings synchronously before removing acknowledged import IDs.
          try {
            const raw=localStorage.getItem(storageKey);
            const saved=raw ? readSteamRatingSession(raw) : null;
            localStorage.setItem(storageKey,JSON.stringify({games:[...new Map([...(saved?.games??[]),...additions].map(game=>[game.appId,game])).values()],index:saved?.index??0,target:work.rateIds.length,draft:saved?.draft??emptySteamRatingDraft,progress:work.total-queue.length+offset+batch.length,total:work.total}));
          } catch {setMessage("This browser could not keep your rating session. Keep this page open to avoid losing your place.");}
        }
        offset+=batch.length;
        work={...work,pending:[...failedIds,...queue.slice(offset)]};
        keepImport(work.pending.length ? work : null);
        setProgress(work.total-queue.length+offset);
      }
      setSelected(work.pending);setFailures(failed);setSummary({imported:work.imported,skipped:work.skipped,failed:failed.length});
      setMessage(pauseImport.current ? "Import paused. Resume it here whenever you are ready." : failed.length ? "Some games could not be imported. Your successful imports are saved; retry the remaining games." : "Import complete. Your games are saved in your profile.");
    } finally {if(mounted.current){active.current=false;setBusy(false);setImporting(false);setDetailsOpen(false);setImportTitle("");}}
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
  const orderedGames=browseSteamLibrary(preview?.games ?? [],{...filters,sort:displaySort,offset:0});
  const available=preview?.games.filter(game=>game.matched&&!game.logged) ?? [];
  const importProgress = <>
    <div role="status" aria-live="polite" className="mt-6 space-y-5">
      <div><p className="text-body-sm text-on-surface-variant">{t(importing ? "Processing now" : progress<importTotal ? "Import paused. Resume it here whenever you are ready." : "Import complete")}</p>{importing&&<p translate="no" className="mt-1 font-headline-md break-words">{importTitle}</p>}</div>
      <div className="grid grid-cols-2 gap-4"><div><p className="text-body-sm text-on-surface-variant">{t("Games processed")}</p><p className="mt-1 text-2xl text-primary tabular-nums">{progress} / {importTotal}</p></div><div><p className="text-body-sm text-on-surface-variant">{t("Games remaining")}</p><p className="mt-1 text-2xl text-primary tabular-nums">{Math.max(0,importTotal-progress)}</p></div></div>
    </div>
    <div role="progressbar" aria-label={t("Importing games")} aria-valuemin={0} aria-valuemax={Math.max(1,importTotal)} aria-valuenow={progress} className="mt-4 h-2 overflow-hidden rounded-full bg-surface-container-highest"><div className="h-full rounded-full bg-primary motion-safe:transition-[width]" style={{width:`${importTotal ? progress/importTotal*100 : 0}%`}}/></div>
    {ratingSession&&<p className="mt-4 text-body-sm text-on-surface-variant">{t("Games reviewed")}: {ratingIndex} / {ratingTarget}. {t("Only successful new imports are shown here.")}</p>}
    {importing&&<button type="button" className="mt-3 min-h-11 text-primary" onClick={()=>{pauseImport.current=true;setMessage("Pausing after the current batch…");}}>{t("Pause import")}</button>}
    {importing&&<p className="mt-4 text-body-sm text-on-surface-variant">{t("Import continues while this page is open. If you leave, resume the saved queue when you return.")}</p>}
  </>;
  const progressToast = detailsOpen ? <aside ref={detailsToast} popover="manual" role="region" aria-labelledby="steam-import-details-title" onKeyDown={event=>{if(event.key==="Escape"){event.stopPropagation();setDetailsOpen(false);}}} className="fixed inset-auto right-4 bottom-4 m-0 w-[calc(100%_-_2rem)] max-w-xs max-h-40 overflow-y-auto rounded-xl border border-primary/20 bg-surface-container-high p-4 text-on-surface shadow-2xl backdrop:bg-transparent">
    <div className="flex items-center justify-between gap-3"><h2 id="steam-import-details-title" className="font-semibold text-body-md">{t("Import details")}</h2><button aria-label={t("Close import details")} className="min-h-11 min-w-11 text-primary -my-2 -mr-2" onClick={()=>setDetailsOpen(false)}>×</button></div>
    <div role="status" className="mt-2 space-y-1 text-body-sm">
      <p className="flex justify-between gap-2"><span>{t("Games processed")}: {progress} / {importTotal}</span><span>{t("Games remaining")}: {Math.max(0,importTotal-progress)}</span></p>
      {importing ? <p translate="no" className="truncate text-on-surface-variant">{importTitle}</p> : <p className="text-on-surface-variant">{t(progress<importTotal ? "Import paused. Resume it here whenever you are ready." : "Import complete")}</p>}
      {ratingSession&&<p className="text-on-surface-variant">{t("Games reviewed")}: {ratingIndex} / {ratingTarget}</p>}
    </div>
    <div role="progressbar" aria-label={t("Importing games")} aria-valuemin={0} aria-valuemax={Math.max(1,importTotal)} aria-valuenow={progress} className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-container-highest"><div className="h-full rounded-full bg-primary" style={{width:`${importTotal ? progress/importTotal*100 : 0}%`}}/></div>
  </aside> : null;
  return <div className="space-y-6">
    {recoveryWarning&&<p role="alert" className="text-error">{t(recoveryWarning)}</p>}
    {importWork&&!importing&&<div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-container-low p-4"><button className={button} disabled={busy} onClick={()=>void importSelected(false,[],importWork)}>{t("Resume import")} ({importWork.pending.length})</button><button type="button" className="min-h-11 px-3 text-primary" disabled={busy} onClick={()=>keepImport(null)}>{t("Discard remaining import")}</button><p className="text-body-sm text-on-surface-variant">{t("Your unfinished import is saved in this browser. Already imported games are kept.")}</p></div>}
    {ratingSession&&ratingHidden&&<div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-container-low p-4"><button className={button} onClick={()=>{setRatingHidden(false);setDetailsOpen(importing);}}>{t("Resume rating games")} ({Math.max(0,ratingGames.length-ratingIndex)})</button><p className="text-body-sm text-on-surface-variant">{t("Your unfinished ratings are kept in this browser.")}</p></div>}
    <p className="text-body-sm text-on-surface-variant">{t("Steam Game details must be Public, including playtime. Your Playlogg profile visibility does not change.")}</p>
    <SteamCompletionScan profileId={profileId} disabled={importing||syncing||modalOpen}>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={()=>load(filters,amount,false,true)}>{t(loading ? "Loading…" : "Refresh library")}</button><button className={button} disabled={busy||!preview?.syncAppIds.length} onClick={syncPlaytime}>{t(syncing ? "Syncing playtime…" : "Sync Steam playtime")}</button><Link href="/profile" className="inline-flex min-h-11 items-center rounded-xl bg-surface-container text-primary px-5 py-3">{t("View profile")}</Link></div><button className={`${button} ml-auto`} disabled={busy||ratingSession||(Boolean(importWork)&&!failures.length)||!selected.length} onClick={()=>void importSelected(false,selected)}>{t("Import selected games")} ({selected.length})</button></div>
    </SteamCompletionScan>
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end rounded-xl bg-surface-container-low p-5">
      <label className="min-w-0 space-y-2"><span className="block">{t("Sort by")}</span><select aria-label={t("Sort by")} disabled={busy&&!loading} value={displaySort} onChange={event=>setDisplaySort(event.target.value as SteamBrowse["sort"])} className="w-full rounded-xl bg-surface-container p-3"><option value="title">{t("Title A–Z")}</option><option value="hours_desc">{t("Most played")}</option><option value="hours_asc">{t("Least played")}</option></select></label>
      <label className="min-w-0 space-y-2"><span className="block">{t("Minimum hours")}</span><input disabled={busy&&!loading} type="number" min="0" step="any" value={minHours} onChange={event=>{setMinHours(event.target.value);updateFilters(event.target.value,maxHours);}} className="w-full rounded-xl bg-surface-container p-3" /></label>
      <label className="min-w-0 space-y-2"><span className="block">{t("Maximum hours")}</span><input disabled={busy&&!loading} type="number" min="0" step="any" value={maxHours} onChange={event=>{setMaxHours(event.target.value);updateFilters(minHours,event.target.value);}} className="w-full rounded-xl bg-surface-container p-3" /></label>
      <label className="min-w-0 space-y-2"><span className="block">{t("Games to show")}</span><select aria-label={t("Games to show")} disabled={busy&&!loading} value={amount} onChange={event=>{const size=event.target.value;setAmount(size);updateFilters(minHours,maxHours,filters.sort,size,0);}} className="w-full rounded-xl bg-surface-container p-3">{["25","50","100","all"].map(size=><option key={size} value={size}>{size==="all" ? t("All") : size}</option>)}</select></label>
      <button type="button" disabled={busy&&!loading} onClick={()=>{setMinHours("");setMaxHours("");updateFilters("","",filters.sort,amount,0);}} className="min-h-11 rounded-xl bg-surface-container text-primary px-4">{t("Clear filters")}</button>
    </div>
    <p role="status" aria-live="polite">{t(message)}{loading&&<span className="flex items-center gap-2"><span aria-hidden="true" className="w-5 h-5 rounded-full border-2 border-primary/25 border-t-primary motion-safe:animate-spin"/>{t("Loading library")}: {preview?.games.length ?? 0} / {preview?.total ?? "—"}</span>}</p>
    <dialog ref={importDialog} tabIndex={-1} aria-labelledby="steam-import-title" onCancel={event=>{if(event.target!==event.currentTarget)return;if(ratingSession){event.preventDefault();setRatingHidden(true);}else if(importing)event.preventDefault();}} className={`fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-lg max-h-[calc(100dvh_-_2rem)] overflow-y-auto rounded-2xl bg-surface-container-high text-on-surface p-6 sm:p-8 shadow-2xl border border-primary/20 backdrop:bg-black/65 backdrop:backdrop-blur-sm ${detailsOpen ? "max-xl:!mt-4 max-xl:!mb-auto max-xl:!max-h-[calc(100dvh_-_13rem)]" : ""}`}>
      <div className="flex items-center gap-3">
        {importing&&!ratingSession&&<span aria-hidden="true" className="h-6 w-6 shrink-0 rounded-full border-[3px] border-primary/25 border-t-primary motion-safe:animate-spin"/>}
        <h2 id="steam-import-title" className="font-headline-md text-headline-md">{t(ratingSession ? "Rate imported games" : "Importing games")}</h2>
        {ratingSession&&<button aria-label={t("Close rating session")} className="ml-auto min-h-11 min-w-11 rounded-xl text-primary" onClick={()=>setRatingHidden(true)}>×</button>}
      </div>
      {!ratingSession&&importProgress}
      {ratingSession&&<>{ratingGames[ratingIndex] ? <SteamRatingEditor key={ratingGames[ratingIndex].slug} game={ratingGames[ratingIndex]} draft={draft} onDraft={setDraft} onNext={nextRating}/> : importing ? <p role="status" className="mt-5">{t("Waiting for the next imported game…")}</p> : <div className="mt-5 space-y-4"><p>{t(progress<importTotal ? "Your imported games have been reviewed. Resume the import to continue." : "Your imports and rating session are complete.")}</p><button className={button} onClick={()=>{setRatingSession(false);try{localStorage.removeItem(storageKey);}catch{}if(progress>=importTotal&&!failures.length)goBack();}}>{t("Done")}</button></div>}</>}
      {modalOpen&&progressToast}
    </dialog>
    {!modalOpen&&progressToast}
    {loading&&<button type="button" onClick={()=>{stopLoading.current=true;}} className="min-h-11 rounded-xl bg-surface-container text-primary px-4">{t("Stop loading")}</button>}
    {summary&&<p role="status">{t("Imported")}: {summary.imported} · {t("Skipped")}: {summary.skipped} · {t("Failed")}: {summary.failed}</p>}
    {!!failures.length&&<button disabled={busy||ratingSession} onClick={()=>importWork ? importSelected(false,[],importWork) : importSelected(true,failures.map(failure=>failure.appId))} className={button}>{t("Retry failed games")}</button>}
    {!!failures.length&&<ul className="space-y-2 text-on-surface-variant">{failures.map(failure=><li key={failure.appId}><span translate="no">{failure.title}</span>: {t(failure.message)}</li>)}</ul>}
    {preview&&preview.total>0&&<>
      <div className="flex flex-wrap items-center justify-between gap-4"><p>{preview.games.length} / {preview.total} {t("Steam games")}</p><div className="flex flex-wrap gap-3"><button className="min-h-11 rounded-xl bg-surface-container text-primary px-4" disabled={(busy&&!loading)||!available.length} onClick={()=>setSelected(available.map(game=>game.appId))}>{t("Select available games")}</button><button className="min-h-11 rounded-xl bg-surface-container text-primary px-4" disabled={(busy&&!loading)||!selected.length} onClick={()=>setSelected([])}>{t("Clear selection")}</button></div></div>
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{orderedGames.map(game=><li key={game.appId} className="min-w-0 rounded-xl bg-surface-container-low p-4"><label className="flex items-start gap-4 cursor-pointer"><input type="checkbox" className="mt-2 shrink-0 accent-primary w-5 h-5" checked={selected.includes(game.appId)} disabled={(busy&&!loading)||!game.matched||game.logged} onChange={event=>setSelected(current=>event.target.checked ? [...current,game.appId] : current.filter(id=>id!==game.appId))} aria-label={`${t("Select game")} ${game.title}`} /><SteamGameCover key={`${game.appId}-${game.cover}`} appId={game.appId} cover={game.cover}/><span className="min-w-0 space-y-2"><span translate="no" className="block font-headline-md text-headline-md break-words">{game.title}</span><span className="block text-on-surface-variant">{game.hours} {t("hours")}</span><span className="block text-body-sm text-primary">{t(game.logged ? "Already in your profile" : game.matched ? "Ready to import" : "No exact catalog match")}</span></span></label>{!game.matched&&<Link href={`/search?${new URLSearchParams({q:game.title,from:"/profile/import/steam"})}`} className="mt-3 min-h-11 inline-flex items-center text-primary">{t("Find this game manually")}</Link>}</li>)}</ul>
      {preview.nextOffset<preview.total&&<div className="flex justify-end"><button type="button" className="min-h-11 rounded-xl bg-surface-container text-primary px-5 py-3" disabled={busy} onClick={()=>load(filters,amount,true)}>{t("Load more")}</button></div>}
    </>}
  </div>;
}
