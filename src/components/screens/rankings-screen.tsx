"use client";
import Link from "next/link";
import { useState } from "react";
import { usePortfolio } from "@/components/portfolio-provider";
import { averageScore, filterRankings, ratedGames, type RankingFilter } from "@/lib/portfolio-view";
import { ProfileAvatar } from "@/components/profile-avatar";
import type { Game } from "@/types/domain";
import { playbackLabels } from "@/lib/playback-status";

export function RankingsScreen() {
const { games, profile } = usePortfolio();
const [filter, setFilter] = useState<RankingFilter>("all");
const [page, setPage] = useState(1);
const rated = ratedGames(games);
const filtered = filterRankings(games, filter);
const pageCount = Math.max(1, Math.ceil(filtered.length / 8));
const currentPage = Math.min(page, pageCount);
const offset = (currentPage - 1) * 8;
const visible = filtered.slice(offset, offset + 8);
const ranksBySlug = new Map(rated.map((game, index) => [game.slug, index + 1]));
return (<>
<div className="w-full  bg-surface"><div className="flex flex-col w-full">

<div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 py-10 overflow-x-clip">
<div className="absolute -top-12 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

<div className="absolute top-48 right-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

<header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12">
<div className="flex items-center gap-6">
<div className="relative group">
<ProfileAvatar className="w-20 h-20 md:w-24 md:h-24 rounded object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105" name={profile.displayName} />

<span className="absolute bottom-1 right-1 w-3 h-3 bg-secondary rounded-full ring-2 ring-surface shadow-sm"></span>

</div>

<div className="space-y-1.5">
<div className="flex items-center gap-3">
<h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-semibold">{profile.displayName}</h1>

<span className="font-label-sm text-label-sm uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-medium">{profile.isSample ? "Sample profile" : profile.isPublic ? "Public profile" : "Private profile"}</span>

</div>

<p className="font-label-md text-label-md text-on-surface-variant tracking-normal">{"@" + profile.handle}</p>

<div className="flex items-center gap-2 pt-1 font-label-sm text-label-sm text-on-surface-variant">
<span className="text-on-surface font-semibold">{rated.length}</span>
{" Games Rated\n            "}<span className="text-outline-variant">{"/"}</span>

<span className="text-primary font-semibold">{averageScore(rated)}</span>
{" Avg Score\n          "}</div>

</div>

</div>

<nav aria-label="Ranking Categories" className="flex items-center gap-6 md:gap-8 overflow-x-auto pb-1">
<button data-filter="all" onClick={() => { setPage(1); setFilter("all"); }} aria-pressed={filter === "all"} className={filter === "all" ? "filter-btn active font-body-md text-body-md text-on-surface font-semibold tracking-tight transition-colors relative py-1" : "filter-btn font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors relative py-1"}>{"\n          All\n          "}<span className={"filter-indicator absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" + (filter === "all" ? "" : " hidden")}></span>

</button>

<button data-filter="masterpieces" onClick={() => { setPage(1); setFilter("masterpieces"); }} aria-pressed={filter === "masterpieces"} className={filter === "masterpieces" ? "filter-btn active font-body-md text-body-md text-on-surface font-semibold tracking-tight transition-colors relative py-1" : "filter-btn font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors relative py-1"}>{"\n          Masterpieces (90+)\n          "}<span className={"filter-indicator absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" + (filter === "masterpieces" ? "" : " hidden")}></span>

</button>

<button data-filter="recommended" onClick={() => { setPage(1); setFilter("recommended"); }} aria-pressed={filter === "recommended"} className={filter === "recommended" ? "filter-btn active font-body-md text-body-md text-on-surface font-semibold tracking-tight transition-colors relative py-1" : "filter-btn font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors relative py-1"}>{"\n          Recommended (75+)\n          "}<span className={"filter-indicator absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" + (filter === "recommended" ? "" : " hidden")}></span>

</button>

<button data-filter="backlog" onClick={() => { setPage(1); setFilter("backlog"); }} aria-pressed={filter === "backlog"} className={filter === "backlog" ? "filter-btn active font-body-md text-body-md text-on-surface font-semibold tracking-tight transition-colors relative py-1" : "filter-btn font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors relative py-1"}>{"\n          Backlog\n          "}<span className={"filter-indicator absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" + (filter === "backlog" ? "" : " hidden")}></span>

</button>

</nav>

</header>

<div className="w-full flex items-center justify-between mb-8">
<div className="flex items-center gap-3">
<span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-medium">{"Shelf / Personal Canon"}</span>

<span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>

<span className="font-label-sm text-label-sm text-on-surface-variant/80">{"Ordinal Hierarchy"}</span>

</div>

<div className="flex items-center gap-2">
<span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider">{"SORT:"}</span>

<span className="font-label-sm text-label-sm text-on-surface font-medium uppercase tracking-wider">{"Score (Desc)"}</span>

</div>

</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10" aria-live="polite">
{filtered.length === 0 && <p className="col-span-full py-10 font-body-md text-body-md text-on-surface-variant">{filter === "backlog" ? "Your backlog is empty. Choose Backlog in the game log and save; a score is optional." : "No ratings match this filter."}</p>}
{visible.map((game) => <RankingCard key={game.slug} game={game} rank={ranksBySlug.get(game.slug)} />)}
</div>

<footer className="pt-16 pb-6 flex items-center justify-between text-on-surface-variant">
<div className="flex items-center gap-3">
<button type="button" aria-label="Previous Page" className="p-2 rounded hover:bg-surface-container-high hover:text-on-surface transition-colors disabled:opacity-30 disabled:pointer-events-none" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><span className="material-symbols-outlined text-[20px]" aria-hidden="true">west</span></button>
<span className="font-label-md text-label-md text-on-surface font-medium tracking-widest">{currentPage} <span className="text-outline-variant font-normal">of</span> {pageCount}</span>
<button type="button" aria-label="Next Page" className="p-2 rounded hover:bg-surface-container-high hover:text-on-surface transition-colors disabled:opacity-30 disabled:pointer-events-none" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><span className="material-symbols-outlined text-[20px]" aria-hidden="true">east</span></button>
</div>
<div className="hidden sm:flex items-center gap-4 font-label-sm text-label-sm"><span className="text-on-surface-variant/70">Displaying entries {filtered.length ? offset + 1 : 0}–{offset + visible.length} of {filtered.length}</span><span className="w-1 h-1 rounded-full bg-surface-container-highest"></span><span className="text-on-surface-variant/70">{profile.isSample ? "Sample ratings" : "Saved ratings"}</span></div>
</footer>

</div>

</div>
</div>
</>);
}

function RankingCard({ game, rank }: { game: Game; rank?: number }) {

return <article className="relative group flex flex-col cursor-pointer transition-transform duration-300" data-rank={rank} data-score={game.score}>
<div className="relative w-full aspect-[3/4] rounded bg-surface-container-low overflow-hidden shadow-xl">
<img className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" src={game.cover} alt={game.title} />
<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
<div className="absolute top-3 left-3 flex items-center"><span className="font-label-md text-label-md font-bold px-2 py-1 rounded bg-surface-container-lowest/80 text-on-surface backdrop-blur-md shadow-md">{rank ? "#" + String(rank).padStart(2, "0") : "Backlog"}</span></div>
<div className="absolute top-3 right-3 flex items-center"><span className="font-label-md text-label-md font-bold px-2.5 py-1 rounded bg-surface-container-lowest/90 text-primary backdrop-blur-md shadow-md">{game.score ?? "—"}</span></div>
<div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-between"><span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">{game.tier ? "Tier " + game.tier : "Unassigned tier"}</span><div className="flex items-center gap-1 text-primary">{game.score !== null && <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">star</span>}<span className="font-label-sm text-label-sm font-bold">{game.score === null ? "Unrated" : (game.score / 20).toFixed(1)}</span></div></div>
</div>
<div className="mt-3.5 space-y-1"><div className="flex items-baseline justify-between gap-2"><h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight truncate group-hover:text-primary transition-colors"><Link className="after:absolute after:inset-0" href={"/game/" + game.slug}>{game.title}</Link></h2><span className="font-label-sm text-label-sm text-on-surface-variant flex-shrink-0">{game.year ?? "—"}</span></div><p className="font-body-sm text-body-sm text-on-surface-variant truncate">{game.status ? playbackLabels[game.status] : game.genres?.join(" · ") || "Profile rating"}</p></div>
</article>;
}
