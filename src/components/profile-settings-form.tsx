"use client";
import { useMessages } from "@/components/site-preferences";

import { ProfilePictureForm } from "@/components/profile-picture-form";
import Link from "next/link";
import { useActionState, useState } from "react";
import { updateProfile } from "@/app/actions/profile";
import type { Profile } from "@/types/domain";

const button = "inline-flex max-w-full rounded bg-primary-container px-5 py-3 font-label-md text-on-primary-container disabled:opacity-50";
export function ProfileSettingsForm({ profile }: { profile: Profile }) {
  const t = useMessages();
  const [namesState, namesAction, namesPending] = useActionState(updateProfile, { message: "" });
  const [visibilityState, visibilityAction, visibilityPending] = useActionState(updateProfile, { message: "" });
  const [discoveryState, discoveryAction, discoveryPending] = useActionState(updateProfile, {message:""});
  const [handle, setHandle] = useState(profile.handle);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [identityState, identityAction, identityPending] = useActionState(updateProfile, { message: "" });
  const [bio, setBio] = useState(profile.bio ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [platformPreference, setPlatformPreference] = useState(profile.platformPreference ?? "");
  const [copyMessage, setCopyMessage] = useState("");
  const pending = namesPending || visibilityPending || identityPending || discoveryPending;
  return <div className="space-y-6">
    <section id="settings-identity" aria-labelledby="settings-identity-title" className="scroll-mt-24 space-y-5 rounded-xl bg-surface-container-low p-5 sm:p-6">
      <h2 id="settings-identity-title" className="font-headline-lg text-headline-lg">{t("Profile identity")}</h2>
      <ProfilePictureForm profile={profile} />
<form action={namesAction} className="space-y-4 border-t border-outline-variant/30 pt-5">
      <input type="hidden" name="setting" value="names" />
      <h3 className="font-headline-md text-headline-md">{t("Profile names")}</h3>
      <label className="block space-y-2"><span>{t("Display name")}</span><input name="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={80} className="catalog-control p-3" disabled={pending} /></label>
      <label className="block space-y-2"><span>{t("Handle")}</span><input name="handle" value={handle} onChange={(event) => setHandle(event.target.value)} required minLength={3} maxLength={30} pattern="[a-z0-9][a-z0-9_]{2,29}" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-describedby="handle-help" className="catalog-control p-3" disabled={pending} /></label>
      <p id="handle-help" className="text-on-surface-variant font-body-sm text-body-sm">{t("Use lowercase letters, numbers or underscores. Changing your handle changes your public link; previous links will stop working.")}</p>
      <p role="status" className="text-primary break-words">{t(namesState.message)}</p>
      <button disabled={pending} className={button}>{namesPending ? t("Saving…") : t("Save names")}</button>
    </form>
<form action={identityAction} className="space-y-4 border-t border-outline-variant/30 pt-5">
      <input type="hidden" name="setting" value="identity" />
      <h3 className="font-headline-md text-headline-md">{t("About you")}</h3>
      <p className="text-on-surface-variant">{t("These fields are optional and become visible when you publish your profile.")}</p>
      <label className="block space-y-2"><span>{t("Bio")}</span><textarea name="bio" value={bio} onChange={event => setBio(event.target.value)} maxLength={500} rows={4} disabled={pending} className="catalog-control p-3" /></label>
      <label className="block space-y-2"><span>{t("Location")}</span><input name="location" value={location} onChange={event => setLocation(event.target.value)} maxLength={80} disabled={pending} className="catalog-control p-3" /></label>
      <label className="block space-y-2"><span>{t("Platform preference")}</span><input name="platformPreference" value={platformPreference} onChange={event => setPlatformPreference(event.target.value)} maxLength={80} disabled={pending} className="catalog-control p-3" /></label>
      <p role="status" className="text-primary break-words">{t(identityState.message)}</p>
      <button disabled={pending} className={button}>{identityPending ? t("Saving…") : t("Save profile details")}</button>
    </form>
    </section>
    <section id="settings-privacy" aria-labelledby="settings-privacy-title" className="scroll-mt-24 space-y-5 rounded-xl bg-surface-container-low p-5 sm:p-6">
      <h2 id="settings-privacy-title" className="font-headline-lg text-headline-lg">{t("Privacy")}</h2>
<form action={visibilityAction} className="space-y-4 border-t border-outline-variant/30 pt-5">
      <input type="hidden" name="setting" value="visibility" />
      <input type="hidden" name="visibility" value={profile.isPublic ? "private" : "public"} />
      <h3 className="font-headline-md text-headline-md">{t("Profile visibility")}</h3>
      <p className="text-primary">{profile.isPublic ? t("Public") : t("Private")}</p>
      <p className="text-on-surface-variant">{t("Publishing makes your profile and its public data visible to anyone with the link. Your account email and Steam ID stay private.")}</p>
      <p className="text-on-surface-variant">{t("Profiles start public. You can make yours private at any time; future public visits will no longer show it.")}</p>
      {profile.isPublic && <Link className="block break-all text-primary underline" href={`/u/${profile.handle}`}>{t("Open public profile: /u/")}{profile.handle}</Link>}
      {profile.isPublic && <button type="button" className="text-primary underline" onClick={async () => {
        try { await navigator.clipboard.writeText(new URL(`/u/${profile.handle}`, window.location.origin).href); setCopyMessage("Public profile link copied."); }
        catch { setCopyMessage("Open your public profile and copy the address from your browser."); }
      }}>{t("Copy public link")}</button>}
      <p role="status" className="text-on-surface-variant">{profile.isPublic ? t(copyMessage) : ""}</p>
      <p role="status" className="text-primary break-words">{t(visibilityState.message)}</p>
      <button disabled={pending} className={button}>{visibilityPending ? t("Saving…") : profile.isPublic ? t("Make profile private") : t("Publish profile")}</button>
    </form>
<form action={discoveryAction} className="space-y-4 border-t border-outline-variant/30 pt-5"><input type="hidden" name="setting" value="discovery"/><input type="hidden" name="discovery" value={profile.isDiscoverable?"off":"on"}/><h3 className="font-headline-md text-headline-md">{t("Profile discovery")}</h3><p className="text-on-surface-variant">{t("Discovery includes your public profile in browsing and recommendations and allows new followers. Public profiles remain searchable by name when discovery is off.")}</p>{profile.isPublic&&<p className="text-primary">{t(profile.isDiscoverable?"Included in discovery":"Excluded from discovery")}</p>}<button disabled={pending || (!profile.isPublic&&!profile.isDiscoverable)} className={button}>{t(discoveryPending?"Saving…":profile.isDiscoverable?"Leave discovery":"Join discovery")}</button>{!profile.isPublic&&<p className="text-body-sm text-on-surface-variant">{t("Publish your profile before opting into discovery.")}</p>}<p role="status">{t(discoveryState.message)}</p></form>
    </section>
  </div>;
}
