"use client";
import { useMessages } from "@/components/site-preferences";

import { ProfileAvatar } from "@/components/profile-avatar";
import { gameImages } from "@/lib/game-images";
import Link from "next/link";
import type { Game, Profile } from "@/types/domain";

export function ReferenceGame0({ game, query, mode }: { game: Game; query: string; mode: "browse" | "log" }) {
  const t = useMessages(); return (<Link data-search-result className="group relative flex items-center justify-between p-2.5 rounded-lg bg-surface-container-high shadow-md transition-all" href={mode === "log" ? "/log?game=" + game.slug : "/game/" + game.slug}>
<div className="flex flex-1 items-center gap-2 sm:gap-3.5 min-w-0">
<div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-surface-container-highest shadow">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={game.cover} alt={game.title} />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent"></div>

</div>

<div className="min-w-0 flex flex-col gap-0.5">
<div className="flex items-center gap-2 flex-wrap">
<span className="font-headline-md text-headline-md text-on-surface font-semibold break-words group-hover:text-primary transition-colors">
<HighlightedTitle title={game.title} query={query} /></span>

<span className="px-1.5 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface-variant font-medium">{game.year ?? "—"}</span>

<span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-label-sm text-label-sm font-bold tracking-wider">{game.tier ? t("Tier") + " " + game.tier : t("UNASSIGNED")}</span>

</div>

<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-on-surface-variant font-body-sm text-body-sm">
<span>{game.genres?.[0] ?? t("Catalog entry")}</span>

<span className="text-on-surface-variant/40">{"•"}</span>

<span className="inline-flex items-center gap-1 text-secondary font-medium">
<span aria-hidden="true" className="material-symbols-outlined text-[14px]">{"check_circle"}</span>
{game.score === null ? t(" Unrated") : t(" Profile rating")}</span>

<span className="text-on-surface-variant/40">{"•"}</span>

<span className="font-label-md text-label-md text-on-surface-variant">{t("Stored rating")}</span>

</div>

</div>

</div>

<div className="flex items-center gap-3 pl-2 sm:pl-4 flex-shrink-0">
<div className="flex flex-col items-end">
<span className="px-2 py-0.5 rounded bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm">{game.score ?? "—"}</span>

<span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5 hidden sm:block">{game.score === null ? t("Unrated") : t("Profile score")}</span>

</div>

<div className="hidden sm:flex items-center justify-center w-7 h-7 rounded bg-surface-container text-primary">
<span aria-hidden="true" className="material-symbols-outlined text-[16px]">{"keyboard_return"}</span>

</div>

</div>

</Link>
); }

export function ReferenceGame1({ game, query, mode }: { game: Game; query: string; mode: "browse" | "log" }) {
  const t = useMessages(); return (<Link data-search-result className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-container transition-all" href={mode === "log" ? "/log?game=" + game.slug : "/game/" + game.slug}>
<div className="flex flex-1 items-center gap-2 sm:gap-3.5 min-w-0">
<div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-surface-container-highest shadow">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={game.cover} alt={game.title} />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent"></div>

</div>

<div className="min-w-0 flex flex-col gap-0.5">
<div className="flex items-center gap-2 flex-wrap">
<span className="font-headline-md text-headline-md text-on-surface font-semibold break-words group-hover:text-primary transition-colors">
<HighlightedTitle title={game.title} query={query} /></span>

<span className="px-1.5 py-0.5 rounded bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant">{game.year ?? "—"}</span>

<span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-semibold tracking-wider">{game.tier ? t("Tier") + " " + game.tier : t("UNASSIGNED")}</span>

</div>

<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-on-surface-variant font-body-sm text-body-sm">
<span>{game.genres?.[0] ?? t("Catalog entry")}</span>

<span className="text-on-surface-variant/40">{"•"}</span>

<span className="inline-flex items-center gap-1 text-on-surface-variant font-medium">
<span aria-hidden="true" className="material-symbols-outlined text-[14px]">{"done_all"}</span>
{game.score === null ? t(" Unrated") : t(" Profile rating")}</span>

<span className="text-on-surface-variant/40">{"•"}</span>

<span className="font-label-md text-label-md text-on-surface-variant">{t("Stored rating")}</span>

</div>

</div>

</div>

<div className="flex items-center gap-3 pl-2 sm:pl-4 flex-shrink-0">
<div className="flex flex-col items-end">
<span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-label-md text-label-md font-semibold">{game.score ?? "—"}</span>

<span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5 hidden sm:block">{game.score === null ? t("Unrated") : t("Profile score")}</span>

</div>

</div>

</Link>
); }

export function ReferenceGame2({ game, query, mode }: { game: Game; query: string; mode: "browse" | "log" }) {
  const t = useMessages(); return (<Link data-search-result className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-container transition-all" href={mode === "log" ? "/log?game=" + game.slug : "/game/" + game.slug}>
<div className="flex flex-1 items-center gap-2 sm:gap-3.5 min-w-0">
<div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-surface-container-highest shadow">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={game.cover} alt={game.title} />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent"></div>

</div>

<div className="min-w-0 flex flex-col gap-0.5">
<div className="flex items-center gap-2 flex-wrap">
<span className="font-headline-md text-headline-md text-on-surface font-semibold break-words group-hover:text-primary transition-colors"><HighlightedTitle title={game.title} query={query} /></span>

<span className="px-1.5 py-0.5 rounded bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant">{game.year ?? "—"}</span>

<span className="px-1.5 py-0.5 rounded bg-secondary-container/20 text-secondary font-label-sm text-label-sm font-semibold tracking-wider">{game.tier ? t("Tier") + " " + game.tier : t("UNASSIGNED")}</span>

<span className="font-label-sm text-[10px] text-primary uppercase tracking-wider bg-primary/10 px-1 rounded">{t("Catalog")}</span>

</div>

<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-on-surface-variant font-body-sm text-body-sm">
<span>{game.genres?.[0] ?? t("Catalog entry")}</span>

<span className="text-on-surface-variant/40">{"•"}</span>

<span className="inline-flex items-center gap-1 text-tertiary font-medium">
<span aria-hidden="true" className="material-symbols-outlined text-[14px]">{"bookmark"}</span>
{game.score === null ? t(" Unrated") : t(" Profile rating")}</span>

</div>

</div>

</div>

<div className="flex items-center gap-3 pl-2 sm:pl-4 flex-shrink-0">
<div className="flex flex-col items-end">
<span className="px-2 py-0.5 rounded bg-secondary/20 text-secondary font-label-md text-label-md font-bold">{game.score ?? "—"}</span>

<span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5 hidden sm:block">{game.score === null ? t("Unrated") : t("Profile score")}</span>

</div>

</div>

</Link>
); }

export function ReferenceProfile0({ profile, count, average }: { profile: Profile; count: number; average: string }) {
  const t = useMessages(); return (<Link data-search-result className="group flex items-center gap-3 p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors" href="/profile">
<div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface-container-highest shadow">
<ProfileAvatar className="w-full h-full object-cover" src={profile.avatarUrl} name={profile.displayName} />

</div>

<div className="min-w-0 flex-1">
<div className="flex items-center gap-1.5">
<span className="font-headline-md text-body-lg font-bold text-on-surface truncate group-hover:text-primary transition-colors">{profile.displayName}</span>

<span className="font-label-sm text-label-sm text-primary bg-primary/10 px-1 rounded uppercase font-semibold">{profile.isSample ? t("Sample") : profile.isPublic ? t("Public") : t("Private")}</span>

</div>

<div className="font-body-sm text-body-sm text-on-surface-variant truncate">{"@" + profile.handle + " · " + count + " " + t("rated titles") + " · " + average + " " + t("avg score")}</div>

</div>

<span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-[18px] group-hover:translate-x-0.5 transition-transform">{"chevron_right"}</span>

</Link>
); }

export function ReferenceProfile1() {
  const t = useMessages(); return (<Link data-search-result className="group flex items-center gap-3 p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors" href="/compare">
<div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface-container-highest shadow">
<ProfileAvatar className="w-full h-full object-cover" name="Hideo Kojima" />

</div>

<div className="min-w-0 flex-1">
<div className="flex items-center gap-1.5">
<span className="font-headline-md text-body-lg font-bold text-on-surface truncate group-hover:text-primary transition-colors">{t("Hideo Kojima")}</span>

<span aria-hidden="true" className="material-symbols-outlined text-secondary text-[14px]">{"verified"}</span>

</div>

<div className="font-body-sm text-body-sm text-on-surface-variant truncate">{t("\n                  Auteur • 142 mutuals (81% affinity)\n                ")}</div>

</div>

<span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-[18px] group-hover:translate-x-0.5 transition-transform">{"chevron_right"}</span>

</Link>
); }

export function ReferenceList() {
  const t = useMessages(); return (<Link data-search-result className="group flex items-center justify-between p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors" href="/tiers">
<div className="flex flex-1 items-center gap-2 sm:gap-3.5 min-w-0">
<div className="flex -space-x-4 flex-shrink-0">
<div className="w-8 h-11 rounded bg-surface-container-highest overflow-hidden shadow">
<img className="w-full h-full object-cover" src={gameImages("cyberpunk-2077").cover} alt={"cyberpunk 2077 cover"} />

</div>

<div className="w-8 h-11 rounded bg-surface-container-high overflow-hidden shadow">
<img className="w-full h-full object-cover" src={gameImages("system-shock").cover} alt={"system shock cover"} />

</div>

<div className="w-8 h-11 rounded bg-surface-container overflow-hidden shadow">
<img className="w-full h-full object-cover" src={gameImages("nier-automata").cover} alt={"nier automata cover"} />

</div>

</div>

<div className="min-w-0">
<div className="font-headline-md text-body-lg text-on-surface font-semibold break-words group-hover:text-primary transition-colors">
<mark className="bg-transparent text-primary">{t("Cyber")}</mark>
{t("punk & Dystopian Sci-Fi Atmospheres\n                ")}</div>

<div className="font-body-sm text-body-sm text-on-surface-variant">{t("\n                  Archived by ")}<span className="text-on-surface">{"@neon_diegesis"}</span>
{t(" • 42 ranked titles • Updated 4d ago\n                ")}</div>

</div>

</div>

<div className="flex items-center gap-2 pl-4 flex-shrink-0">
<span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">{t("\n                42 entries\n              ")}</span>

<span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-[18px]">{"open_in_new"}</span>

</div>

</Link>
); }

export function ReferenceCommand0() {
  const t = useMessages(); return (<Link data-search-result className="w-full flex items-center justify-between p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-left transition-colors group" href="/log">
<div className="flex items-center gap-2.5 min-w-0">
<div className="w-7 h-7 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
<span aria-hidden="true" className="material-symbols-outlined text-[16px]">{"add"}</span>

</div>

<div className="min-w-0">
<span className="font-body-md text-body-md text-on-surface font-medium truncate block group-hover:text-primary transition-colors">{t("\n                    Log new game entry\n                  ")}</span>

<span className="font-body-sm text-[11px] text-on-surface-variant block">{t("Open rating & shelf modal")}</span>

</div>

</div>

<kbd className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm tracking-widest">{"\n                L\n              "}</kbd>

</Link>
); }

export function ReferenceCommand1() {
  const t = useMessages(); return (<Link data-search-result className="w-full flex items-center justify-between p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-left transition-colors group" href="/compare">
<div className="flex items-center gap-2.5 min-w-0">
<div className="w-7 h-7 rounded bg-surface-container-highest text-tertiary flex items-center justify-center font-bold">
<span aria-hidden="true" className="material-symbols-outlined text-[16px]">{"compare_arrows"}</span>

</div>

<div className="min-w-0">
<span className="font-body-md text-body-md text-on-surface font-medium truncate block group-hover:text-primary transition-colors">{t("\n                    Compare libraries...\n                  ")}</span>

<span className="font-body-sm text-[11px] text-on-surface-variant block">{t("Dual-matrix side by side")}</span>

</div>

</div>

<kbd className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm tracking-widest">{"\n                C\n              "}</kbd>

</Link>
); }

export function HighlightedTitle({ title, query }: { title: string; query: string }) {
 const word = query.trim().split(/\s+/)[0] ?? "";
 const index = title.toLocaleLowerCase().indexOf(word.toLocaleLowerCase());
 if (!word || index < 0) return <>{title}</>;
 return <>{title.slice(0, index)}<mark className="bg-transparent text-primary underline decoration-primary/40 underline-offset-2">{title.slice(index, index + word.length)}</mark>{title.slice(index + word.length)}</>;
}
