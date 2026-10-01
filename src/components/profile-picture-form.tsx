"use client";
import { useActionState, useState } from "react";
import { saveAvatar, removeAvatar } from "@/app/actions/avatar";
import { ProfileAvatar } from "@/components/profile-avatar";
import { useMessages } from "@/components/site-preferences";
import type { Profile } from "@/types/domain";
export function ProfilePictureForm({profile}: {profile:Profile}) {
  const t = useMessages();
  const [upload, uploadAction, uploading] = useActionState(saveAvatar,{message:""});
  const [removal, removeAction, removing] = useActionState(removeAvatar,{message:""});
  const [inputError, setInputError] = useState("");
  const pending = uploading || removing;
  return <section className="rounded-xl bg-surface-container-low p-5 sm:p-8 space-y-5"><h2 className="font-headline-lg text-headline-lg">{t("Profile picture")}</h2><div className="flex flex-wrap items-center gap-5"><ProfileAvatar src={profile.avatarUrl} name={profile.displayName} className="h-24 w-24 rounded-xl text-headline-xl" /><p className="flex-1 min-w-40 text-on-surface-variant">{t("JPEG, PNG or WebP, up to 2 MB. Your picture follows your profile’s visibility.")}</p></div><form action={uploadAction} className="space-y-4"><label className="block space-y-2"><span>{t("Choose a profile picture")}</span><input name="picture" type="file" accept="image/jpeg,image/png,image/webp" required disabled={pending} className="block max-w-full text-body-sm" onChange={event => {const file=event.target.files?.[0]; const invalid=Boolean(file && file.size > 2*1024*1024); setInputError(invalid ? "Choose a JPEG, PNG or WebP image up to 2 MB." : ""); if(invalid) event.target.value="";}} /></label><button disabled={pending || Boolean(inputError)} className="rounded-xl bg-primary-container text-on-primary-container px-5 py-3 disabled:opacity-50">{t(uploading ? "Saving…" : "Upload picture")}</button><p role="status" className="text-primary break-words">{t(inputError || upload.message)}</p></form>{profile.avatarUrl && <form action={removeAction}><button disabled={pending} className="px-4 py-2 bg-surface-container-high">{t(removing ? "Saving…" : "Remove picture")}</button></form>}<p role="status" className="text-primary">{t(removal.message)}</p></section>;
}
