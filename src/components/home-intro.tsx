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
  return (
    <header className="site-container mx-auto w-full px-4 sm:px-6 lg:px-12 py-6 sm:py-10 lg:py-20">
      <div className="grid items-center gap-4 sm:gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <p className="text-primary text-body-lg font-semibold">{t("Your games. Your taste.")}</p>
          <h1 className="max-w-[12ch] font-display-lg font-bold text-[40px] leading-[1.08] sm:text-[56px] xl:text-[64px] tracking-tight">{access?.canEdit ? <>{t("Welcome back,")} <span translate="no" className="break-words">{profile.displayName}.</span></> : t("Build your gaming identity.")}</h1>
          <p className="max-w-[38ch] text-body-lg text-on-surface-variant">{t(access?.canEdit ? "Pick up where you left off. Log a game, update your profile or arrange your tiers." : "Rate games. Rank your favorites. Compare your taste.")}</p>
          <div className="flex flex-col min-[400px]:flex-row flex-wrap gap-3 pt-2">
            <Link href={access?.canEdit ? "/log" : access?.signedIn ? "/signup" : "/login?mode=register"} className="ui-action bg-primary text-on-primary">{t(access?.canEdit ? "Log a game" : "Create your profile")}</Link>
            <Link href={access?.canEdit ? "/profile" : "/games"} className="ui-action border border-outline text-on-surface hover:bg-surface-container">{t(access?.canEdit ? "Open your profile" : "Explore games")}</Link>
            {access?.canEdit && <Link href="/tiers" className="ui-action text-primary hover:bg-surface-container">{t("Tier List")}<span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>}
          </div>
        </div>
        {access?.canEdit ? <section aria-label={t("Recently logged")} className="min-w-0 rounded-xl border border-outline-variant/40 bg-surface-container-low p-4 sm:p-7 space-y-6">
          <h2 className="font-headline-lg text-headline-lg">{t("Recently logged")}</h2>
          {recent.length ? <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{recent.map(game => <div key={game.slug} className="group/game min-w-0 space-y-2"><div className="relative"><Link href={`/game/${game.slug}`} aria-label={game.title}><img src={game.cover} alt="" width={180} height={240} className="aspect-[3/4] w-full rounded-lg object-cover bg-surface-container-high" /></Link><GameLogAction slug={game.slug} logged /></div><Link href={`/game/${game.slug}`} translate="no" className="block text-body-sm line-clamp-2 group-hover/game:text-primary">{game.title}</Link></div>)}</div> : <p className="text-on-surface-variant">{t("Your next game starts here. Log your first game to build your collection.")}</p>}
        </section> : preview}
      </div>
    </header>
  );
}
