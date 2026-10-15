"use client";
import { useId, useRef, useState } from "react";
import { useMessages } from "@/components/site-preferences";
import { playedPlatformLabels } from "@/lib/played-platforms";
import type { PlayedPlatform } from "@/types/domain";

export function ConsolePlatformSelector({ family, value, onChange }: { family: "PlayStation" | "Xbox" | "Nintendo" | "Other platforms"; value: PlayedPlatform | null; onChange: (value: PlayedPlatform | null) => void }) {
  const t = useMessages();
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const prefix = family === "PlayStation" ? "ps" : family === "Xbox" ? "xbox" : family === "Nintendo" ? "nintendo_" : "other_";
  const selected = value?.startsWith(prefix) ?? false;
  const options = (Object.entries(playedPlatformLabels) as [PlayedPlatform, string][]).filter(([key]) => key.startsWith(prefix));
  return <>
    <button ref={trigger} type="button" popoverTarget={id} aria-haspopup="menu" aria-expanded={open} aria-pressed={selected} className={`platform-btn flex items-center gap-1.5 rounded px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${selected ? "bg-primary/15 text-primary shadow-sm" : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright hover:text-on-surface"}`}><span aria-hidden="true" className="material-symbols-outlined text-[14px]">sports_esports</span>{t(family)}<span aria-hidden="true" className="material-symbols-outlined text-[14px]">expand_more</span></button>
    <div ref={popup} id={id} popover="auto" role="menu" aria-label={t(family === "Other platforms" ? "Other platforms" : `${family} console`)} onToggle={event => {
      const expanded = event.newState === "open";
      setOpen(expanded);
      if (!expanded || !trigger.current || !popup.current) return;
      const rect = trigger.current.getBoundingClientRect();
      const height = popup.current.getBoundingClientRect().height;
      popup.current.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - 236))}px`;
      popup.current.style.top = `${Math.max(12, Math.min(rect.bottom + 8, innerHeight - height - 12))}px`;
      // The queued toggle event must not undo navigation already made inside the menu.
      if (!popup.current.contains(document.activeElement)) {
        popup.current.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
        if (!selected) popup.current.querySelector<HTMLButtonElement>('[role="menuitemradio"]')?.focus();
      }
    }} onKeyDown={event => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
      const index = items.indexOf(document.activeElement as HTMLButtonElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : items.length - 1)) % items.length;
      items[next]?.focus();
    }} className="fixed m-0 max-h-[calc(100dvh-1.5rem)] w-56 overflow-y-auto rounded-xl border border-outline-variant/40 bg-surface-container-high p-2 text-on-surface shadow-2xl">
      <p className="px-3 py-2 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{t("Choose console")}</p>
      {options.map(([key, label]) => <button key={key} type="button" role="menuitemradio" aria-checked={key === value} onClick={() => { onChange(key === value ? null : key); popup.current?.hidePopover(); trigger.current?.focus(); }} className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-body-md hover:bg-surface-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${key === value ? "bg-primary/15 text-primary" : "text-on-surface"}`}>{t(label)}{key === value && <span aria-hidden="true" className="material-symbols-outlined text-[18px]">check</span>}</button>)}
    </div>
  </>;
}
