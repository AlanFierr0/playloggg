"use client";
import { useMessages } from "@/components/site-preferences";


import Link from "next/link";
import { usePortfolio } from "@/components/portfolio-provider";
import { IgdbSearch } from "@/components/igdb-search";
import { getSearchMatches } from "@/lib/portfolio-view";
import type { Game, Profile } from "@/types/domain";
import { HighlightedTitle, ReferenceProfile0 } from "./search-reference-rows";

export type SearchScope = "all" | "games" | "curators" | "actions";
export function SearchResults({ query, scope, mode, profiles, profilesLoading, profilesError, gamesLoading, gamesError, hasMore, onLoadMore, onRetry }: { query: string; scope: SearchScope; mode: "browse" | "log"; profiles: Profile[]; profilesLoading: boolean; profilesError?: boolean; gamesLoading: boolean; gamesError: boolean; hasMore: boolean; onLoadMore: () => void; onRetry: () => void }) {
  const t = useMessages();
  const portfolio = usePortfolio();
  const { titles } = getSearchMatches(query, portfolio);
  const show = (section: SearchScope) => scope === "all" || scope === section;
  const count = (show("games") ? titles.length : 0) + (show("curators") ? profiles.length : 0) + (show("actions") ? 2 : 0);
  return (
    <div className="scroll-region min-h-0 flex-1 max-h-[560px] overflow-y-auto overscroll-contain px-3 sm:px-5 py-4 space-y-6" aria-live="polite" aria-atomic="false">
      <span className="sr-only">{portfolio.access?.canImportCatalog && show("games") && query.trim().length >= 2 ? t("Search results") : `${count} ${t("results")}`}</span>
      {show("games") && <section>
        <ResultHeading icon="sports_esports" label={t("Games")} detail={gamesLoading ? "Loading…" : hasMore ? "Search results" : portfolio.access?.canImportCatalog && query.trim().length >= 2 ? "Search results" : `${titles.length} matches${query ? ` for “${query}”` : ""}`} color="text-primary" />
        <div className="space-y-1.5">{titles.map(game => <GameResult key={game.slug} game={game} query={query} mode={mode} />)}
          {!gamesLoading && !gamesError && titles.length === 0 && !portfolio.access?.canImportCatalog && <p className="p-4 font-body-md text-body-md text-on-surface-variant">{t("No games found. Sign in to search more games.")}</p>}
          {gamesLoading && <p role="status" className="p-4 text-on-surface-variant">{t("Loading…")}</p>}
          {gamesError && <div className="p-4"><p role="status">{t("Game search could not be loaded.")}</p><button type="button" onClick={onRetry} className="mt-2 text-primary">{t("Retry search")}</button></div>}
          {hasMore && !gamesLoading && <button type="button" onClick={onLoadMore} className="m-3 rounded-lg border border-outline-variant px-4 py-2 text-primary">{t("Load more")}</button>}
          {portfolio.access?.canImportCatalog && <div className={gamesLoading || gamesError ? "hidden" : undefined}><IgdbSearch query={query} mode={mode} excludeSlugs={titles.map(game => game.slug)} /></div>}
        </div>
      </section>}
      {show("curators") && <section className="pt-3">
        <ResultHeading icon="group" label={t("Profiles")} detail={profilesLoading ? "Loading…" : `${profiles.length} matching profiles`} color="text-tertiary" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{profiles.map((profile) => <ReferenceProfile0 key={profile.id} profile={profile} />)}</div>
        {profilesLoading ? <p className="p-4 text-on-surface-variant">{t("Loading…")}</p> : profilesError ? <p className="p-4 text-on-surface-variant">{t("Profile search could not be loaded.")}</p> : profiles.length === 0 && <p className="p-4 text-on-surface-variant">{t("No profiles match this search.")}</p>}
      </section>}
      {show("actions") && <section className="pt-3 pb-1">
        <ResultHeading icon="bolt" label={t("Actions")} detail="Shortcuts" color="text-primary" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{[["/log", "add", "Log a game"], ["/compare", "compare_arrows", "Compare games"]].map(([href, icon, label]) => <Link key={href} data-search-result href={href} className="flex min-h-14 items-center gap-3 rounded-xl bg-surface-container px-4 py-3 text-body-md hover:bg-surface-container-high transition-colors"><span aria-hidden="true" className="material-symbols-outlined text-primary text-[20px]">{icon}</span>{t(label)}<span aria-hidden="true" className="material-symbols-outlined ml-auto text-[18px]">chevron_right</span></Link>)}</div>
      </section>}
      {count === 0 && !show("games") && !show("curators") && <p className="px-2 py-6 text-on-surface-variant">{t("No results in this category.")}</p>}
    </div>
  );
}

function GameResult({ game, query, mode }: { game: Game; query: string; mode: "browse" | "log" }) {
  const t = useMessages();
  return <Link data-search-result href={mode === "log" ? `/log?game=${game.slug}` : `/game/${game.slug}`} className="group flex items-center gap-3 sm:gap-4 rounded-xl p-3 hover:bg-surface-container focus-visible:bg-surface-container transition-colors">
    <img loading="lazy" className="h-[72px] w-12 shrink-0 rounded-md bg-surface-container-high object-cover" src={game.cover} alt="" onError={event => { if (!event.currentTarget.src.endsWith("/images/missing-cover.svg")) event.currentTarget.src = "/images/missing-cover.svg"; }} />
    <div className="min-w-0 flex-1 space-y-1"><span className="block text-body-lg font-semibold break-words text-on-surface group-hover:text-primary"><HighlightedTitle title={game.title} query={query} /></span><span className="block text-body-sm text-on-surface-variant">{game.year ?? t("Release unknown")}{game.genres?.[0] && <> · <span translate="no">{game.genres[0]}</span></>}</span></div>
    <div className="flex shrink-0 flex-col items-end gap-1"><span className={`rounded-md px-2 py-1 text-body-md font-semibold tabular-nums ${game.score === null ? "text-on-surface-variant" : "bg-primary/10 text-primary"}`}>{game.score ?? "—"}</span><span className="text-label-sm text-on-surface-variant">{game.tier ? t(`Tier ${game.tier}`) : t(game.score === null ? "Unrated" : "Unassigned tier")}</span></div>
    <span aria-hidden="true" className="material-symbols-outlined hidden sm:block text-[18px] text-on-surface-variant group-hover:text-primary">chevron_right</span>
  </Link>;
}

function ResultHeading({ icon, label, detail, color }: { icon: string; label: string; detail: string; color: string }) {
  const t = useMessages();
  return <div className="flex flex-wrap gap-2 items-center justify-between px-2 mb-2"><span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold flex items-center gap-1.5"><span className={`material-symbols-outlined text-[15px] ${color}`} aria-hidden="true">{icon}</span>{t(label)}</span><span className="font-label-sm text-label-sm text-on-surface-variant">{t(detail)}</span></div>;
}
