"use client";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useMessages } from "@/components/site-preferences";
import { tiers } from "@/lib/portfolio-view";
import type { Tier } from "@/types/domain";

export function tierAtPoint(x:number,y:number): Tier|null|undefined {
  const value=document.elementFromPoint(x,y)?.closest<HTMLElement>("[data-tier-drop]")?.dataset.tierDrop;
  return value==="unassigned" ? null : tiers.includes(value as Tier) ? value as Tier : undefined;
}

export function TierDragHandle({title,disabled,cover=false,coverUrl,onStart,onEnd,onHover,onMove}:{title:string;disabled:boolean;cover?:boolean;coverUrl?:string;onStart:()=>void;onEnd:()=>void;onHover:(tier:Tier|null|undefined)=>void;onMove:(tier:Tier|null)=>void}) {
  const t=useMessages();
  const [dragging,setDragging]=useState(false);
  const point=useRef<{x:number;y:number;startX:number;startY:number;moved:boolean}|null>(null);
  const moved=useRef(false);
  const preview=useRef<HTMLDivElement>(null);
  const callbacks=useRef({onEnd,onHover});
  useEffect(()=>{callbacks.current={onEnd,onHover};},[onEnd,onHover]);
  useEffect(()=>{
    if(!dragging)return;
    let frame=0;
    function tick(){
      const current=point.current;
      if(current?.moved){
        if(preview.current){preview.current.style.visibility="visible";preview.current.style.transform=`translate3d(${Math.max(8,Math.min(innerWidth-248,current.x+16))}px,${Math.max(8,Math.min(innerHeight-88,current.y+16))}px,0)`;}
        const distance=current.y<80 ? -12 : current.y>innerHeight-80 ? 12 : 0;
        if(distance)window.scrollBy(0,distance);
        callbacks.current.onHover(tierAtPoint(current.x,current.y));
      }
      frame=requestAnimationFrame(tick);
    }
    function cancel(event:KeyboardEvent){if(event.key==="Escape"){point.current=null;setDragging(false);callbacks.current.onEnd();}}
    frame=requestAnimationFrame(tick);window.addEventListener("keydown",cancel);
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener("keydown",cancel);};
  },[dragging]);
  return <><button type="button" disabled={disabled} aria-label={`${t("Drag to change tier")}: ${title}`} title={t("Drag to change tier")} className={`z-10 min-h-11 min-w-11 shrink-0 touch-none cursor-grab active:cursor-grabbing disabled:opacity-50 ${cover ? "absolute inset-0" : "relative rounded bg-surface-container-high text-on-surface-variant"}`}
    onClick={event=>{if(moved.current){moved.current=false;return;}event.currentTarget.closest("[data-tier-game]")?.querySelector("select")?.focus();}}
    onKeyDown={event=>{if(event.key==="Enter"||event.key===" ")moved.current=false;}}
    onPointerDown={event=>{if(event.button!==0||disabled)return;event.preventDefault();moved.current=false;event.currentTarget.setPointerCapture(event.pointerId);point.current={x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,moved:false};setDragging(true);onStart();}}
    onPointerMove={event=>{const current=point.current;if(!current)return;current.x=event.clientX;current.y=event.clientY;current.moved ||= Math.hypot(current.x-current.startX,current.y-current.startY)>6;moved.current=current.moved;}}
    onPointerUp={event=>{const current=point.current;point.current=null;setDragging(false);onEnd();if(current?.moved){const tier=tierAtPoint(event.clientX,event.clientY);if(tier!==undefined)onMove(tier);}}}
    onPointerCancel={()=>{point.current=null;setDragging(false);onEnd();}}
    onLostPointerCapture={()=>{if(point.current){point.current=null;setDragging(false);onEnd();}}}>
    {!cover&&<span aria-hidden="true" className="material-symbols-outlined">drag_indicator</span>}
  </button>{dragging&&createPortal(<div ref={preview} data-tier-drag-preview aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[100] flex w-60 max-w-[calc(100vw-1rem)] items-center gap-3 rounded-xl border border-primary/50 bg-surface-container-high p-3 text-on-surface shadow-2xl" style={{visibility:"hidden"}}>{coverUrl&&<img src={coverUrl} alt="" className="h-14 w-10 shrink-0 rounded object-cover"/>}<span className="min-w-0 break-words text-body-sm font-semibold">{title}</span></div>,document.body)}</>;
}
