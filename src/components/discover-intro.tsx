"use client";
import Link from "next/link";
import { useMessages } from "@/components/site-preferences";
import { usePortfolio } from "@/components/portfolio-provider";
export function DiscoverIntro() {
  const t = useMessages(),
    { access } = usePortfolio();
  return (
    <header className="w-full site-container mx-auto px-4 sm:px-6 lg:px-12 pt-10 sm:pt-16 pb-8 space-y-6">
      <p className="text-primary font-label-md uppercase tracking-widest">
        {t("Your games. Your taste.")}
      </p>
      <h1 className="max-w-4xl font-display-lg text-display-lg sm:text-[64px] sm:leading-[68px] tracking-tight">
        {t("Build your gaming identity.")}
      </h1>
      <p className="max-w-2xl text-body-lg text-on-surface-variant">
        {t("Rate games. Rank your favorites. Compare your taste.")}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/profile"
          className="inline-flex items-center rounded bg-primary px-6 py-3 text-on-primary font-label-md"
        >
          {t(access?.canEdit ? "Open your profile" : "Create your profile")}
        </Link>
        <Link
          href="/people"
          className="inline-flex items-center rounded bg-surface-container px-6 py-3 text-on-surface font-label-md"
        >
          {t("Explore profiles")}
        </Link>
        <Link
          href="/games"
          className="inline-flex items-center rounded bg-surface-container px-6 py-3 text-on-surface font-label-md"
        >
          {t("Explore games")}
        </Link>
        <Link
          href="/compare"
          className="inline-flex items-center rounded px-6 py-3 text-primary font-label-md"
        >
          {t("Compare profiles")}
        </Link>
      </div>
    </header>
  );
}
