"use client";
import { useMessages } from "@/components/site-preferences";

import { useActionState, useState } from "react";
import { createProfile } from "@/app/actions/profile";

export function ProfileSetupForm({next=""}:{next?:string}) {
  const t = useMessages();
  const [state, action, pending] = useActionState(createProfile, { message: "" });
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const control = "block w-full rounded bg-surface-container px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary";
  return <form action={action} className="space-y-5"><input type="hidden" name="next" value={next} />
    <label className="block space-y-2"><span>{t("Handle")}</span><input className={control} name="handle" value={handle} onChange={(event) => setHandle(event.target.value)} required minLength={3} maxLength={30} pattern="[a-z0-9][a-z0-9_]{2,29}" autoComplete="username" aria-describedby="handle-help" /><span id="handle-help" className="block text-on-surface-variant text-body-sm">{t("3–30 lowercase letters, numbers or underscores.")}</span></label>
    <label className="block space-y-2"><span>{t("Display name")}</span><input className={control} name="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={80} autoComplete="nickname" /></label>
    <button type="submit" disabled={pending} className="w-full rounded bg-primary-container px-5 py-3 font-label-md text-on-primary-container disabled:opacity-50">{pending ? t("Creating…") : t("Create public profile")}</button>
    <p role="status" className="text-on-surface-variant">{t(state.message)}</p>
  </form>;
}
