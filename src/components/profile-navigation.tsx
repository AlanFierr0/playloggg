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
  return <nav aria-label={t("Profile sections")} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 rounded-xl bg-surface-container-low p-2">
    {items.map(([label, href]) => <Link key={href} href={href} aria-current={path === href ? "page" : undefined} className={`min-h-12 inline-flex justify-center items-center rounded-lg px-3 py-3 text-center font-label-md ${path === href ? "bg-primary-container text-on-primary-container font-semibold" : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"}`}>{t(label)}</Link>)}
  </nav>;
}
