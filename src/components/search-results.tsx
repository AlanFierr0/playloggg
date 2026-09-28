"use client";

import Link from "next/link";
import { games, sampleProfiles } from "@/data/prototype";
import searchReference from "@/data/search-reference.json";
import type { Game } from "@/types/domain";
import { ReferenceGame0, ReferenceGame1, ReferenceGame2, ReferenceProfile0, ReferenceProfile1, ReferenceList, ReferenceCommand0, ReferenceCommand1 } from "./search-reference-rows";

export type SearchScope = "all" | "games" | "curators" | "lists" | "actions";
const catalog: Game[] = [...searchReference, ...games.filter((game) => !searchReference.some((reference) => reference.slug === game.slug))];
const originalRows = { "cyberpunk-2077-phantom-liberty": ReferenceGame0, "cyberpunk-2077": ReferenceGame1, "system-shock": ReferenceGame2 };

function matches(query: string, content: string) {
  return query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean).every((word) => content.toLocaleLowerCase().includes(word));
}

export function getSearchMatches(query: string) {
  return {
    titles: catalog.filter((game) => matches(query, `${game.title} ${game.keywords}`)),
    profiles: sampleProfiles.filter((profile) => matches(query, `${profile.displayName} ${profile.handle} cyberpunk`)),
    listMatches: matches(query, "Cyberpunk & Dystopian Sci-Fi Atmospheres"),
  };
}

export function SearchResults({ query, scope, mode }: { query: string; scope: SearchScope; mode: "browse" | "log" }) {
  const { titles, profiles, listMatches } = getSearchMatches(query);
  const show = (section: SearchScope) => scope === "all" || scope === section;
  const count = (show("games") ? titles.length : 0) + (show("curators") ? profiles.length : 0) + (show("lists") && listMatches ? 1 : 0) + (show("actions") ? 2 : 0);
  return (
    <div className="max-h-[634px] overflow-y-auto px-4 py-3 divide-y-0 space-y-5" aria-live="polite" aria-atomic="false">
      <span className="sr-only">{count} sample results</span>
      {show("games") && <section>
        <ResultHeading icon="sports_esports" label="Top Title Matches" detail={`${titles.length} matches${query ? ` for “${query}”` : ""}`} color="text-primary" />
        <div className="space-y-1.5">{titles.map((game) => {
          const ReferenceRow = originalRows[game.slug as keyof typeof originalRows];
          return ReferenceRow ? <ReferenceRow key={game.slug} mode={mode} /> : <GameResult key={game.slug} game={game} mode={mode} />;
        })}
          {titles.length === 0 && <p className="p-4 font-body-md text-body-md text-on-surface-variant">No sample titles match. Try another title.</p>}
        </div>
      </section>}
      {show("curators") && profiles.length > 0 && <section className="pt-3">
        <ResultHeading icon="group" label="Curators & Critics" detail={`${profiles.length} matching profiles`} color="text-tertiary" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{profiles.map((profile) => profile.id === "owner-preview" ? <ReferenceProfile0 key={profile.id} /> : <ReferenceProfile1 key={profile.id} />)}</div>
      </section>}
      {show("lists") && listMatches && <section className="pt-3">
        <ResultHeading icon="view_carousel" label="Curated Lists & Matrices" detail="Community lists" color="text-secondary" />
        <ReferenceList />
      </section>}
      {show("actions") && <section className="pt-3 pb-1">
        <ResultHeading icon="bolt" label="Quick Commands" detail="Shortcuts" color="text-primary" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2"><ReferenceCommand0 /><ReferenceCommand1 /></div>
      </section>}
      {count === 0 && <p className="px-2 py-6 text-on-surface-variant">No sample results in this category.</p>}
    </div>
  );
}

function GameResult({ game, mode }: { game: Game; mode: "browse" | "log" }) {
  return <Link data-search-result href={mode === "log" ? `/log?game=${game.slug}` : `/game/${game.slug}`} className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-container transition-all">
    <div className="flex items-center gap-3.5 min-w-0">
      <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-surface-container-highest shadow"><img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={game.cover} alt={game.title} /><div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent" /></div>
      <div className="min-w-0 flex flex-col gap-0.5"><span className="font-headline-md text-headline-md text-on-surface font-semibold truncate group-hover:text-primary transition-colors">{game.title}</span><span className="font-body-sm text-body-sm text-on-surface-variant">Sample archive entry{game.year ? ` · ${game.year}` : ""}</span></div>
    </div>
    <div className="flex flex-col items-end pl-4"><span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-label-md text-label-md font-semibold">{game.score}</span><span className="font-label-sm text-[10px] text-label-sm text-on-surface-variant uppercase tracking-wider mt-0.5">Critique</span></div>
  </Link>;
}

function ResultHeading({ icon, label, detail, color }: { icon: string; label: string; detail: string; color: string }) {
  return <div className="flex items-center justify-between px-2 mb-2"><span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold flex items-center gap-1.5"><span className={`material-symbols-outlined text-[15px] ${color}`} aria-hidden="true">{icon}</span>{label}</span><span className="font-label-sm text-label-sm text-on-surface-variant/60">{detail}</span></div>;
}
