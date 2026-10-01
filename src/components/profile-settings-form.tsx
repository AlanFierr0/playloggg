"use client";
import { useMessages } from "@/components/site-preferences";

import Link from "next/link";
import { useActionState, useState } from "react";
import { updateProfile } from "@/app/actions/profile";
import type { Profile } from "@/types/domain";

const button = "inline-flex max-w-full rounded bg-primary-container px-5 py-3 font-label-md text-on-primary-container disabled:opacity-50";
export function ProfileSettingsForm({ profile }: { profile: Profile }) {
  const t = useMessages();
  const [namesState, namesAction, namesPending] = useActionState(updateProfile, { message: "" });
  const [visibilityState, visibilityAction, visibilityPending] = useActionState(updateProfile, { message: "" });
  const [handle, setHandle] = useState(profile.handle);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [copyMessage, setCopyMessage] = useState("");
  const pending = namesPending || visibilityPending;
  return <div className="space-y-8">
    <form action={namesAction} className="rounded-xl bg-surface-container-low p-5 sm:p-8 space-y-5">
      <input type="hidden" name="setting" value="names" />
      <h2 className="font-headline-lg text-headline-lg">{t("Profile names")}</h2>
      <label className="block space-y-2"><span>{t("Display name")}</span><input name="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={80} className="w-full min-w-0 rounded bg-surface-container p-3" disabled={pending} /></label>
      <label className="block space-y-2"><span>{t("Handle")}</span><input name="handle" value={handle} onChange={(event) => setHandle(event.target.value)} required minLength={3} maxLength={30} pattern="[a-z0-9][a-z0-9_]{2,29}" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-describedby="handle-help" className="w-full min-w-0 rounded bg-surface-container p-3" disabled={pending} /></label>
      <p id="handle-help" className="text-on-surface-variant font-body-sm text-body-sm">{t("Use lowercase letters, numbers or underscores. Changing your handle changes your public link; previous links will stop working.")}</p>
      <p role="status" className="text-primary break-words">{t(namesState.message)}</p>
      <button disabled={pending} className={button}>{namesPending ? t("Saving…") : t("Save names")}</button>
    </form>
    <form action={visibilityAction} className="rounded-xl bg-surface-container-low p-5 sm:p-8 space-y-5">
      <input type="hidden" name="setting" value="visibility" />
      <input type="hidden" name="visibility" value={profile.isPublic ? "private" : "public"} />
      <h2 className="font-headline-lg text-headline-lg">{t("Profile visibility")}</h2>
      <p className="text-primary">{profile.isPublic ? t("Public") : t("Private")}</p>
      <p className="text-on-surface-variant">{t("Publishing makes your profile names, ratings, tiers, playback details, reviews, tags and curated lists visible to anyone with the link. Your account email and Steam ID stay private.")}</p>
      <p className="text-on-surface-variant">{t("Profiles start private. You can make yours private again at any time; future public visits will no longer show it.")}</p>
      {profile.isPublic && <Link className="block break-all text-primary underline" href={`/u/${profile.handle}`}>{t("Open public profile: /u/")}{profile.handle}</Link>}
      {profile.isPublic && <button type="button" className="text-primary underline" onClick={async () => {
        try { await navigator.clipboard.writeText(new URL(`/u/${profile.handle}`, window.location.origin).href); setCopyMessage("Public profile link copied."); }
        catch { setCopyMessage("Open your public profile and copy the address from your browser."); }
      }}>{t("Copy public link")}</button>}
      <p role="status" className="text-on-surface-variant">{profile.isPublic ? t(copyMessage) : ""}</p>
      <p role="status" className="text-primary break-words">{t(visibilityState.message)}</p>
      <button disabled={pending} className={button}>{visibilityPending ? t("Saving…") : profile.isPublic ? t("Make profile private") : t("Publish profile and lists")}</button>
    </form>
  </div>;
}
