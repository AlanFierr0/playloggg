"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMessages } from "@/components/site-preferences";
import { usePortfolio } from "@/components/portfolio-provider";

export function ProfileNavigation() {
  const t = useMessages();
  const { publicBase } = usePortfolio();
  const path = usePathname();
  const base = publicBase ?? "/profile";
  const items = [
    ["Overview", base], ["Ranking", `${base}/ranking`],
    ["Tier List", publicBase ? `${base}/tiers` : "/tiers"],
    ["Lists", publicBase ? `${base}/lists` : "/lists"],
    ["Reviews", `${base}/reviews`], ["Stats", `${base}/stats`],
  ];
  return <nav aria-label={t("Profile sections")} className="flex flex-wrap gap-x-5 gap-y-2 border-b border-outline-variant/30 pb-4">
    {items.map(([label, href]) => <Link key={href} href={href} aria-current={path === href ? "page" : undefined} className={`min-h-11 inline-flex items-center font-label-md ${path === href ? "text-primary font-semibold" : "text-on-surface-variant hover:text-primary"}`}>{t(label)}</Link>)}
  </nav>;
}
