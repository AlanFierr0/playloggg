"use client";
import { useMessages } from "@/components/site-preferences";


import { useEffect, useRef, useState } from "react";
import type { Tier } from "@/types/domain";

const tiers: (Tier | null)[] = ["S", "A", "B", "C", "D", "F", null];
const labels: Record<Tier, string> = {
  S: "Apex Masterpiece", A: "Essential Archive", B: "Commended",
  C: "Flawed Experiment", D: "D", F: "F",
};
const colors: Record<Tier, string> = {
  S: "bg-primary/10 text-primary", A: "bg-secondary/10 text-secondary", B: "bg-tertiary/10 text-tertiary",
  C: "bg-surface-container-high text-on-surface-variant", D: "bg-surface-container-high text-on-surface-variant", F: "bg-error/10 text-error",
};

export function TierBadge({ value, onChange }: { value: Tier | null; onChange: (tier: Tier | null) => void }) {
  const t = useMessages();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    if (!open) return;
    items.current[tiers.indexOf(value)]?.focus();
    function dismiss(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", dismiss);
    return () => document.removeEventListener("mousedown", dismiss);
  }, [open, value]);
  return (
    <div className="relative max-w-full" ref={root}>
      <button ref={trigger} id="tier-badge" type="button" aria-label={t(`Choose tier, currently ${value ?? "unassigned"}`)} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm tracking-wider uppercase flex items-center gap-1.5 transition-all ${value ? colors[value] : "bg-surface-container-high text-on-surface-variant"}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        <span id="tier-label">{value ? `${t("Tier")} ${value}${value === "D" || value === "F" ? "" : ` · ${t(labels[value])}`}` : t("Unassigned tier")}</span>
      </button>
      {open && (
        <div role="menu" aria-label={t("Independent tier")} className="absolute right-0 top-full z-20 mt-2 w-52 max-w-[calc(100vw-4rem)] rounded-lg bg-surface-container-high p-1 shadow-2xl ring-1 ring-outline-variant" onKeyDown={(event) => {
          if (event.key === "Escape") { event.stopPropagation(); setOpen(false); trigger.current?.focus(); }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const current = items.current.findIndex((item) => item === document.activeElement);
            items.current[(current + (event.key === "ArrowDown" ? 1 : tiers.length - 1)) % tiers.length]?.focus();
          }
        }}>
          {tiers.map((tier, index) => (
            <button ref={(element) => { items.current[index] = element; }} key={tier ?? "unassigned"} role="menuitemradio" aria-checked={value === tier} type="button" className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left font-label-md text-label-md hover:bg-surface-container-highest ${value === tier ? "text-primary" : "text-on-surface"}`} onClick={() => { onChange(tier); setOpen(false); trigger.current?.focus(); }}>
              <span className="w-4">{tier ?? "—"}</span><span className="font-body-sm text-body-sm">{tier ? tier === "D" || tier === "F" ? t(`Tier ${tier}`) : t(labels[tier]) : t("Unassigned")}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScoreStars({ score }: { score: number }) {
  const t = useMessages();
  const full = Math.floor(score / 20);
  const half = score % 20 >= 10;
  return (
    <div className="flex flex-wrap justify-center items-center gap-1.5 text-primary mt-1" id="star-display" aria-label={t(`${(score / 20).toFixed(1)} out of 5 equivalent`)}>
      {Array.from({ length: 5 }, (_, index) => <span key={index} aria-hidden="true" className={`material-symbols-outlined text-[20px] ${index < full || (index === full && half) ? "" : "text-on-surface-variant/40"}`} style={{ fontVariationSettings: index < full || (index === full && half) ? "'FILL' 1" : "'FILL' 0" }}>{index < full ? "star" : index === full && half ? "star_half" : "star"}</span>)}
      <span className="font-label-sm text-label-sm text-on-surface-variant ml-2 tracking-widest">({(score / 20).toFixed(1)} {t("/ 5.0 Equiv)")}</span>
    </div>
  );
}
