"use client";
import {useRef,useState,useTransition,useEffect} from "react";
import {useReturnNavigation} from "@/components/return-navigation";
import {useMessages} from "@/components/site-preferences";
import {removeRating} from "@/app/actions/remove-rating";
export function RemoveLog({slug,title,updatedAt,onRemoved}:{slug:string;title:string;updatedAt:string|null;onRemoved:()=>void}){
 const t=useMessages(),{goBack}=useReturnNavigation(),dialog=useRef<HTMLDialogElement>(null);
 const [pending,startTransition]=useTransition(),[message,setMessage]=useState("");
 useEffect(()=>{const element=dialog.current;return ()=>element?.close();},[]);
 return <>
  <button type="button" className="min-h-11 text-error px-3 rounded-lg hover:bg-error/10" onClick={()=>{setMessage("");dialog.current?.showModal();}}>{t("Remove log")}</button>
  <dialog ref={dialog} aria-labelledby="remove-log-title" onCancel={event=>{if(pending)event.preventDefault();}} className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-lg max-h-[calc(100dvh_-_2rem)] overflow-y-auto rounded-2xl bg-surface-container-high text-on-surface p-6 shadow-2xl backdrop:bg-black/65">
   <h2 id="remove-log-title" className="font-headline-lg text-headline-lg">{t("Remove log")}</h2>
   <p translate="no" className="mt-3 font-semibold break-words">{title}</p>
   <p className="mt-3 text-on-surface-variant">{t("This removes your rating, tier, review, playtime and status for this game. Your favorite stays. This cannot be undone.")}</p>
   <p role="status" className="mt-3 text-error">{t(message)}</p>
   <div className="mt-5 flex justify-end gap-3">
    <button type="button" disabled={pending} onClick={()=>dialog.current?.close()} className="min-h-11 rounded-lg bg-surface-container px-4">{t("Cancel")}</button>
    <button type="button" disabled={pending} onClick={()=>startTransition(async()=>{
     const result=await removeRating(slug,updatedAt);setMessage(result.message);
     if(result.ok){onRemoved();dialog.current?.close();goBack();}
    })} className="min-h-11 rounded-lg bg-error text-on-error px-4 disabled:opacity-50">{t(pending?"Deleting…":"Remove permanently")}</button>
   </div>
  </dialog>
 </>;
}
