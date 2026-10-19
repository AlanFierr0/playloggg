"use client";


import Link from "next/link";
import type { ReactNode } from "react";
import { usePortfolio } from "@/components/portfolio-provider";
import { useMessages } from "@/components/site-preferences";

export function GameLogAction({ slug, logged }: { slug: string; logged: boolean }) {
  const { access } = usePortfolio();
  const t = useMessages();
  if (!access?.canEdit) return null;
  return <ShelfLink slug={slug} className="absolute inset-x-2 bottom-2 z-10 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-2 py-2 text-center text-body-sm font-semibold text-on-primary shadow-md transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:pointer-events-none group-hover/game:opacity-100 group-hover/game:pointer-events-auto group-focus-within/game:opacity-100 group-focus-within/game:pointer-events-auto">{t(logged ? "Edit log entry" : "Log this game")}</ShelfLink>;
}

export function ShelfLink({ slug, className, children }: { slug: string; className?: string; children: ReactNode }) {
  const { access } = usePortfolio();
  return <Link prefetch={false} href={access?.canEdit ? `/log?game=${encodeURIComponent(slug)}` : `/login?next=${encodeURIComponent(`/log?game=${slug}`)}`} className={className}>{children}</Link>;
}
