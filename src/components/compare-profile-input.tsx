"use client";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { ProfileAvatar } from "@/components/profile-avatar";
import { useMessages } from "@/components/site-preferences";
import type { Profile } from "@/types/domain";

export function CompareProfileInput({ name, label, initialValue }: { name: string; label: string; initialValue: string }) {
  const t = useMessages(), id = useId();
  const [query, setQuery] = useState(initialValue), [open, setOpen] = useState(false), [active, setActive] = useState(-1);
  const [result, setResult] = useState<{ query: string; profiles: Profile[]; hasMore?: boolean; error?: boolean } | null>(null);
  const profiles = result?.query === query ? result.profiles : [];
  const expanded = open && Boolean(query.trim());
  useEffect(() => {
    if (!expanded) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/profiles/search?q=${encodeURIComponent(query)}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Profile search failed.");
        const data: { profiles: Profile[]; hasMore: boolean } = await response.json();
        if (!controller.signal.aborted) setResult({ query, profiles: data.profiles, hasMore: data.hasMore });
      } catch {
        if (!controller.signal.aborted) setResult({ query, profiles: [], error: true });
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, expanded]);
  function choose(profile: Profile) { setQuery(profile.handle); setOpen(false); setActive(-1); }
  return <div className="relative min-w-0 space-y-2" onBlur={event => {
    // Keep the mobile submit button in place until its click completes.
    const target = event.relatedTarget;
    const submitting = target instanceof HTMLButtonElement && target.type === "submit" && target.form === event.currentTarget.closest("form");
    if (!submitting && !event.currentTarget.contains(target)) setOpen(false);
  }}>
    <label htmlFor={id} className="block text-body-sm text-on-surface-variant">{t(label)}</label>
    <input id={id} role="combobox" aria-autocomplete="list" aria-expanded={expanded} aria-controls={`${id}-results`} aria-activedescendant={expanded && profiles[active] ? `${id}-option-${active}` : undefined} className="catalog-control" placeholder={t("Profile handle")} name={name} value={query} required maxLength={30} autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false}
      onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setOpen(true); setActive(-1); }}
      onKeyDown={event => {
        if (event.key === "Escape") { event.preventDefault(); setOpen(false); setActive(-1); }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); if (profiles.length) setActive(index => event.key === "ArrowDown" ? (index + 1) % profiles.length : index <= 0 ? profiles.length - 1 : index - 1); }
        if (event.key === "Enter" && expanded && profiles[active]) { event.preventDefault(); choose(profiles[active]); }
      }} />
    {expanded && <div className="relative z-30 mt-2 sm:absolute sm:inset-x-0 sm:top-full overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high shadow-xl">
      <div id={`${id}-results`} role="listbox" aria-label={t("Matching profiles")} className="max-h-72 overflow-y-auto">
        {profiles.map((profile, index) => <button key={profile.id} id={`${id}-option-${index}`} type="button" role="option" aria-selected={active === index} tabIndex={-1} onPointerDown={event => event.preventDefault()} onClick={() => choose(profile)} onMouseEnter={() => setActive(index)} className={`flex min-h-14 w-full items-center gap-3 px-3 py-2 text-left ${active === index ? "bg-primary/10" : "hover:bg-surface-container"}`}>
          <ProfileAvatar src={profile.avatarUrl} name={profile.displayName} className="h-8 w-8 shrink-0 rounded-full" />
          <span className="min-w-0"><span translate="no" className="block truncate text-body-md font-semibold text-on-surface">{profile.displayName}</span><span translate="no" className="block truncate text-body-sm text-on-surface-variant">@{profile.handle}</span></span>
        </button>)}
      </div>
      {result?.query === query && result.hasMore && <Link href={`/people?q=${encodeURIComponent(query)}`} className="block border-t border-outline-variant/30 px-4 py-3 text-body-sm text-primary hover:bg-surface-container">{t("View all matching profiles")}</Link>}
      {!profiles.length && <p role="status" className="px-3 py-4 text-body-sm text-on-surface-variant">{t(result?.query !== query ? "Searching profiles…" : result.error ? "Profile search could not be loaded." : "No profiles match this search.")}</p>}
    </div>}
  </div>;
}
