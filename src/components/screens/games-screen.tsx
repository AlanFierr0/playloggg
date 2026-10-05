"use client";
import { useMessages } from "@/components/site-preferences";

import Link from "next/link";
import { GameGenres } from "@/components/game-genres";
import { GameTags } from "@/components/game-tags";
import { IgdbSearch } from "@/components/igdb-search";
import { useCallback, useEffect, useRef, useOptimistic, useTransition, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { gamesQuery } from "@/lib/games-query";
import type { GamesPageData } from "@/lib/games-page";
import { defaultGamesFilters, validScoreRange, type GamesFilters } from "@/lib/games-view";
import { playbackLabels } from "@/lib/playback-status";
import type { Game, Portfolio } from "@/types/domain";

const control = "catalog-control";
const button = "inline-flex items-center justify-center rounded px-4 py-2.5 font-body-md text-body-md bg-surface-container-high text-on-surface disabled:opacity-40";

export function GamesScreen({ data, profile, access }: { data: GamesPageData; profile: Portfolio["profile"]; access: Portfolio["access"] }) {
  const t = useMessages();
  const router = useRouter();
  const [filters, updateFilters] = useOptimistic(data.filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const activeFilters = Object.entries(filters).filter(([key, value]) => key !== "query" && key !== "sort" && value !== defaultGamesFilters[key as keyof GamesFilters]).length;
  const [pending, startTransition] = useTransition();
  const { games: visible, total, matched, genres, tags, platforms, years, page: currentPage, pageCount, offset } = data;
  function navigate(next: GamesFilters, page = 1) {
    window.scrollTo({ top: 0 });
    startTransition(() => { updateFilters(next); const query = gamesQuery(next, page); router.push(`/games${query ? `?${query}` : ""}`, { scroll: false }); });
  }
  const loadMore = useCallback(() => {
    if (pending || currentPage >= pageCount) return;
    startTransition(() => {
      const query = gamesQuery(data.filters, currentPage + 1);
      router.replace(`/games?${query}`, { scroll: false });
    });
  }, [pending, currentPage, pageCount, data.filters, router]);
  useEffect(() => {
    const target = sentinel.current;
    if (!target || pending || currentPage >= pageCount || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        loadMore();
      }
    }, { rootMargin: '300px 0px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore, pending, currentPage, pageCount]);
  function change<K extends keyof GamesFilters>(key: K, value: GamesFilters[K]) { navigate({ ...filters, [key]: value }); }
  function clear() { navigate(defaultGamesFilters); }
  return <div aria-busy={pending} className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10 space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div className="min-w-0 space-y-2"><h1 className="font-headline-xl text-headline-xl font-semibold tracking-tight">{t("Games")}</h1></div>{access?.canImportCatalog && <Link href="/search?q=&from=/games" className="inline-flex items-center rounded px-4 py-2.5 bg-primary-container text-on-primary-container font-label-md text-label-md">{t("Search games →")}</Link>}</header>
    <section aria-label={t("Catalog filters")} className="space-y-4">
      <Field label={t("Search titles")}><input id="games-query" type="search" className={control} value={filters.query} placeholder={t("Search the catalog…")} onChange={(event) => change("query", event.target.value)} /></Field>
      <div className="rounded-xl border border-outline-variant/40 p-4">
        <button type="button" aria-expanded={filtersOpen} aria-controls="catalog-filter-fields" onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden w-full text-left cursor-pointer font-body-md text-body-lg text-on-surface">{t("Filters and sorting")} {activeFilters > 0 && <span className="text-primary">({activeFilters})</span>}</button>
      <div id="catalog-filter-fields" className={`${filtersOpen ? "grid" : "hidden"} lg:grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 lg:pt-0`}>
        <Field label={t("Genre")}><select id="games-genre" className={control} value={filters.genre} onChange={(event) => change("genre", event.target.value)}><option value="">{t("All genres")}</option>{genres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}</select></Field>
        {access?.canEdit && <Field label={t("Tag")}><select id="games-tag" className={control} value={tags.find(tag => tag.toLowerCase() === filters.tag.toLowerCase()) ?? filters.tag} onChange={event => change("tag",event.target.value)}><option value="">{t("All tags")}</option>{tags.map(tag => <option key={tag.toLowerCase()} value={tag}>{tag}</option>)}</select></Field>}
        <Field label={t("Platform")}><select id="games-platform" className={control} value={filters.platform} onChange={(event) => change("platform", event.target.value)}><option value="">{t("All platforms")}</option>{filters.platform && !platforms.some(platform => platform === filters.platform) && <option value={filters.platform} hidden>{filters.platform}</option>}{platforms.map((platform) => <option key={platform} value={platform}>{t(platform)}</option>)}</select></Field>
        <Field label={t("Release year")}><select id="games-year" className={control} value={filters.year} onChange={(event) => change("year", event.target.value)}><option value="">{t("All years")}</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}<option value="unknown">{t("Unknown year")}</option></select></Field>
        <Field label={t("Sort by")}><select id="games-sort" className={control} value={filters.sort} onChange={(event) => change("sort", event.target.value as GamesFilters["sort"])}><option value="title">{t("Title A–Z")}</option><option value="newest">{t("Newest release")}</option><option value="oldest">{t("Oldest release")}</option><option value="score-desc">{t("Profile score: highest")}</option><option value="score-asc">{t("Profile score: lowest")}</option></select></Field>
      </div>
      </div>
      {access?.canEdit && <details className="rounded bg-surface-container/40 p-3 sm:p-4"><summary className="cursor-pointer break-words font-label-md text-label-md text-primary">{t("Profile filters · ")}{profile.displayName}{profile.isSample ? t(" (sample)") : ""}</summary><p className="my-3 text-on-surface-variant font-body-sm text-body-sm">{t("Status, scores and tiers come from this profile’s saved entries.")}</p><div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label={t("Log entries")}><select id="games-library" className={control} value={filters.library} onChange={(event) => change("library", event.target.value as GamesFilters["library"])}><option value="all">{t("All catalog games")}</option><option value="logged">{t("Logged games")}</option><option value="unlogged">{t("Not logged")}</option></select></Field>
        <Field label={t("Playback status")}><select id="games-status" className={control} value={filters.status} onChange={(event) => change("status", event.target.value as GamesFilters["status"])}><option value="all">{t("Any status")}</option><option value="backlog">{t("Backlog")}</option><option value="playing">{t("In Progress")}</option><option value="completed">{t("Completed")}</option><option value="shelved">{t("Shelved")}</option><option value="unset">{t("Logged with no status")}</option></select></Field>
        <Field label={t("Tier")}><select id="games-tier" className={control} value={filters.tier} onChange={(event) => change("tier", event.target.value as GamesFilters["tier"])}><option value="all">{t("Any tier")}</option>{["S", "A", "B", "C", "D", "F"].map((tier) => <option key={tier} value={tier}>{tier}</option>)}<option value="unset">{t("No assigned tier")}</option></select></Field>
        <Field label={t("Rating")}><select id="games-rating" className={control} value={filters.rating} onChange={(event) => change("rating", event.target.value as GamesFilters["rating"])}><option value="all">{t("Rated and unrated")}</option><option value="rated">{t("Rated")}</option><option value="unrated">{t("Unrated")}</option></select></Field>
        <Field label={t("Minimum score")}><input id="games-min-score" className={control} type="number" min={0} max={100} step={1} placeholder={"0"} value={filters.minScore} onChange={(event) => change("minScore", event.target.value)} /></Field>
        <Field label={t("Maximum score")}><input id="games-max-score" className={control} type="number" min={0} max={100} step={1} placeholder={"100"} value={filters.maxScore} onChange={(event) => change("maxScore", event.target.value)} /></Field>
      </div></details>}
      <div className="flex flex-wrap items-center justify-between gap-3"><p role="status" aria-live="polite" className="text-on-surface-variant font-body-sm text-body-sm">{validScoreRange(filters) ? t(`${matched} of ${total} games${matched ? ` · Showing ${offset + 1}–${offset + visible.length}` : ""}`) : t("Use whole-number scores from 0 to 100, with minimum no greater than maximum.")}</p><button type="button" className={button} onClick={clear}>{t("Clear filters")}</button></div>
    </section>
    {filters.query.trim().length >= 2 && <section className="rounded-xl bg-surface-container-low p-5 space-y-3"><h2 className="font-headline-md text-headline-md">{t("Missing a game?")}</h2>{access?.canImportCatalog ? <IgdbSearch query={filters.query} excludeSlugs={visible.map(game => game.slug)} /> : <Link href="/login" className="text-primary underline">{t("Sign in to search more games and import a game.")}</Link>}</section>}
    <section aria-label={t("Game catalog results")}><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-6 sm:gap-x-5">{visible.map((game) => <CatalogCard key={game.slug} game={game} logged={Boolean(game.logged)} canEdit={Boolean(access?.canEdit)} filters={filters} />)}</div>{!visible.length && <div className="py-12 text-center space-y-4"><h2 className="font-headline-lg text-headline-lg">{t("No games match these filters")}</h2><p className="text-on-surface-variant">{t("Try a broader search or clear the filters.")}</p><button className={button} onClick={clear}>{t("Show all games")}</button></div>}</section>
    {currentPage < pageCount && <div ref={sentinel} data-infinite-scroll className="flex min-h-14 justify-center items-center">
      {pending ? <p role="status" className="inline-flex items-center gap-2 text-on-surface-variant"><span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />{t("Loading…")}</p> : <button type="button" className={button} onClick={loadMore}>{t("Load more")}</button>}
    </div>}
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const t = useMessages(); return <label className="block min-w-0 space-y-2"><span className="block font-body-md text-body-md text-on-surface-variant">{t(label)}</span>{children}</label>; }

function CatalogCard({ game, logged, canEdit, filters }: { game: Game; logged: boolean; canEdit: boolean; filters: GamesFilters }) {
  const t = useMessages();
  return <article data-catalog-game={game.slug} className="min-w-0 flex flex-col rounded-lg bg-surface-container-low overflow-hidden">
    <Link href={`/game/${encodeURIComponent(game.slug)}`} aria-label={game.title} className="group block"><div className="relative aspect-[3/4] overflow-hidden bg-surface-container-high"><img src={game.cover} alt={t(`${game.title} cover`)} loading="lazy" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />{game.score !== null && <span className="absolute top-2 right-2 rounded bg-surface/90 px-2 py-1 text-primary font-label-sm text-label-sm">{game.score} / 100</span>}</div></Link>
    <div className="p-3 space-y-2 flex-1">
      <h2 className="font-headline-md text-headline-md break-words"><Link href={`/game/${encodeURIComponent(game.slug)}`} className="hover:text-primary">{game.title}</Link></h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant">{game.year ?? t("Year unknown")}</p>
      <p className="font-body-sm text-body-sm text-on-surface-variant break-words"><GameGenres genres={game.genres?.slice(0, 2)} filters={filters} fallback={t("Genre unknown")} /></p>
      <p className="font-body-sm text-body-sm text-on-surface-variant break-words">{logged ? `${t(game.status ? playbackLabels[game.status] : "Logged")}${game.tier ? ` · ${t("Tier")} ${game.tier}` : ""}${game.score === null ? ` · ${t("Unrated")}` : ""}` : canEdit ? t("Not logged") : null}</p>
    </div>
    {logged && Boolean(game.tags?.length) && <div className="px-3 pb-3"><GameTags tags={game.tags} filters={filters} /></div>}
    {canEdit && <Link href={`/log?game=${encodeURIComponent(game.slug)}`} className="inline-flex justify-center items-center border-t border-outline-variant/20 p-3 text-primary hover:bg-surface-container font-body-md text-body-md">{logged ? t("Edit log entry") : t("Log this game")}</Link>}
  </article>;
}
