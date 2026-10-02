"use client";
import { useMessages } from "@/components/site-preferences";


import Link from "next/link";
import { usePortfolio } from "@/components/portfolio-provider";
import { IgdbSearch } from "@/components/igdb-search";
import { averageScore, getSearchMatches, ratedGames } from "@/lib/portfolio-view";
import type { Game } from "@/types/domain";
import { ReferenceGame0, ReferenceGame1, ReferenceGame2, HighlightedTitle, ReferenceProfile0, ReferenceCommand0, ReferenceCommand1 } from "./search-reference-rows";

const originalRows = { "cyberpunk-2077-phantom-liberty": ReferenceGame0, "cyberpunk-2077": ReferenceGame1, "system-shock": ReferenceGame2 };

export type SearchScope = "all" | "games" | "curators" | "actions";
export function SearchResults({ query, scope, mode }: { query: string; scope: SearchScope; mode: "browse" | "log" }) {
  const t = useMessages();
  const portfolio = usePortfolio();
  const { titles, profiles } = getSearchMatches(query, portfolio);
  const rated = ratedGames(portfolio.games);
  const show = (section: SearchScope) => scope === "all" || scope === section;
  const count = (show("games") ? titles.length : 0) + (show("curators") ? profiles.length : 0) + (show("actions") ? 2 : 0);
  return (
    <div className="scroll-region min-h-0 flex-1 max-h-[634px] overflow-y-auto overscroll-contain px-2 sm:px-4 py-3 divide-y-0 space-y-5" aria-live="polite" aria-atomic="false">
      <span className="sr-only">{portfolio.access?.canImportCatalog && show("games") && query.trim().length >= 2 ? t("Search results") : `${count} ${t("results")}`}</span>
      {show("games") && <section>
        <ResultHeading icon="sports_esports" label={t("Games")} detail={portfolio.access?.canImportCatalog && query.trim().length >= 2 ? "Search results" : `${titles.length} matches${query ? ` for “${query}”` : ""}`} color="text-primary" />
        <div className="space-y-1.5">{titles.map((game) => {
          const ReferenceRow = originalRows[game.slug as keyof typeof originalRows];
          return ReferenceRow ? <ReferenceRow key={game.slug} game={game} query={query} mode={mode} /> : <GameResult key={game.slug} game={game} query={query} mode={mode} />;
        })}
          {titles.length === 0 && !portfolio.access?.canImportCatalog && <p className="p-4 font-body-md text-body-md text-on-surface-variant">{t("No games found. Sign in to search more games.")}</p>}
          {portfolio.access?.canImportCatalog && <IgdbSearch query={query} mode={mode} excludeSlugs={titles.map(game => game.slug)} />}
        </div>
      </section>}
      {show("curators") && profiles.length > 0 && <section className="pt-3">
        <ResultHeading icon="group" label={t("Curators & Critics")} detail={`${profiles.length} matching profiles`} color="text-tertiary" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{profiles.map((profile) => <ReferenceProfile0 key={profile.id} profile={profile} count={rated.length} average={averageScore(rated)} />)}</div>
      </section>}
      {show("actions") && <section className="pt-3 pb-1">
        <ResultHeading icon="bolt" label={t("Quick Commands")} detail="Shortcuts" color="text-primary" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2"><ReferenceCommand0 /><ReferenceCommand1 /></div>
      </section>}
      {count === 0 && !show("games") && <p className="px-2 py-6 text-on-surface-variant">{t("No results in this category.")}</p>}
    </div>
  );
}

function GameResult({ game, query, mode }: { game: Game; query: string; mode: "browse" | "log" }) {
  const t = useMessages();
  return <Link data-search-result href={mode === "log" ? `/log?game=${game.slug}` : `/game/${game.slug}`} className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-container transition-all">
    <div className="flex flex-1 items-center gap-2 sm:gap-3.5 min-w-0">
      <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-surface-container-highest shadow"><img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={game.cover} alt={game.title} /><div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent" /></div>
      <div className="min-w-0 flex flex-col gap-0.5"><span className="font-headline-md text-headline-md text-on-surface font-semibold break-words group-hover:text-primary transition-colors"><HighlightedTitle title={game.title} query={query} /></span><span className="font-body-sm text-body-sm text-on-surface-variant">{game.year ?? t("Release unknown")}</span></div>
    </div>
    <div className="flex shrink-0 flex-col items-end pl-2 sm:pl-4"><span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-label-md text-label-md font-semibold">{game.score ?? "—"}</span><span className="font-label-sm text-[10px] text-label-sm text-on-surface-variant uppercase tracking-wider mt-0.5">{game.score === null ? t("Unrated") : game.tier ? t(`Tier ${game.tier}`) : t("Unassigned tier")}</span></div>
  </Link>;
}

function ResultHeading({ icon, label, detail, color }: { icon: string; label: string; detail: string; color: string }) {
  const t = useMessages();
  return <div className="flex flex-wrap gap-2 items-center justify-between px-2 mb-2"><span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold flex items-center gap-1.5"><span className={`material-symbols-outlined text-[15px] ${color}`} aria-hidden="true">{icon}</span>{t(label)}</span><span className="font-label-sm text-label-sm text-on-surface-variant">{t(detail)}</span></div>;
}
