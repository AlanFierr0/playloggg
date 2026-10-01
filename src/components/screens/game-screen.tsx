import { getMessages } from "@/lib/locale/server";
import { ShelfLink, ShareGameButton } from "@/components/game-actions";
import { GameStandpoint } from "@/components/game-standpoint";
import Link from "next/link";
import type { Game } from "@/types/domain";
import { playbackLabels } from "@/lib/playback-status";
import { CatalogGameScreen } from "@/components/screens/catalog-game-screen";

export async function GameScreen({ game, isSample = true }: { game: Game; isSample?: boolean }) {
  const t = await getMessages();
if (game.isSampleCatalog === false) return <CatalogGameScreen game={game} isSample={isSample} />;
return (<>
<div className="w-full  bg-surface"><div className="flex flex-col w-full">

<div className="relative w-full -mt-16 overflow-hidden bg-surface-container-lowest">

<div className="absolute inset-0 w-full h-[620px] bg-cover bg-top opacity-35 filter brightness-75 contrast-125" role="img" aria-label={t(`${game.title} artwork`)} style={{ backgroundImage: game.artwork ? `url(${game.artwork})` : undefined }}></div>

<div className="absolute inset-0 bg-gradient-to-b from-surface/70 via-surface/85 to-surface pointer-events-none"></div>

<div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-surface/80 pointer-events-none"></div>

<div className="relative z-10 site-container mx-auto px-4 sm:px-6 lg:px-12 pt-8 lg:pt-28 pb-8 sm:pb-12">

<nav className="flex min-w-0 items-center gap-2 mb-6 sm:mb-8">
<Link className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md uppercase tracking-wider group" data-path="discover" href="/">
<span aria-hidden="true" className="material-symbols-outlined text-[15px] group-hover:-translate-x-0.5 transition-transform">{"arrow_back"}</span>

<span>{t("Discover")}</span>

</Link>

<span className="text-surface-variant font-label-sm">{"/"}</span>

<span className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">{t("Titles")}</span>

<span className="text-surface-variant font-label-sm">{"/"}</span>

<span className="text-primary font-label-md text-label-md uppercase tracking-wider font-semibold min-w-0 flex-1 truncate">{game.title}</span>

</nav>

<div className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">

<div className="sm:col-span-4 xl:col-span-3 w-full max-w-[240px] sm:max-w-none mx-auto flex min-w-0 flex-col gap-4">
<div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-surface-container-high shadow-2xl group">
<img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" alt={game.title} src={game.cover} />

<div className="absolute top-3.5 right-3.5 bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded shadow-lg flex items-center gap-1.5">
<span aria-hidden="true" className="material-symbols-outlined text-primary text-[14px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"hotel_class"}</span>

<span className="font-label-md text-label-md text-primary font-bold tracking-tight">{game.score ?? t("Unrated")}</span>

<span className="text-on-surface-variant font-label-sm text-label-sm">{"/100"}</span>

</div>

<div className="absolute bottom-3 left-3 bg-surface-container-lowest/85 backdrop-blur-sm px-2 py-0.5 rounded text-on-surface font-label-sm text-label-sm uppercase tracking-widest">{game.kind ?? t("Catalog game")}</div>

</div>


</div>

<div className="sm:col-span-8 xl:col-span-9 min-w-0 flex flex-col justify-between">
<div className="flex flex-col gap-4">

<div className="flex flex-wrap items-center gap-2">
<span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-label-sm text-label-sm tracking-wider uppercase font-semibold">{game.tier ? t(`Tier ${game.tier}`) : t("Tier unassigned")}</span>

<span className="text-on-surface-variant/40">{"•"}</span>

<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{game.developers?.join(" / ") || t("Developer unknown")}</span>

<span className="text-on-surface-variant/40">{"•"}</span>

<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{game.publishers?.join(" / ") || t("Publisher unknown")}</span>

</div>

<h1 className="font-headline-xl text-headline-xl lg:text-[44px] lg:leading-[48px] text-on-surface tracking-tight font-bold">{game.title}</h1>

<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-label-md text-label-md text-on-surface-variant">
<span>{game.releasedOn ? t(`Released ${game.releasedOn}`) : t("Release date unknown")}</span>

<span className="text-surface-variant">{"•"}</span>

<span>{game.genres?.join(" / ") || t("Genres unknown")}</span>

<span className="text-surface-variant">{"•"}</span>

<div className="flex flex-wrap items-center gap-1.5 text-on-surface">{game.platforms?.map(platform=><span key={platform} className="px-1.5 py-0.5 rounded bg-surface-container-high text-label-sm">{platform}</span>)}</div>

</div>

<div className="mt-4 p-5 rounded-lg bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
<div className="flex min-w-0 flex-col min-[360px]:flex-row items-start min-[360px]:items-center gap-5">

<div className="flex shrink-0 items-baseline gap-1 bg-surface-container-lowest px-4 py-3 rounded-lg text-primary">
<span className="font-display-lg text-display-lg font-bold tracking-tight">{game.score ?? "—"}</span>

<span className="font-label-md text-label-md text-on-surface-variant">{"/100"}</span>

</div>

<div className="flex min-w-0 flex-col gap-0.5">
<div className="flex items-center gap-2">
<span className="font-headline-md text-headline-md text-on-surface font-bold">{game.score === null ? t("No rating yet") : isSample ? t("Sample profile rating") : t("Your rating")}</span>

<span aria-hidden="true" className="material-symbols-outlined text-secondary text-[20px]" title={isSample ? "Sample profile rating" : "Your saved rating"}>{"verified"}</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant">{game.score === null ? t("This profile has not rated this game.") : isSample ? t("From the published sample profile.") : t("Your saved score.")}</p>
{game.status && <p className="mt-2 font-label-md text-label-md text-primary">{t(playbackLabels[game.status])}</p>}


<div className="flex flex-wrap items-center gap-3 mt-1 font-label-sm text-label-sm text-on-surface-variant/80">
<span className="text-secondary font-semibold">{game.tier ? t("Tier") + " " + game.tier : t("Unassigned tier")}</span>

<span>{"•"}</span>

<span>{t("Independent of score")}</span>

</div>

</div>

</div>


</div>

<div className="mt-2 grid grid-cols-1 min-[360px]:grid-cols-2 sm:flex sm:flex-wrap items-center gap-3">

<Link className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary-container text-on-primary-container hover:bg-primary font-label-md text-label-md tracking-wider uppercase font-semibold transition-all shadow-md active:scale-[0.98]" href={"/log?game=" + game.slug}>
<span aria-hidden="true" className="material-symbols-outlined text-[18px]">{"add_circle"}</span>

<span>{t("Log / Rate Game")}</span>

</Link>

<ShelfLink slug={game.slug} className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-surface-container text-on-surface hover:bg-surface-container-high hover:text-primary transition-all font-label-md text-label-md uppercase tracking-wider">
<span aria-hidden="true" className="material-symbols-outlined text-[18px]">{"bookmark_add"}</span>

<span>{t("Shelf")}</span>

</ShelfLink>

<Link className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-surface-container text-on-surface hover:bg-surface-container-high transition-all font-label-md text-label-md uppercase tracking-wider" href="/tiers">
<span aria-hidden="true" className="material-symbols-outlined text-[18px]">{"format_list_bulleted_add"}</span>

<span>{t("View tier board")}</span>

</Link>

<Link className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-surface-container text-on-surface hover:bg-surface-container-high transition-all font-label-md text-label-md uppercase tracking-wider" data-path="compare" href="/compare">
<span aria-hidden="true" className="material-symbols-outlined text-[18px]">{"compare_arrows"}</span>

<span>{t("Compare")}</span>

</Link>

<ShareGameButton slug={game.slug} className="p-2.5 rounded bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors ml-auto">
<span aria-hidden="true" className="material-symbols-outlined text-[18px]">{"share"}</span>

</ShareGameButton>

</div>

</div>

</div>

</div>

</div>

</div>

<div className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-10 w-full"><div className="grid grid-cols-1 lg:grid-cols-12 gap-10"><div className="lg:col-span-8 min-w-0 space-y-8">
<GameStandpoint game={game} />
<section className="space-y-4"><h2 className="font-headline-lg text-headline-lg font-bold">{t("About this game")}</h2><p className="whitespace-pre-wrap break-words text-on-surface-variant text-body-lg">{game.summary || t("No overview is available from IGDB yet.")}</p>{game.sourceUrl && <a href={game.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary">{t("View source on IGDB ↗")}</a>}</section>
{Boolean(game.screenshots?.length) && <section className="space-y-4"><h2 className="font-headline-lg text-headline-lg font-bold">{t("Screenshots")}</h2><div className="grid sm:grid-cols-2 gap-4">{game.screenshots!.map((src,index)=><img key={src} src={src} alt={t(`${game.title} screenshot ${index+1}`)} loading="lazy" className="w-full aspect-video rounded object-cover" />)}</div></section>}
</div><aside className="lg:col-span-4 min-w-0"><Link href="/tiers" className="text-primary">{t("View tier board")}</Link><br /><Link href="/lists" className="inline-flex mt-4 text-primary">{t("Curated lists →")}</Link></aside></div></div>
</div></div></>);
}
