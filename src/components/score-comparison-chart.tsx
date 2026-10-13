"use client";
import {useState} from "react";
import Link from "next/link";
import {useMessages} from "@/components/site-preferences";
const colors=["#e9ac42","#63b7df","#b897dc","#70c5a2","#f28b82","#c1c968","#ef9cce","#86a6eb","#dfae82","#81c6ce","#aab77b","#bf9ee5"];
type Point={slug:string;title:string;cover:string;x:number;y:number};
export function ScoreComparisonChart({points,leftName,rightName}:{points:Point[];leftName:string;rightName:string}){
  const t=useMessages();
  const [active,setActive]=useState(0);
  const selected=points[active];
  if(!selected)return null;
  return <div className="[container-type:inline-size]"><div className="grid gap-5 items-start [@container(min-width:700px)]:grid-cols-2">
    <div className="space-y-4 min-w-0">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1 w-full max-w-[420px] mx-auto">
        <p translate="no" className="self-center text-center text-body-sm text-on-surface-variant [writing-mode:vertical-rl] rotate-180 max-h-60 truncate" title={rightName}>Y · {rightName}</p>
        <svg role="img" aria-label={`${t("Shared score comparison")}: X — ${leftName}; Y — ${rightName}`} viewBox="0 0 360 340" className="w-full max-w-[400px] mx-auto text-on-surface-variant fill-current">
          <title>{t("Shared score comparison")}</title>
          <path d="M 40 20 V 300 H 340" fill="none" stroke="currentColor" />
          <path d="M 40 300 L 340 20" fill="none" stroke="currentColor" strokeDasharray="5 5" opacity="0.3" />
          {[0,50,100].map(n=><g key={n}><text x={40+n*3} y="320" textAnchor="middle" fontSize="12">{n}</text><text x="30" y={305-n*2.8} textAnchor="end" fontSize="12">{n}</text></g>)}
          {points.map((point,index)=><circle key={point.slug} data-score-point={point.slug} cx={40+point.x*3} cy={300-point.y*2.8} r="4.5" stroke="currentColor" strokeWidth="1" fill={colors[index%colors.length]} opacity={index===active ? 0 : 1} className="cursor-pointer" onPointerEnter={()=>setActive(index)} onPointerDown={()=>setActive(index)}><title>{`${index+1}. ${point.title}: ${leftName} ${point.x} / ${rightName} ${point.y}`}</title></circle>)}
          <circle pointerEvents="none" data-selected-score-point={selected.slug} cx={40+selected.x*3} cy={300-selected.y*2.8} r="7" fill={colors[active%colors.length]} stroke="currentColor" strokeWidth="2" />
          <text pointerEvents="none" x={40+selected.x*3} y={288-selected.y*2.8} textAnchor="middle" fontSize="12" fontWeight="700">{active+1}</text>
        </svg>
        <p translate="no" className="col-start-2 text-center text-body-sm text-on-surface-variant break-words">X · {leftName}</p>
      </div>
      <div aria-live="polite" aria-atomic="true" className="flex gap-3 rounded-xl border border-outline-variant/30 bg-surface p-3 min-w-0">
        <img src={selected.cover} alt="" loading="lazy" className="w-10 h-14 rounded object-cover shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <Link href={`/game/${selected.slug}`} translate="no" className="font-semibold text-body-md break-words hover:text-primary">{selected.title}</Link>
          <dl className="grid grid-cols-2 gap-3 text-body-sm">{[{axis:"X",name:leftName,score:selected.x},{axis:"Y",name:rightName,score:selected.y}].map(row=><div key={row.axis} className="min-w-0"><dt translate="no" className="truncate text-on-surface-variant" title={row.name}>{row.axis} · {row.name}</dt><dd className="font-semibold tabular-nums">{row.score}<span className="font-normal text-on-surface-variant"> / 100</span></dd></div>)}</dl>
        </div>
      </div>
    </div>
    <div className="min-w-0 space-y-3">
      <div><h3 className="font-semibold text-body-md">{t("Games on this chart")}</h3><p className="text-body-sm text-on-surface-variant mt-1">{t("Choose a game to highlight its point.")}</p></div>
      <ol aria-label={t("Games on this chart")} className="max-h-72 overflow-y-auto overscroll-contain space-y-1 pr-1">
        {points.map((point,index)=><li key={point.slug}><button type="button" aria-pressed={index===active} onFocus={()=>setActive(index)} onClick={()=>setActive(index)} className={`flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${index===active ? "border-outline-variant/50 bg-surface-container-high" : "border-transparent hover:bg-surface-container"}`}>
          <span aria-hidden="true" className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full border-2 px-1 text-[11px] font-semibold tabular-nums" style={{borderColor:colors[index%colors.length]}}>{index+1}</span>
          <span translate="no" className="min-w-0 flex-1 break-words text-body-sm font-medium">{point.title}</span>
          <span className="shrink-0 text-label-sm tabular-nums text-on-surface-variant">{point.x} / {point.y}</span>
        </button></li>)}
      </ol>
    </div>
  </div></div>;
}
