"use client";
import {useActionState,useEffect,useRef,useState} from "react";
import {signOut} from "@/app/actions/auth";
import {deleteAccount} from "@/app/actions/delete-profile";
import {useMessages} from "@/components/site-preferences";

export function ProfileAccountControls({handle}:{handle?:string}) {
  const t=useMessages();
  const dialog=useRef<HTMLDialogElement>(null);
  const [confirmation,setConfirmation]=useState("");
  const [state,action,pending]=useActionState(deleteAccount,{message:"",accountOnly:false});
  const expected=state.accountOnly ? "DELETE" : handle ?? "DELETE";
  const [signingOut,setSigningOut]=useState(false);
  const button="flex w-full min-h-12 items-center justify-center rounded-lg px-4 py-3 text-center text-body-sm font-medium bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-50";
  useEffect(()=>{const element=dialog.current;return ()=>element?.close();},[]);
  return <>
    <form action={async()=>{setSigningOut(true);try{await signOut();}finally{setSigningOut(false);}}}><button className={button} disabled={signingOut}>{t(signingOut?"Signing out…":"Sign out")}</button></form>
    <button type="button" className={`${button} text-error`} onClick={()=>{setConfirmation("");dialog.current?.showModal();}}>{t("Delete account")}</button>
    <dialog ref={dialog} aria-labelledby="delete-profile-title" onCancel={event=>{if(pending)event.preventDefault();}} className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-lg max-h-[calc(100dvh_-_2rem)] overflow-y-auto rounded-2xl bg-surface-container-high text-on-surface p-6 sm:p-8 shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-sm">
      <h2 id="delete-profile-title" className="font-headline-lg text-headline-lg">{t("Delete account")}</h2>
      <p className="mt-4 text-on-surface-variant">{t("This permanently deletes your account, profile, ratings, reviews, tags, favorites and uploaded pictures. You will be signed out and must register again to start over.")}</p>
      <form action={action} className="mt-6 space-y-4">
        <label className="block space-y-2"><span>{t(expected === "DELETE" ? "Type DELETE to confirm account deletion." : "Type your handle to confirm")}: <span translate="no">{expected}</span></span><input name="handle" autoComplete="off" required value={confirmation} disabled={pending} onChange={event=>setConfirmation(event.target.value)} className="w-full rounded-xl bg-surface-container p-3"/></label>
        <p role="status" className="text-error">{t(state.message)}</p>
        <div className="flex flex-wrap justify-end gap-3"><button type="button" disabled={pending} onClick={()=>dialog.current?.close()} className={button.replace("w-full","w-auto")}>{t("Cancel")}</button><button disabled={pending||confirmation!==expected} className="min-h-12 rounded-xl bg-error text-on-error px-5 py-3 disabled:opacity-50">{t(pending?"Deleting…":"Delete permanently")}</button></div>
      </form>
    </dialog>
  </>;
}
