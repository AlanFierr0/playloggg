"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { listSteamCompletionLogs,getSteamCompletionSuggestions,confirmSteamCompletion,skipSteamCompletion,type SteamCompletionLog,type SteamCompletionResult } from "@/app/actions/steam-library";
import { getGamePlayStyle } from "@/app/actions/play-style";
import { useMessages } from "@/components/site-preferences";
import { SteamCompletionCandidates } from "@/components/steam-completion-candidates";
import type { SteamCompletionCandidate } from "@/lib/steam-completion-input";
type Result={game:SteamCompletionLog;result:SteamCompletionResult;message?:string;saved?:boolean;skipped?:boolean};
export function SteamCompletionScan({profileId,disabled,children}:{profileId:number;disabled:boolean;children:ReactNode}) {
  const t=useMessages();const stopped=useRef(false);const running=useRef(false);const mounted=useRef(true);
  const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[results,setResults]=useState<Result[]>([]),[message,setMessage]=useState("");
  const [progress,setProgress]=useState({done:0,total:0});const [saving,setSaving]=useState<string|null>(null);
  useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;stopped.current=true;};},[]);
  async function scan(retry=false){
    if(running.current)return;running.current=true;stopped.current=false;setOpen(true);setBusy(true);setMessage("");
    try {
      const list=await listSteamCompletionLogs();if(!mounted.current)return;if(!list.ok){setMessage(list.message);return;}
      const games=retry?list.games.filter(game=>!results.some(row=>row.game.slug===game.slug&&(row.saved||row.skipped||row.result.ok))):list.games;
      if(!retry)setResults([]);setProgress({done:0,total:games.length});
      for(let offset=0;offset<games.length&&!stopped.current;offset+=5){
        const batch=games.slice(offset,offset+5);let cursor=0;
        async function worker(){while(cursor<batch.length&&!stopped.current){const game=batch[cursor++];let result:SteamCompletionResult;
          try {
            let localStyle:string|null=null;try{localStyle=localStorage.getItem(`playlogg-play-style:${profileId}:${game.slug}`);}catch{}
            const style=localStyle??await getGamePlayStyle(game.slug);
            result=style==="ongoing"?{ok:true,message:"Ongoing online games are excluded from completion suggestions.",candidates:[],releasedOn:null,updatedAt:game.updatedAt}:await getSteamCompletionSuggestions(game.appId,game.slug,retry);
          }catch{result={ok:false,message:"Steam achievements unavailable. You can enter a date manually.",candidates:[],releasedOn:null,updatedAt:null};}
          if(!mounted.current)return;
          setResults(rows=>[...rows.filter(row=>row.game.slug!==game.slug),{game,result}]);setProgress(value=>({...value,done:value.done+1}));
        }}
        await Promise.all([worker(),worker()]);
      }
      if(mounted.current)setMessage(stopped.current?"Scan stopped. Run it again to check remaining games.":"Scan finished. Only confirmed dates are saved.");
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
    try{const result=await skipSteamCompletion(row.game.slug);if(mounted.current){setResults(rows=>rows.map(item=>item.game.slug===row.game.slug?{...item,message:result.message,skipped:result.ok}:item));if(result.ok)setMessage(result.message);}}
    catch{if(mounted.current)setResults(rows=>rows.map(item=>item.game.slug===row.game.slug?{...item,message:"Game could not be skipped. Please retry."}:item));}
    finally{if(mounted.current)setSaving(null);}
  }
  return <div className="space-y-4"><div className="flex flex-wrap items-center gap-3"><button type="button" disabled={disabled||busy||saving!==null} onClick={()=>void scan()} className="min-h-11 rounded-xl bg-primary-container text-on-primary-container px-5 py-3 disabled:opacity-50">{t("Find completion dates")}</button><div className="basis-full xl:basis-0 xl:flex-1 min-w-0">{children}</div></div>{open&&<section aria-label={t("Steam completion dates")} className="rounded-xl border border-outline-variant/40 p-4 space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-title-lg font-semibold">{t("Steam completion dates")}</h2>{busy?<button type="button" className="min-h-11 px-3 text-primary" onClick={()=>{stopped.current=true;}}>{t("Stop scan")}</button>:<button type="button" disabled={saving!==null} className="min-h-11 px-3 text-primary" onClick={()=>void scan(true)}>{t("Retry unfinished games")}</button>}</div><p role="status">{progress.done} / {progress.total} · {t(message||"Checking Steam completion achievements…")}</p><div className="columns-1 gap-4 md:columns-2">{results.filter(row=>!row.saved&&!row.skipped&&(!row.result.ok||row.result.candidates.length)).map(row=><article key={row.game.slug} className="mb-4 inline-block w-full min-w-0 break-inside-avoid align-top rounded-xl bg-surface-container-low p-4 space-y-3"><div className="flex items-start justify-between gap-3"><h3 translate="no" className="min-w-0 flex-1 font-semibold break-words">{row.game.title}</h3><button type="button" disabled={saving!==null} onClick={()=>void skip(row)} className="min-h-11 shrink-0 rounded-xl border border-outline-variant/40 px-3 py-2 text-body-sm text-on-surface-variant hover:text-primary disabled:opacity-50">{t("Skip game")}</button></div>{row.result.ok?<SteamCompletionCandidates existing candidates={row.result.candidates} disabled={saving!==null} onAccept={candidate=>void confirm(row,candidate)}/>:<p>{t(row.result.message)}</p>}{row.message&&!row.saved&&<p role="alert">{t(row.message)}</p>}</article>)}</div>{!busy&&!results.some(row=>row.result.candidates.length)&&<p>{t("No completion achievement found. You can enter a date manually.")}</p>}</section>}</div>;
}
