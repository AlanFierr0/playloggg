"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { listSkippedSteamCompletionGames,restoreSteamCompletion,listSteamCompletionLogs,getSteamCompletionSuggestions,confirmSteamCompletion,skipSteamCompletion,type SteamCompletionLog,type SteamCompletionResult } from "@/app/actions/steam-library";
import { useMessages } from "@/components/site-preferences";
import { SteamCompletionCandidates } from "@/components/steam-completion-candidates";
import type { SteamCompletionCandidate } from "@/lib/steam-completion-input";
type Result={game:SteamCompletionLog;result:SteamCompletionResult;message?:string;saved?:boolean;skipped?:boolean};
export function SteamCompletionScan({disabled,children}:{profileId:number;disabled:boolean;children:ReactNode}) {
  const t=useMessages();const stopped=useRef(false);const running=useRef(false);const mounted=useRef(true);
  const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[results,setResults]=useState<Result[]>([]),[message,setMessage]=useState("");
  const [lastSkipped,setLastSkipped]=useState<{slug:string;title:string}|null>(null);
  const [skippedGames,setSkippedGames]=useState<{slug:string;title:string}[]|null>(null),[skipMessage,setSkipMessage]=useState(""),[loadingSkipped,setLoadingSkipped]=useState(false);
  const undoButton=useRef<HTMLButtonElement>(null),scanButton=useRef<HTMLButtonElement>(null);
  const restoreFocus=useRef(false);
  useEffect(()=>{if(lastSkipped)undoButton.current?.focus();},[lastSkipped]);
  const [retryAt,setRetryAt]=useState(0),[remaining,setRemaining]=useState(0);
  useEffect(()=>{if(!retryAt)return;const update=()=>{const seconds=Math.max(0,Math.ceil((retryAt-Date.now())/1000));setRemaining(seconds);if(!seconds)setRetryAt(0);};const initial=setTimeout(update,0),timer=setInterval(update,1000);return ()=>{clearTimeout(initial);clearInterval(timer);};},[retryAt]);
  const [progress,setProgress]=useState({done:0,total:0});const [saving,setSaving]=useState<string|null>(null);
  // Results still change when a fast restore batches both saving updates.
  useEffect(()=>{
    if(!restoreFocus.current||saving!==null||disabled||busy||remaining>0)return;
    restoreFocus.current=false;
    scanButton.current?.focus({preventScroll:true});
  },[results,saving,disabled,busy,remaining]);
  useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;stopped.current=true;};},[]);
  async function scan(retry=false){
    if(running.current||retryAt>Date.now())return;running.current=true;stopped.current=false;setOpen(true);setBusy(true);setMessage("");
    try {
      const list=await listSteamCompletionLogs();if(!mounted.current)return;if(!list.ok){setMessage(list.message);return;}
      const games=retry?list.games.filter(game=>!results.some(row=>row.game.slug===game.slug&&(row.saved||row.skipped||(row.result.ok&&!row.result.deferred)))):list.games;
      if(!retry)setResults([]);setProgress({done:0,total:games.length});
      let pauseSeconds=0;
      for(let offset=0;offset<games.length&&!stopped.current&&!pauseSeconds;offset+=5){
        const batch=games.slice(offset,offset+5);let cursor=0;
        async function worker(){while(cursor<batch.length&&!stopped.current&&!pauseSeconds){const game=batch[cursor++];let result:SteamCompletionResult;
          try {
            result=await getSteamCompletionSuggestions(game.appId,game.slug,retry);
            if(result.retryAfter)pauseSeconds=Math.max(pauseSeconds,result.retryAfter);
          }catch{result={ok:false,message:"Steam achievements unavailable. You can enter a date manually.",candidates:[],releasedOn:null,updatedAt:null};}
          if(!mounted.current)return;
          setResults(rows=>[...rows.filter(row=>row.game.slug!==game.slug),{game,result}]);setProgress(value=>({...value,done:value.done+1}));
        }}
        await Promise.all([worker(),worker()]);
      }
      if(mounted.current&&pauseSeconds){setRetryAt(Date.now()+pauseSeconds*1000);setRemaining(pauseSeconds);setMessage("Scan paused by a service limit. Your results are kept; retry unfinished games after the countdown.");}
      else if(mounted.current)setMessage(stopped.current?"Scan stopped. Run it again to check remaining games.":"Scan finished. Only confirmed dates are saved.");
    }catch{if(mounted.current)setMessage("Completion dates could not be loaded. Please retry.");}
    finally{running.current=false;if(mounted.current)setBusy(false);}
  }
  async function confirm(row:Result,candidate:SteamCompletionCandidate){
    setSaving(row.game.slug);
    try{const result=await confirmSteamCompletion(row.game.appId,row.game.slug,candidate.id,row.game.updatedAt);if(mounted.current){setResults(rows=>rows.map(item=>item.game.slug===row.game.slug?{...item,message:result.message,saved:result.ok}:item));if(result.ok)setMessage(result.message);}}
    catch{if(mounted.current)setResults(rows=>rows.map(item=>item.game.slug===row.game.slug?{...item,message:"Completion could not be saved. Please retry."}:item));}
    finally{if(mounted.current)setSaving(null);}
  }
  async function skip(row:Result){
    setSaving(row.game.slug);
    try{const result=await skipSteamCompletion(row.game.slug);if(mounted.current){setResults(rows=>rows.map(item=>item.game.slug===row.game.slug?{...item,message:result.message,skipped:result.ok}:item));if(result.ok){setMessage(result.message);setLastSkipped(row.game);setSkippedGames(games=>games&&!games.some(game=>game.slug===row.game.slug)?[...games,row.game]:games);}}}
    catch{if(mounted.current)setResults(rows=>rows.map(item=>item.game.slug===row.game.slug?{...item,message:"Game could not be skipped. Please retry."}:item));}
    finally{if(mounted.current)setSaving(null);}
  }
  async function loadSkipped(){
    setLoadingSkipped(true);setSkipMessage("");
    try{const result=await listSkippedSteamCompletionGames();if(mounted.current){if(result.ok)setSkippedGames(result.games);setSkipMessage(result.message);}}
    catch{if(mounted.current)setSkipMessage("Skipped games could not be loaded. Please retry.");}
    finally{if(mounted.current)setLoadingSkipped(false);}
  }
  async function restore(game:{slug:string;title:string}){
    setSaving(game.slug);setSkipMessage("");
    try{const result=await restoreSteamCompletion(game.slug);if(mounted.current){setSkipMessage(result.message);if(result.ok){setResults(rows=>rows.map(row=>row.game.slug===game.slug?{...row,skipped:false,message:undefined}:row));setSkippedGames(games=>games?.filter(row=>row.slug!==game.slug)??null);setLastSkipped(previous=>previous?.slug===game.slug?null:previous);setMessage(result.message);restoreFocus.current=true;}}}
    catch{if(mounted.current)setSkipMessage("Game could not be restored. Please retry.");}
    finally{if(mounted.current)setSaving(null);}
  }
  return <div className="space-y-4"><div className="flex flex-wrap items-center gap-3"><button ref={scanButton} type="button" disabled={disabled||busy||saving!==null||remaining>0} onClick={()=>void scan()} className="min-h-11 rounded-xl bg-primary-container text-on-primary-container px-5 py-3 disabled:opacity-50">{t("Find completion dates")}</button><div className="basis-full xl:basis-0 xl:flex-1 min-w-0">{children}</div></div>{lastSkipped&&<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant/40 p-3"><p className="min-w-0 break-words"><span>{t("Skipped game")}: </span><span translate="no">{lastSkipped.title}</span></p><button ref={undoButton} type="button" disabled={busy||saving!==null} onClick={()=>void restore(lastSkipped)} className="min-h-11 rounded-lg px-4 text-primary underline disabled:opacity-50">{t("Undo skip")}</button></div>}{skipMessage&&<p role="status" className="text-body-sm text-primary">{t(skipMessage)}</p>}<details onToggle={event=>{if(event.currentTarget.open)void loadSkipped();}} className="rounded-xl border border-outline-variant/40 p-4"><summary className="min-h-11 cursor-pointer py-3 text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{t("Skipped games")}</summary><div className="space-y-3 pt-3"><p className="text-body-sm text-on-surface-variant">{t("Restore a game to include it in future completion scans. Your log stays unchanged.")}</p>{loadingSkipped?<p>{t("Loading…")}</p>:skippedGames?.length?<ul className="space-y-2">{skippedGames.map(game=><li key={game.slug} className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low p-3"><span translate="no" className="min-w-0 break-words">{game.title}</span><button type="button" disabled={busy||saving!==null} onClick={()=>void restore(game)} className="min-h-11 shrink-0 rounded-lg border border-outline-variant/40 px-4 text-primary disabled:opacity-50">{t("Restore game")}</button></li>)}</ul>:skippedGames&&<p>{t("No skipped games.")}</p>}<button type="button" onClick={()=>void loadSkipped()} disabled={loadingSkipped} className="min-h-11 px-3 text-primary disabled:opacity-50">{t("Refresh skipped games")}</button></div></details>{open&&<section aria-label={t("Steam completion dates")} className="rounded-xl border border-outline-variant/40 p-4 space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-title-lg font-semibold">{t("Steam completion dates")}</h2>{busy?<button type="button" className="min-h-11 px-3 text-primary" onClick={()=>{stopped.current=true;}}>{t("Stop scan")}</button>:<button type="button" disabled={saving!==null||remaining>0} className="min-h-11 px-3 text-primary disabled:opacity-50" onClick={()=>void scan(true)}>{t("Retry unfinished games")}{remaining>0&&` (${remaining}s)`}</button>}</div><p role="status">{progress.done} / {progress.total} · {t(message||"Checking Steam completion achievements…")}</p><div className="columns-1 gap-4 md:columns-2">{results.filter(row=>!row.saved&&!row.skipped&&(!row.result.ok||row.result.deferred||row.result.candidates.length)).map(row=><article key={row.game.slug} className="mb-4 inline-block w-full min-w-0 break-inside-avoid align-top rounded-xl bg-surface-container-low p-4 space-y-3"><div className="flex items-start justify-between gap-3"><h3 translate="no" className="min-w-0 flex-1 font-semibold break-words">{row.game.title}</h3><button type="button" disabled={saving!==null} onClick={()=>void skip(row)} className="min-h-11 shrink-0 rounded-xl border border-outline-variant/40 px-3 py-2 text-body-sm text-on-surface-variant hover:text-primary disabled:opacity-50">{t("Skip game")}</button></div>{row.result.deferred&&<p role="status" className="text-body-sm text-on-surface-variant">{t(row.result.message)}</p>}{row.result.ok?<SteamCompletionCandidates existing candidates={row.result.candidates} disabled={saving!==null} onAccept={candidate=>void confirm(row,candidate)}/>:<p>{t(row.result.message)}</p>}{row.message&&!row.saved&&<p role="alert">{t(row.message)}</p>}</article>)}</div>{!busy&&results.every(row=>row.result.ok&&!row.result.deferred)&&!results.some(row=>row.result.candidates.length)&&<p>{t("No completion achievement found. You can enter a date manually.")}</p>}</section>}</div>;
}
