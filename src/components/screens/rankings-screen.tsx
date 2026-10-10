"use client";
import { useMessages } from "@/components/site-preferences";

import {PreferenceRanking} from "@/components/preference-ranking";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePortfolio } from "@/components/portfolio-provider";
import { averageScore, filterRankings, loggedGames, ratedGames, type RankingFilter } from "@/lib/portfolio-view";
import { ProfileNavigation } from "@/components/profile-navigation";
import { ProfileAvatar } from "@/components/profile-avatar";
import type { Game } from "@/types/domain";
import { playbackLabels } from "@/lib/playback-status";

export function RankingsScreen() {
  const t = useMessages();
const { games, profile, access, publicBase } = usePortfolio();
const [view, setView] = useState<"personal" | "score">(publicBase ? "score" : "personal");
const [filter, setFilter] = useState<RankingFilter>("all");
const [tag, setTag] = useState("");
const tags = [...new Map(loggedGames(games).flatMap((game) => game.tags ?? []).map((value) => [value.toLowerCase(), value])).values()].sort();
const [page, setPage] = useState(1);
const sentinel = useRef<HTMLDivElement>(null);
const rated = ratedGames(games);
const filtered = filterRankings(games, filter, tag);
const pageCount = Math.max(1, Math.ceil(filtered.length / 8));
const currentPage = Math.min(page, pageCount);
const offset = publicBase ? 0 : (currentPage - 1) * 8;
const visible = filtered.slice(offset, currentPage * 8);
useEffect(() => {
  const target = sentinel.current;
  if (!publicBase || !target || currentPage >= pageCount || typeof IntersectionObserver === "undefined") return;
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      observer.disconnect();
      setPage(currentPage + 1);
    }
  }, { rootMargin: "300px 0px" });
  observer.observe(target);
  return () => observer.disconnect();
}, [publicBase, currentPage, pageCount, filter, tag]);
const ranksBySlug = new Map(rated.map((game, index) => [game.slug, index + 1]));
return <div className="site-container mx-auto w-full min-w-0 px-4 py-8 sm:px-6 lg:px-12">
  {!publicBase && <div className="mb-8"><ProfileNavigation /></div>}
  <header className="mb-8 flex flex-wrap items-center justify-between gap-6 border-b border-outline-variant/30 pb-8">
    <div className="flex min-w-0 items-center gap-4">
      {!publicBase && <ProfileAvatar src={profile.avatarUrl} name={profile.displayName} className="h-14 w-14 rounded-xl sm:h-16 sm:w-16" />}
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-3"><h1 className="font-headline-xl text-headline-xl font-semibold">{t("Ranking")}</h1>{(profile.isSample || !profile.isPublic) && <span className="rounded bg-surface-container-high px-2 py-1 text-label-sm text-on-surface-variant">{t(profile.isSample ? "Sample profile" : "Private profile")}</span>}</div>
        {!publicBase && <p translate="no" className="break-words text-body-md text-on-surface-variant">{profile.displayName} <span className="text-primary">@{profile.handle}</span></p>}
      </div>
    </div>
    <dl className="flex flex-wrap gap-6 sm:gap-10">
      <div><dt className="text-body-sm text-on-surface-variant">{t("Games rated")}</dt><dd className="mt-1 text-headline-lg font-semibold tabular-nums">{rated.length}</dd></div>
      <div><dt className="text-body-sm text-on-surface-variant">{t("Average score")}</dt><dd className="mt-1 text-headline-lg font-semibold tabular-nums text-primary">{rated.length ? averageScore(rated) : t("Unrated")}</dd></div>
    </dl>
    {!publicBase && access?.canEdit && <Link href="/settings" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-body-sm text-primary hover:bg-surface-container-low"><span aria-hidden="true" className="material-symbols-outlined text-[18px]">settings</span>{t("Profile settings")}</Link>}
  </header>
  <nav aria-label={t("Ranking view")} className="mb-6 flex gap-2">{([['personal', 'Personal order'], ['score', 'By score']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={view === value} onClick={() => setView(value)} className={`min-h-11 rounded-lg px-4 font-semibold ${view === value ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'}`}>{t(label)}</button>)}</nav>
  <div hidden={view !== "personal"}><PreferenceRanking /></div>
  <section hidden={view !== "score"} className="space-y-6" aria-label={t("Score ranking")}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-headline-lg text-headline-lg font-semibold">{t("Score ranking")}</h2>
      <span className="text-body-sm text-on-surface-variant">{t("Score (Desc)")}</span>
    </div>
    <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3 sm:p-4">
      <nav aria-label={t("Ranking Categories")} className="flex flex-wrap gap-2">
        {([['all', 'All'], ['masterpieces', 'Masterpieces (90+)'], ['recommended', 'Recommended (75+)'], ['backlog', 'Backlog']] as const).map(([value, label]) => <button key={value} data-filter={value} onClick={() => { setPage(1); setFilter(value); }} aria-pressed={filter === value} className={`min-h-11 rounded-lg px-4 text-body-sm font-semibold transition-colors ${filter === value ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>{t(label)}</button>)}
      </nav>
      {tags.length > 0 && <label className="min-w-0 space-y-1 text-body-sm"><span className="block text-on-surface-variant">{t("Filter by tag")}</span><select id="tag-filter" className="min-h-11 max-w-full rounded-lg border border-outline-variant/40 bg-surface px-3" value={tag} onChange={event => { setTag(event.target.value); setPage(1); }}><option value="">{t("All tags")}</option>{tags.map(value => <option key={value} value={value}>{value}</option>)}</select></label>}
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4" aria-live="polite">
      {filtered.length === 0 && <p className="col-span-full rounded-xl bg-surface-container-low p-6 text-body-md text-on-surface-variant">{filter === 'backlog' ? publicBase ? t("This profile's backlog is empty.") : t("Your backlog is empty. Choose Backlog in the game log and save; a score is optional.") : t("No ratings match this filter.")}</p>}
      {visible.map(game => <RankingCard key={game.slug} game={game} rank={ranksBySlug.get(game.slug)} publicBase={publicBase} />)}
    </div>
    {publicBase ? <footer className="space-y-4 py-4 text-center text-on-surface-variant">
      <p role="status" className="text-body-sm">{t("Displaying entries ")}{visible.length ? 1 : 0}–{visible.length} {t("of ")}{filtered.length}</p>
      {currentPage < pageCount && <div ref={sentinel} data-ranking-scroll><button type="button" onClick={() => setPage(currentPage + 1)} className="ui-action bg-surface-container-high text-on-surface hover:bg-surface-container-highest">{t("Load more")}</button></div>}
    </footer> : <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/30 py-5 text-on-surface-variant">
      <div className="flex items-center gap-3">
        <button type="button" aria-label={t("Previous Page")} className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-container-low hover:text-primary disabled:opacity-30" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><span className="material-symbols-outlined text-[20px]" aria-hidden="true">west</span></button>
        <span className="text-body-sm tabular-nums">{currentPage} {t("of")} {pageCount}</span>
        <button type="button" aria-label={t("Next Page")} className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-container-low hover:text-primary disabled:opacity-30" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><span className="material-symbols-outlined text-[20px]" aria-hidden="true">east</span></button>
      </div>
      <p className="text-body-sm">{t("Displaying entries ")}{filtered.length ? offset + 1 : 0}–{offset + visible.length} {t("of ")}{filtered.length}</p>
    </footer>}
  </section>
</div>;
}

function RankingCard({ game, rank, publicBase }: { game: Game; rank?: number; publicBase?: string }) {
  const t = useMessages();
  return <article className="group relative min-w-0" data-rank={rank} data-score={game.score}>
    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface-container-low">
      <img loading="lazy" className="h-full w-full object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.03] group-focus-within:scale-[1.03] motion-reduce:transform-none" src={game.cover} alt="" />
      <span className="absolute left-3 top-3 rounded-lg bg-surface-container-lowest px-2.5 py-1.5 text-body-sm font-semibold tabular-nums">{rank ? '#' + String(rank).padStart(2, '0') : t(game.status === 'backlog' ? 'Backlog' : 'Unrated')}</span>
    </div>
    <div className="space-y-2 pt-3">
      <div className="flex items-start justify-between gap-2">
        <h3 translate="no" className="min-w-0 line-clamp-2 text-body-lg font-semibold group-hover:text-primary"><Link className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary" href={(publicBase ?? '') + '/game/' + game.slug}>{game.title}</Link></h3>
        <span className="shrink-0 text-body-lg font-semibold tabular-nums text-primary">{game.score ?? t('Unrated')}</span>
      </div>
      <p className="text-body-sm text-on-surface-variant">{[game.year, game.status ? t(playbackLabels[game.status]) : null].filter(Boolean).join(' · ') || t('Profile rating')}</p>
      <p className="text-body-sm text-primary">{game.tier ? t('Tier') + ' ' + game.tier : t('Unassigned tier')}</p>
    </div>
  </article>;
}
