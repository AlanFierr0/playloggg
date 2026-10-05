"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMessages } from "@/components/site-preferences";
import { usePortfolio } from "@/components/portfolio-provider";

export function DiscoverIntro({ preview }: { preview: ReactNode }) {
  const t = useMessages();
  const { access } = usePortfolio();
  return (
    <header className="site-container mx-auto w-full px-4 sm:px-6 lg:px-12 py-10 sm:py-16 lg:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="min-w-0 space-y-6">
          <p className="text-primary text-body-lg font-semibold">{t("Your games. Your taste.")}</p>
          <h1 className="max-w-[12ch] font-display-lg font-bold text-[40px] leading-[1.08] sm:text-[56px] xl:text-[64px] tracking-tight">{t("Build your gaming identity.")}</h1>
          <p className="max-w-[38ch] text-body-lg text-on-surface-variant">{t("Rate games. Rank your favorites. Compare your taste.")}</p>
          <div className="flex flex-col min-[400px]:flex-row flex-wrap gap-3 pt-2">
            <Link href="/profile" className="ui-action bg-primary text-on-primary">{t(access?.canEdit ? "Open your profile" : "Create your profile")}</Link>
            <Link href="/games" className="ui-action border border-outline text-on-surface hover:bg-surface-container">{t("Explore games")}</Link>
          </div>
        </div>
        {preview}
      </div>
    </header>
  );
}
