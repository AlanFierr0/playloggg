"use client";
import { useMessages } from "@/components/site-preferences";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { usePortfolio } from "@/components/portfolio-provider";
import { defaultGamesFilters, filterGames, validScoreRange, type GamesFilters } from "@/lib/games-view";
import { loggedGames } from "@/lib/portfolio-view";
import { playbackLabels } from "@/lib/playback-status";
import type { Game } from "@/types/domain";

const control = "w-full min-w-0 rounded bg-surface-container px-3 py-2.5 font-body-md text-body-md text-on-surface";
const button = "inline-flex items-center justify-center rounded px-4 py-2.5 font-label-md text-label-md bg-surface-container-high text-on-surface disabled:opacity-40";

export function GamesScreen() {
  const t = useMessages();
  const { games, profile, access } = usePortfolio();
  const [filters, setFilters] = useState<GamesFilters>(defaultGamesFilters);
  const [page, setPage] = useState(1);
  const filtered = filterGames(games, filters);
  const logged = new Set(loggedGames(games).map((game) => game.slug));
  const genres = [...new Set(games.flatMap((game) => game.genres ?? []))].sort();
  const platforms = [...new Set(games.flatMap((game) => game.platforms ?? []))].sort();
  const years = [...new Set(games.flatMap((game) => game.year === null ? [] : [game.year]))].sort((a, b) => b - a);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 24));
  const currentPage = Math.min(page, pageCount);
  const offset = (currentPage - 1) * 24;
  const visible = filtered.slice(offset, offset + 24);
  function change<K extends keyof GamesFilters>(key: K, value: GamesFilters[K]) { setFilters((current) => ({ ...current, [key]: value })); setPage(1); }
  function clear() { setFilters(defaultGamesFilters); setPage(1); }
  return <div className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10 space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div className="min-w-0 space-y-2"><p className="font-label-sm text-label-sm text-primary uppercase tracking-widest">{t("The game archive")}</p><h1 className="font-headline-xl text-headline-xl font-semibold tracking-tight">{t("Games")}</h1><p className="text-on-surface-variant font-body-md text-body-md">{t("Browse all ")}{games.length} {t("saved catalog games, including titles you haven’t logged.")}</p></div>{access?.canImportCatalog && <Link href="/search?q=&from=/games" className="inline-flex items-center rounded px-4 py-2.5 bg-primary-container text-on-primary-container font-label-md text-label-md">{t("Find games on IGDB →")}</Link>}</header>
    <section aria-label={t("Catalog filters")} className="rounded-lg bg-surface-container-low p-4 sm:p-5 space-y-4">
      <Field label={t("Search titles")}><input id="games-query" type="search" className={control} value={filters.query} placeholder={t("Search the catalog…")} onChange={(event) => change("query", event.target.value)} /></Field>
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label={t("Genre")}><select id="games-genre" className={control} value={filters.genre} onChange={(event) => change("genre", event.target.value)}><option value="">{t("All genres")}</option>{genres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}</select></Field>
        <Field label={t("Platform")}><select id="games-platform" className={control} value={filters.platform} onChange={(event) => change("platform", event.target.value)}><option value="">{t("All platforms")}</option>{platforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}</select></Field>
        <Field label={t("Release year")}><select id="games-year" className={control} value={filters.year} onChange={(event) => change("year", event.target.value)}><option value="">{t("All years")}</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}<option value="unknown">{t("Unknown year")}</option></select></Field>
        <Field label={t("Sort by")}><select id="games-sort" className={control} value={filters.sort} onChange={(event) => change("sort", event.target.value as GamesFilters["sort"])}><option value="title">{t("Title A–Z")}</option><option value="newest">{t("Newest release")}</option><option value="oldest">{t("Oldest release")}</option><option value="score-desc">{t("Profile score: highest")}</option><option value="score-asc">{t("Profile score: lowest")}</option></select></Field>
      </div>
      <details className="rounded bg-surface-container/40 p-3 sm:p-4"><summary className="cursor-pointer break-words font-label-md text-label-md text-primary">{t("Profile filters · ")}{profile.displayName}{profile.isSample ? t(" (sample)") : ""}</summary><p className="my-3 text-on-surface-variant font-body-sm text-body-sm">{t("Status, scores and tiers come from this profile’s saved entries.")}</p><div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label={t("Log entries")}><select id="games-library" className={control} value={filters.library} onChange={(event) => change("library", event.target.value as GamesFilters["library"])}><option value="all">{t("All catalog games")}</option><option value="logged">{t("Logged games")}</option><option value="unlogged">{t("Not logged")}</option></select></Field>
        <Field label={t("Playback status")}><select id="games-status" className={control} value={filters.status} onChange={(event) => change("status", event.target.value as GamesFilters["status"])}><option value="all">{t("Any status")}</option><option value="backlog">{t("Backlog")}</option><option value="playing">{t("In Progress")}</option><option value="completed">{t("Completed")}</option><option value="shelved">{t("Shelved")}</option><option value="unset">{t("Logged with no status")}</option></select></Field>
        <Field label={t("Tier")}><select id="games-tier" className={control} value={filters.tier} onChange={(event) => change("tier", event.target.value as GamesFilters["tier"])}><option value="all">{t("Any tier")}</option>{["S", "A", "B", "C", "D", "F"].map((tier) => <option key={tier} value={tier}>{tier}</option>)}<option value="unset">{t("No assigned tier")}</option></select></Field>
        <Field label={t("Rating")}><select id="games-rating" className={control} value={filters.rating} onChange={(event) => change("rating", event.target.value as GamesFilters["rating"])}><option value="all">{t("Rated and unrated")}</option><option value="rated">{t("Rated")}</option><option value="unrated">{t("Unrated")}</option></select></Field>
        <Field label={t("Minimum score")}><input id="games-min-score" className={control} type="number" min={0} max={100} step={1} placeholder={"0"} value={filters.minScore} onChange={(event) => change("minScore", event.target.value)} /></Field>
        <Field label={t("Maximum score")}><input id="games-max-score" className={control} type="number" min={0} max={100} step={1} placeholder={"100"} value={filters.maxScore} onChange={(event) => change("maxScore", event.target.value)} /></Field>
      </div></details>
      <div className="flex flex-wrap items-center justify-between gap-3"><p role="status" aria-live="polite" className="text-on-surface-variant font-body-sm text-body-sm">{validScoreRange(filters) ? t(`${filtered.length} of ${games.length} games${filtered.length ? ` · Showing ${offset + 1}–${offset + visible.length}` : ""}`) : t("Use whole-number scores from 0 to 100, with minimum no greater than maximum.")}</p><button type="button" className={button} onClick={clear}>{t("Clear filters")}</button></div>
    </section>
    <section aria-label={t("Game catalog results")}><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-6 sm:gap-x-5">{visible.map((game) => <CatalogCard key={game.slug} game={game} logged={logged.has(game.slug)} canEdit={Boolean(access?.canEdit)} />)}</div>{!visible.length && <div className="py-12 text-center space-y-4"><h2 className="font-headline-lg text-headline-lg">{t("No games match these filters")}</h2><p className="text-on-surface-variant">{t("Try a broader search or clear the filters.")}</p><button className={button} onClick={clear}>{t("Show all games")}</button></div>}</section>
    {filtered.length > 24 && <nav aria-label={t("Catalog pages")} className="flex flex-wrap justify-center items-center gap-3"><button className={button} disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>{t("← Previous")}</button><span className="font-label-md text-label-md">{t("Page ")}{currentPage} {t("of ")}{pageCount}</span><button className={button} disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>{t("Next →")}</button></nav>}
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const t = useMessages(); return <label className="block min-w-0 space-y-2"><span className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{t(label)}</span>{children}</label>; }

function CatalogCard({ game, logged, canEdit }: { game: Game; logged: boolean; canEdit: boolean }) {
  const t = useMessages();
  return <article data-catalog-game={game.slug} className="min-w-0 flex flex-col rounded-lg bg-surface-container-low overflow-hidden">
    <Link href={`/game/${encodeURIComponent(game.slug)}`} className="group block flex-1"><div className="relative aspect-[3/4] overflow-hidden bg-surface-container-high"><img src={game.cover} alt={t(`${game.title} cover`)} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />{game.score !== null && <span className="absolute top-2 right-2 rounded bg-surface/90 px-2 py-1 text-primary font-label-sm text-label-sm">{game.score} / 100</span>}</div><div className="p-3 space-y-2"><h2 className="font-headline-md text-headline-md break-words group-hover:text-primary">{game.title}</h2><p className="font-label-sm text-label-sm text-on-surface-variant">{game.year ?? t("Year unknown")}</p><p className="font-body-sm text-body-sm text-on-surface-variant break-words">{game.genres?.join(" · ") || t("Genre unknown")}</p><p className="font-label-sm text-label-sm text-primary break-words">{logged ? `${t(game.status ? playbackLabels[game.status] : "Logged")}${game.tier ? ` · ${t("Tier")} ${game.tier}` : ""}${game.score === null ? ` · ${t("Unrated")}` : ""}` : t("Not logged")}</p></div></Link>
    {canEdit && <Link href={`/log?game=${encodeURIComponent(game.slug)}`} className="inline-flex justify-center items-center border-t border-outline-variant/20 p-3 text-primary hover:bg-surface-container font-label-sm text-label-sm uppercase tracking-wider">{logged ? t("Edit log entry") : t("Log this game")}</Link>}
  </article>;
}
