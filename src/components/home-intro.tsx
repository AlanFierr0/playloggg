"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMessages } from "@/components/site-preferences";
import { usePortfolio } from "@/components/portfolio-provider";
import type { Game } from "@/types/domain";
import { GameLogAction } from "@/components/game-actions";

export function HomeIntro({ preview, recent }: { preview: ReactNode; recent: Pick<Game, "slug" | "title" | "cover">[] }) {
  const t = useMessages();
  const { access, profile } = usePortfolio();
  if (access?.canEdit) return (
    <header className="site-container mx-auto w-full px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between pb-8 border-b border-outline-variant/30">
        <div className="min-w-0 space-y-3">
          <p className="font-label-sm text-label-sm uppercase tracking-widest text-primary">{t("Your games. Your taste.")}</p>
          <h1 className="font-headline-xl font-bold text-[28px] sm:text-[40px] leading-tight tracking-tight">{t("Welcome back,")} <span translate="no" className="text-primary break-words">{profile.displayName}.</span></h1>
          <p className="max-w-xl text-body-md text-on-surface-variant">{t("Pick up where you left off. Log a game, update your profile or arrange your tiers.")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 xl:shrink-0">
          <Link href="/log" className="ui-action bg-primary text-on-primary"><span aria-hidden="true" className="material-symbols-outlined text-[20px]">add</span>{t("Log a game")}</Link>
          <Link href="/profile" className="ui-action bg-surface-container-low text-on-surface hover:bg-surface-container-high">{t("Open your profile")}</Link>
          <Link href="/tiers" className="ui-action text-primary hover:bg-surface-container">{t("Tier List")}<span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
        </div>
      </div>
      <section aria-label={t("Recently logged")} className="pt-7 space-y-5">
        <h2 className="font-headline-md text-headline-md font-semibold">{t("Recently logged")}</h2>
        {recent.length ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
          {recent.map(game => <div key={game.slug} className="group/game min-w-0 flex flex-col xl:flex-row gap-3 xl:gap-4">
            <div className="relative w-full max-w-40 xl:w-28 xl:shrink-0">
              <Link href={`/game/${game.slug}`} aria-label={game.title} className="block rounded-xl"><img src={game.cover} alt="" width={180} height={240} className="aspect-[3/4] w-full rounded-xl object-cover bg-surface-container-high transition-opacity group-hover/game:opacity-90" /></Link>
              <GameLogAction slug={game.slug} logged />
            </div>
            <div className="min-w-0 xl:pt-2 space-y-2">
              <Link href={`/game/${game.slug}`} translate="no" className="block font-headline-md text-body-lg font-semibold line-clamp-3 group-hover/game:text-primary">{game.title}</Link>
            </div>
          </div>)}
        </div> : <p className="rounded-xl bg-surface-container-low p-6 text-on-surface-variant">{t("Your next game starts here. Log your first game to build your collection.")}</p>}
      </section>
    </header>
  );
  return (
    <header className="site-container mx-auto w-full px-4 sm:px-6 lg:px-12 py-6 sm:py-10 lg:py-20">
      <div className="grid items-center gap-4 sm:gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <p className="text-primary text-body-lg font-semibold">{t("Your games. Your taste.")}</p>
          <h1 className="max-w-[12ch] font-display-lg font-bold text-[40px] leading-[1.08] sm:text-[56px] xl:text-[64px] tracking-tight">{t("Build your gaming identity.")}</h1>
          <p className="max-w-[38ch] text-body-lg text-on-surface-variant">{t("Rate games. Rank your favorites. Compare your taste.")}</p>
          <div className="flex flex-col min-[400px]:flex-row flex-wrap gap-3 pt-2">
            <Link href={access?.signedIn ? "/signup" : "/login?mode=register"} className="ui-action bg-primary text-on-primary">{t("Create your profile")}</Link>
            <Link href="/games" className="ui-action border border-outline text-on-surface hover:bg-surface-container">{t("Explore games")}</Link>
          </div>
        </div>
        {preview}
      </div>
    </header>
  );
}
