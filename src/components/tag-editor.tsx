"use client";
import { useMessages } from "@/components/site-preferences";

import { useState } from "react";
import { normalizeTags } from "@/lib/collection-input";

export function TagEditor({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const t = useMessages();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  function add() {
    const next = normalizeTags([...tags, label]);
    if (!next) { setError("Use a label of 1–48 characters, with up to 20 tags per game."); return; }
    onChange(next); setLabel(""); setAdding(false); setError("");
  }
  return <div className="flex flex-col gap-2.5">
    <div className="flex flex-wrap items-center justify-between gap-3"><span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{t("Archival Shelves & Curatorial Badges")}</span><span className="font-label-sm text-label-sm text-on-surface-variant">{tags.length}{t("/20 tags")}</span></div>
    <div className="flex flex-wrap gap-2" id="tag-pills">
      {tags.map((tag) => <button key={tag.toLowerCase()} type="button" aria-label={t(`Remove tag ${tag}`)} onClick={() => onChange(tags.filter((item) => item !== tag))} className="tag-pill max-w-full min-w-0 break-words text-left px-3 py-1.5 rounded font-label-sm text-label-sm uppercase bg-primary/10 text-primary flex items-center gap-1.5"><span className="min-w-0 break-words">{tag}</span><span aria-hidden="true" className="material-symbols-outlined text-[13px]">close</span></button>)}
      <button id="add-tag" type="button" disabled={tags.length >= 20} onClick={() => setAdding(true)} className="px-2.5 py-1.5 rounded font-label-sm text-label-sm uppercase bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center gap-1 disabled:opacity-50"><span className="material-symbols-outlined text-[14px]" aria-hidden="true">add</span>{t("Add Tag")}</button>
    </div>
    {adding && <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="tag-label" className="sr-only">{t("Tag label")}</label><input id="tag-label" autoFocus value={label} maxLength={48} onChange={(event) => setLabel(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } if (event.key === "Escape") { setAdding(false); setLabel(""); setError(""); } }} className="min-w-0 flex-1 rounded bg-surface-container px-3 py-2 text-on-surface" placeholder={t("e.g. Favorites")} />
      <button id="confirm-tag" type="button" onClick={add} className="rounded bg-primary-container px-3 py-2 text-on-primary-container">{t("Add")}</button><button type="button" onClick={() => { setAdding(false); setLabel(""); setError(""); }} className="px-2 py-2 text-on-surface-variant">{t("Cancel")}</button>
    </div>}
    {error && <p role="alert" className="text-error font-body-sm text-body-sm">{t(error)}</p>}
    <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Click a tag to remove it. Commit to Log saves your tags.")}</p>
  </div>;
}
