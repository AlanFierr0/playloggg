"use client";
import { coverImage } from "@/lib/cover-image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMessages } from "@/components/site-preferences";
import { usePortfolio } from "@/components/portfolio-provider";
import type { Game } from "@/types/domain";
import { tierColors } from "@/components/rating-controls";
import { tierLabels } from "@/lib/tier-labels";
import { playbackLabels } from "@/lib/playback-status";
import { playedPlatformLabels } from "@/lib/played-platforms";

export type HomeEntry = Pick<Game, "slug" | "title" | "cover" | "score" | "tier" | "status" | "platform" | "hoursPlayed">;

function HomeGameCard({ game, continuing = false }: { game: HomeEntry; continuing?: boolean }) {
  const t = useMessages();
  return <article className="group/game flex h-full min-w-0 items-start gap-3 sm:gap-4">
    <Link prefetch={false} href={`/game/${game.slug}`} aria-label={game.title} className={`shrink-0 rounded-xl ${continuing ? "w-20 sm:w-24" : "w-14 sm:w-16"}`}><img {...coverImage(game.cover, "(max-width: 639px) 80px, 96px")} decoding="async" alt="" width={96} height={128} className="aspect-[3/4] w-full rounded-xl object-cover bg-surface-container-high" loading="lazy" /></Link>
    <div className="flex min-h-40 min-w-0 flex-1 flex-col gap-2">
      <Link prefetch={false} href={`/game/${game.slug}`} translate="no" className={`block ${game.score === null ? "" : "min-h-12"} font-headline-md text-body-md font-semibold line-clamp-2 hover:text-primary`}>{game.title}</Link>
      <div className="flex min-h-8 flex-wrap items-center gap-2 text-body-sm">
        <span className="text-primary">{game.score === null ? t("Unrated") : `${game.score} / 100`}</span>
        {game.tier && <span className={`rounded px-2 py-0.5 font-label-sm text-label-sm ${tierColors[game.tier]}`}>{game.tier} · {t(tierLabels[game.tier])}</span>}
      </div>
      <p className="min-h-5 text-body-sm text-on-surface-variant">{continuing ? [game.platform ? t(playedPlatformLabels[game.platform]) : null, game.hoursPlayed != null ? `${game.hoursPlayed} ${t("hrs")}` : null].filter(Boolean).join(" · ") || t("In Progress") : t(game.status ? playbackLabels[game.status] : "Not set")}</p>
      <Link prefetch={false} href={`/log?game=${encodeURIComponent(game.slug)}`} className="mt-auto inline-flex min-h-11 self-start items-center gap-2 rounded-lg px-2 -ml-2 text-body-sm text-primary hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary transition-colors"><span aria-hidden="true" className="material-symbols-outlined text-[16px]">edit</span>{t("Edit log entry")}</Link>
    </div>
  </article>;
}

export function HomeIntro({ preview, recent, playing }: { preview: ReactNode; recent: HomeEntry[]; playing: HomeEntry[] }) {
  const t = useMessages();
  const { access, profile } = usePortfolio();
  if (access?.canEdit) return (
    <header className="site-container mx-auto w-full px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between pb-8 border-b border-outline-variant/30">
        <div className="min-w-0 space-y-3">
          <p className="font-label-sm text-label-sm uppercase tracking-widest text-primary">{t("Your games. Your taste.")}</p>
          <h1 className="font-headline-xl font-bold text-[28px] sm:text-[40px] leading-tight tracking-tight">{t("Welcome back,")} <span translate="no" className="text-primary break-words">{profile.displayName}.</span></h1>
          <p className="max-w-xl text-body-md text-on-surface-variant">{t("Pick up where you left off. Log a game, update your profile or arrange your tiers.")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 xl:shrink-0">
          <Link prefetch={false} href="/log" className="ui-action bg-primary text-on-primary"><span aria-hidden="true" className="material-symbols-outlined text-[20px]">add</span>{t("Log a game")}</Link>
          <Link prefetch={false} href="/profile" className="ui-action bg-surface-container-low text-on-surface hover:bg-surface-container-high">{t("Open your profile")}</Link>
          <Link prefetch={false} href="/tiers" className="ui-action text-primary hover:bg-surface-container">{t("Tier List")}<span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
        </div>
      </div>
      {(playing.length > 0 || recent.length > 0) && <div className={`mt-6 grid items-stretch gap-5 ${playing.length && recent.length ? "lg:grid-cols-2" : ""}`}>
        {playing.length > 0 && <section aria-label={t("Continue playing")} className="flex min-w-0 flex-col gap-5 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 sm:p-6">
          <div className="flex min-h-11 items-center"><h2 className="font-headline-lg text-headline-lg font-semibold">{t("Continue playing")}</h2></div>
          <div className="grid auto-rows-fr grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">{playing.map(game => <HomeGameCard key={game.slug} game={game} continuing />)}</div>
        </section>}
        {recent.length > 0 && <section aria-label={t("Recently updated")} className="flex min-w-0 flex-col gap-5 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 sm:p-6">
          <div className="flex min-h-11 flex-wrap items-center justify-between gap-3"><h2 className="font-headline-lg text-headline-lg font-semibold">{t("Recently updated")}</h2><Link prefetch={false} href="/profile/ranking" className="inline-flex min-h-11 items-center gap-1 text-body-sm text-primary hover:underline">{t("View collection")}<span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_forward</span></Link></div>
          <div className="grid auto-rows-fr grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">{recent.map(game => <HomeGameCard key={game.slug} game={game} />)}</div>
        </section>}
      </div>}
      {!playing.length && !recent.length && <p className="mt-7 text-on-surface-variant">{t("Your next game starts here. Log your first game to build your collection.")}</p>}
    </header>
  );
  return (
    <header className="site-container mx-auto w-full px-4 sm:px-6 lg:px-12 py-6 sm:py-10 lg:py-12">
      <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <p className="text-primary text-body-lg font-semibold">{t("Your games. Your taste.")}</p>
          <h1 className="max-w-[12ch] font-display-lg font-bold text-[40px] leading-[1.08] sm:text-[56px] xl:text-[64px] tracking-tight">{t("Build your gaming identity.")}</h1>
          <p className="max-w-[38ch] text-body-lg text-on-surface-variant">{t("Rate games. Rank your favorites. Compare your taste.")}</p>
          <div className="flex flex-col min-[400px]:flex-row flex-wrap gap-3 pt-2">
            <Link prefetch={false} href={access?.signedIn ? "/signup" : "/login?mode=register"} className="ui-action bg-primary text-on-primary">{t("Create your profile")}</Link>
            <Link prefetch={false} href="/games" className="ui-action border border-outline text-on-surface hover:bg-surface-container">{t("Explore games")}</Link>
          </div>
        </div>
        {preview}
      </div>
    </header>
  );
}
