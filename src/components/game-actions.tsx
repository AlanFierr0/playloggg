"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { usePortfolio } from "@/components/portfolio-provider";
import { useNotice } from "@/components/preview-action";

export function ShelfLink({ slug, className, children }: { slug: string; className?: string; children: ReactNode }) {
  const { access } = usePortfolio();
  return <Link href={access?.canEdit ? `/log?game=${encodeURIComponent(slug)}` : "/login"} className={className}>{children}</Link>;
}

export function ShareGameButton({ slug, className, children }: { slug: string; className?: string; children: ReactNode }) {
  const notify = useNotice();
  const [fallback, setFallback] = useState("");
  async function share() {
    const url = new URL(`/game/${encodeURIComponent(slug)}`, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setFallback("");
      notify("Game link copied. Your profile visibility has not changed.");
    } catch {
      setFallback(url);
      notify("Copying is unavailable in this browser. Select and copy the game link below.");
    }
  }
  return <>
    <button type="button" aria-label="Copy game link" title="Copy game link" className={className} onClick={share}>{children}</button>
    {fallback && <label className="basis-full min-w-0 text-body-sm text-on-surface-variant">Game link<input aria-label="Game link" readOnly value={fallback} onFocus={(event) => event.currentTarget.select()} className="block w-full rounded bg-surface-container p-2 text-on-surface" /></label>}
  </>;
}
