"use client";
import { useMessages } from "@/components/site-preferences";

import { ProfileNavigation } from "@/components/profile-navigation";
import Link from "next/link";
import { usePortfolio } from "@/components/portfolio-provider";
import { groupTiers, loggedGames } from "@/lib/portfolio-view";
import type { Game } from "@/types/domain";



export function TiersScreen() {
  const t = useMessages();
const { games, profile, publicBase } = usePortfolio();
const logged = loggedGames(games);
const groups = groupTiers(logged);
return (<>
<div className="w-full  bg-surface"><div className="flex flex-col w-full">

<div className="relative w-full site-container mx-auto px-4 sm:px-6 lg:px-12 py-10 flex flex-col gap-10">

<div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-gradient-to-b from-primary/10 via-tertiary/5 to-transparent blur-3xl pointer-events-none -z-10"></div>

{!publicBase && <ProfileNavigation />}
<section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
<div className="flex flex-col gap-2">
<div className="flex flex-wrap items-center gap-3">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-container text-primary font-label-sm text-label-sm uppercase tracking-widest font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
{t("\n            Tier List\n          ")}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t("Playlogg")}</span>

</div>

<h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">{t("\n          Personal Tier Board\n        ")}</h1>

<Link href={publicBase ? `${publicBase}/lists` : "/lists"} className="text-primary font-label-md text-label-md hover:underline">{t("Curated lists")}</Link>
<p className="font-body-md text-body-md text-on-surface-variant">{t(logged.length + " logged titles grouped by independently selected tiers.")}</p>

</div>

<div className="flex flex-wrap items-center gap-2 p-1.5 bg-surface-container rounded-lg self-start md:self-auto max-w-full">
<a className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-bright transition-colors text-on-surface group" href="#tier-s">
<span className="font-label-md text-label-md font-bold text-primary">{"S"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{groups.find((group) => group.tier === "S")!.games.length}</span>

</a>

<a className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface group" href="#tier-a">
<span className="font-label-md text-label-md font-bold text-secondary">{"A"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{groups.find((group) => group.tier === "A")!.games.length}</span>

</a>

<a className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface group" href="#tier-b">
<span className="font-label-md text-label-md font-bold text-tertiary">{"B"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{groups.find((group) => group.tier === "B")!.games.length}</span>

</a>

<a className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface group" href="#tier-c">
<span className="font-label-md text-label-md font-bold text-outline">{"C"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{groups.find((group) => group.tier === "C")!.games.length}</span>

</a>

<a className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface group" href="#tier-d">
<span className="font-label-md text-label-md font-bold text-on-surface-variant">{"D"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{groups.find((group) => group.tier === "D")!.games.length}</span>

</a>

<a className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface group" href="#tier-f">
<span className="font-label-md text-label-md font-bold text-error">{"F"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{groups.find((group) => group.tier === "F")!.games.length}</span>

</a>

</div>

</section>

<div className="flex flex-col gap-6 w-full">
{groups.filter((group) => group.tier !== null || group.games.length > 0).map((group) => {
 const key = group.tier ?? "Unassigned";
 const theme = tierThemes[key];
 return <section key={key} className="flex flex-col md:flex-row gap-4 p-4 lg:p-6 rounded-xl bg-surface-container-low shadow-sm" id={"tier-" + key.toLowerCase()}>
 <div className="flex flex-wrap gap-2 md:flex-col justify-between items-center md:items-start w-full md:w-44 flex-shrink-0 p-4 rounded-lg bg-surface-container">
 <div className="flex items-center md:flex-col md:items-start gap-2"><span className={"font-display-lg text-display-lg font-bold leading-none " + theme.color}>{group.tier ?? "—"}</span><div className="flex flex-col"><span className="font-label-md text-label-md font-semibold uppercase tracking-wider text-on-surface">{t(theme.label)}</span>{!group.tier && <span className={"font-label-sm text-label-sm " + theme.color}>{t("No tier selected")}</span>}</div></div>
 <div className="flex items-center gap-1.5 pt-0 md:pt-6"><span className="font-label-sm text-label-sm text-on-surface-variant">{group.games.length} {group.games.length === 1 ? t("game") : t("games")}</span><span className={"w-1.5 h-1.5 rounded-full bg-current " + theme.color}></span></div>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 flex-1 min-w-0">
 {group.games.map((game) => <TierCard key={game.slug} game={game} color={theme.color} publicBase={publicBase} />)}
 {group.games.length === 0 && <p className="col-span-full py-8 font-body-sm text-body-sm text-on-surface-variant">{t("No games assigned to this tier.")}</p>}
 </div>
 </section>;
})}
</div>
<div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-surface-container-low text-on-surface-variant mt-4">
<div className="flex items-center gap-3">
<span aria-hidden="true" className="material-symbols-outlined text-primary text-xl">{"auto_awesome"}</span>

<span className="font-body-sm text-body-sm">{publicBase ? t("Published ratings and independent tiers from this profile.") : profile.isSample ? t("Sample ratings. Sign in to save your own scores and independent tiers.") : t("Your saved ratings. Edit scores and independent tiers in the game log.")}</span>

</div>



</div>

</div>

</div>
</div>
</>);
}

const tierThemes: Record<string, { label: string; color: string }> = {"S":{"label":"Pinnacle","color":"text-primary"},"A":{"label":"Essential","color":"text-secondary"},"B":{"label":"Commendable","color":"text-tertiary"},"C":{"label":"Average","color":"text-outline"},"D":{"label":"Subpar","color":"text-on-surface-variant"},"F":{"label":"Unplayable","color":"text-error"},"Unassigned":{"label":"Unassigned","color":"text-on-surface-variant"}};
function TierCard({ game, color, publicBase }: { game: Game; color: string; publicBase?: string }) {
  const t = useMessages();

 return <div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
 <div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high"><img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src={game.cover} alt={game.title} /></div>
 <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow"><span className={"font-label-sm text-label-sm font-bold " + color}>{game.score ?? "—"}</span></div>
 <div className="p-2.5 flex flex-col bg-surface-container"><h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="block truncate after:absolute after:inset-0" href={(publicBase ?? "") + "/game/" + game.slug}>{game.title}</Link></h2><span className="font-label-sm text-label-sm text-on-surface-variant truncate">{game.year ?? t("Release year unavailable")}</span></div>
 </div>;
}
