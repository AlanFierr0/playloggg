import { ProfileAvatar } from "@/components/profile-avatar";
import Link from "next/link";
import { PreviewAction } from "@/components/preview-action";
import type { Game } from "@/types/domain";
import { playbackLabels } from "@/lib/playback-status";

export function GameScreen({ game, isSample = true }: { game: Game; isSample?: boolean }) {
const isReference = game.slug === "elden-ring-shadow-of-the-erdtree";
return (<>
<div className="w-full  bg-surface"><div className="flex flex-col w-full">

<div className="relative w-full -mt-16 overflow-hidden bg-surface-container-lowest">

<div className="absolute inset-0 w-full h-[620px] bg-cover bg-top opacity-35 filter brightness-75 contrast-125" role="img" aria-label={`${game.title} artwork`} style={{ backgroundImage: game.artwork ? `url(${game.artwork})` : undefined }}></div>

<div className="absolute inset-0 bg-gradient-to-b from-surface/70 via-surface/85 to-surface pointer-events-none"></div>

<div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-surface/80 pointer-events-none"></div>

<div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-12">

<nav className="flex items-center gap-2 mb-8">
<Link className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md uppercase tracking-wider group" data-path="discover" href="/">
<span className="material-symbols-outlined text-[15px] group-hover:-translate-x-0.5 transition-transform">{"arrow_back"}</span>

<span>{"Discover"}</span>

</Link>

<span className="text-surface-variant font-label-sm">{"/"}</span>

<span className="text-on-surface-variant/70 font-label-md text-label-md uppercase tracking-wider">{"Titles"}</span>

<span className="text-surface-variant font-label-sm">{"/"}</span>

<span className="text-primary font-label-md text-label-md uppercase tracking-wider font-semibold truncate max-w-xs md:max-w-none">{game.title}</span>

</nav>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

<div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
<div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-surface-container-high shadow-2xl group">
<img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" alt={game.title} src={game.cover} />

<div className="absolute top-3.5 right-3.5 bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded shadow-lg flex items-center gap-1.5">
<span className="material-symbols-outlined text-primary text-[14px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"hotel_class"}</span>

<span className="font-label-md text-label-md text-primary font-bold tracking-tight">{game.score ?? "Unrated"}</span>

<span className="text-on-surface-variant/60 font-label-sm text-label-sm">{"/100"}</span>

</div>

<div className="absolute bottom-3 left-3 bg-surface-container-lowest/85 backdrop-blur-sm px-2 py-0.5 rounded text-on-surface font-label-sm text-label-sm uppercase tracking-widest">{"\n              DLC · Expansion\n            "}</div>

</div>

<div className="grid grid-cols-3 gap-2 bg-surface-container-low p-2.5 rounded text-center">
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{"Median"}</span>

<span className="font-label-md text-label-md font-bold text-on-surface">{"42.5 hrs"}</span>

</div>

<div className="flex flex-col bg-surface-container/60 rounded py-0.5">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{"Ranked"}</span>

<span className="font-label-md text-label-md font-bold text-primary">{"#1 / 2024"}</span>

</div>

<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{"Logs"}</span>

<span className="font-label-md text-label-md font-bold text-on-surface">{"142.8k"}</span>

</div>

</div>

</div>

<div className="lg:col-span-8 xl:col-span-9 flex flex-col justify-between">
<div className="flex flex-col gap-4">

<div className="flex flex-wrap items-center gap-2">
<span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-label-sm text-label-sm tracking-wider uppercase font-semibold">{"\n                Tier S · Masterpiece\n              "}</span>

<span className="text-on-surface-variant/40">{"•"}</span>

<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{isReference ? "FromSoftware" : "Sample developer"}</span>

<span className="text-on-surface-variant/40">{"•"}</span>

<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{isReference ? "Bandai Namco Entertainment" : "Sample publisher"}</span>

</div>

<h1 className="font-headline-xl text-headline-xl lg:text-[44px] lg:leading-[48px] text-on-surface tracking-tight font-bold">{game.title}</h1>

<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-label-md text-label-md text-on-surface-variant">
<span>{isReference ? "Released June 21, 2024" : "Release information pending"}</span>

<span className="text-surface-variant">{"•"}</span>

<span>{isReference ? "Action RPG / Dark Fantasy" : "Sample genre information"}</span>

<span className="text-surface-variant">{"•"}</span>

<div className="flex items-center gap-1.5 text-on-surface">
<span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm">{"PC"}</span>

<span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm">{"PS5"}</span>

<span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm">{"XSX"}</span>

</div>

</div>

<div className="mt-4 p-5 rounded-lg bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
<div className="flex flex-col min-[360px]:flex-row items-start min-[360px]:items-center gap-5">

<div className="flex items-baseline gap-1 bg-surface-container-lowest px-4 py-3 rounded-lg text-primary">
<span className="font-display-lg text-display-lg font-bold tracking-tight">{game.score ?? "—"}</span>

<span className="font-label-md text-label-md text-on-surface-variant/70">{"/100"}</span>

</div>

<div className="flex flex-col gap-0.5">
<div className="flex items-center gap-2">
<span className="font-headline-md text-headline-md text-on-surface font-bold">{game.score === null ? "No rating yet" : isSample ? "Sample profile rating" : "Your rating"}</span>

<span className="material-symbols-outlined text-secondary text-[20px]" title="Sample profile">{"verified"}</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant">{game.score === null ? "This profile has not rated this game." : isSample ? "From the published sample profile. Community statistics and editorial reviews below are illustrative." : "Your saved score. Community statistics and editorial reviews below are illustrative."}</p>
{game.status && <p className="mt-2 font-label-md text-label-md text-primary">{playbackLabels[game.status]}</p>}
{!isSample && game.review && <div className="mt-4"><h2 className="font-label-md text-label-md text-primary">Your saved review</h2><p className="mt-2 whitespace-pre-wrap break-words font-body-md text-body-md text-on-surface">{game.review}</p></div>}

<div className="flex items-center gap-3 mt-1 font-label-sm text-label-sm text-on-surface-variant/80">
<span className="text-secondary font-semibold">{game.tier ? "Tier " + game.tier : "Unassigned tier"}</span>

<span>{"•"}</span>

<span>{"Independent of score"}</span>

</div>

</div>

</div>

<div className="hidden xl:flex flex-col items-end gap-1.5">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{"Score Stability"}</span>

<div className="flex items-end gap-1 h-9 px-2 py-1 rounded bg-surface-container">
<span className="w-1.5 bg-primary/40 h-5 rounded-xs"></span>

<span className="w-1.5 bg-primary/60 h-6 rounded-xs"></span>

<span className="w-1.5 bg-primary/70 h-7 rounded-xs"></span>

<span className="w-1.5 bg-primary/80 h-7 rounded-xs"></span>

<span className="w-1.5 bg-primary h-8 rounded-xs"></span>

<span className="w-1.5 bg-primary h-8 rounded-xs"></span>

</div>

<span className="font-label-sm text-label-sm text-primary font-bold">{"Δ +0.4 pts"}</span>

</div>

</div>

<div className="mt-2 flex flex-wrap items-center gap-3">

<Link className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary-container text-on-primary-container hover:bg-primary font-label-md text-label-md tracking-wider uppercase font-semibold transition-all shadow-md active:scale-[0.98]" href={"/log?game=" + game.slug}>
<span className="material-symbols-outlined text-[18px]">{"add_circle"}</span>

<span>{"Log / Rate Game"}</span>

</Link>

<PreviewAction className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-surface-container text-on-surface hover:bg-surface-container-high hover:text-primary transition-all font-label-md text-label-md uppercase tracking-wider" message={"Preview only: this feature is not connected yet."}>
<span className="material-symbols-outlined text-[18px]">{"bookmark_add"}</span>

<span>{"Shelve to Vault"}</span>

</PreviewAction>

<Link className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-surface-container text-on-surface hover:bg-surface-container-high transition-all font-label-md text-label-md uppercase tracking-wider" href="/tiers">
<span className="material-symbols-outlined text-[18px]">{"format_list_bulleted_add"}</span>

<span>{"Add to Tier List"}</span>

</Link>

<Link className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-surface-container text-on-surface hover:bg-surface-container-high transition-all font-label-md text-label-md uppercase tracking-wider" data-path="compare" href="/compare">
<span className="material-symbols-outlined text-[18px]">{"compare_arrows"}</span>

<span>{"Compare"}</span>

</Link>

<PreviewAction className="p-2.5 rounded bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors ml-auto" title="Share Title" message={"Preview only: this feature is not connected yet."}>
<span className="material-symbols-outlined text-[18px]">{"share"}</span>

</PreviewAction>

</div>

</div>

</div>

</div>

</div>

</div>

<div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 w-full">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

<div className="lg:col-span-8 flex flex-col gap-10">

<section className="bg-surface-container-low rounded-xl p-5 shadow-sm relative overflow-hidden">
<div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
<div className="flex items-center gap-4">
<ProfileAvatar name={isSample ? "Alex Vance" : "Owner"} className="w-12 h-12 rounded-full object-cover" />

<div className="flex flex-col">
<div className="flex items-center gap-2">
<span className="font-headline-md text-headline-md text-on-surface font-semibold">{"Your Personal Standpoint"}</span>

<span className="px-2 py-0.5 rounded bg-primary/15 text-primary font-label-sm text-label-sm font-bold uppercase">{"Rank #1"}</span>

</div>

<div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-body-sm text-body-sm text-on-surface-variant">
<span>{"Rated "}<strong className="text-primary font-bold">{"98 / 100"}</strong>
{" (Tier S)"}</span>

<span>{"•"}</span>

<span>{"Logged in "}<strong className="text-on-surface">{"78.4 hrs"}</strong>
</span>

<span>{"•"}</span>

<span>{"Completed July 4, 2024"}</span>

</div>

</div>

</div>

<div className="flex items-center gap-2 self-end sm:self-center">
<Link className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container text-on-surface hover:text-primary hover:bg-surface-container-high transition-colors font-label-sm text-label-sm uppercase tracking-wider" href={"/log?game=" + game.slug}>
<span className="material-symbols-outlined text-[15px]">{"edit"}</span>

<span>{"Edit Standpoint"}</span>

</Link>

</div>

</div>

<div className="mt-4 pt-3 bg-surface-container-lowest/50 p-3.5 rounded text-on-surface-variant font-body-sm text-body-sm italic">{"\n            \"The vertical density of the Land of Shadow remains unrivaled in contemporary level design. The dual encounters with Messmer and Promised Consort pushed tactile timing into high art.\"\n          "}</div>

</section>

<section className="flex flex-col gap-4">
<div className="flex items-center justify-between">
<h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight flex items-center gap-2">
<span>{"Curatorial Overview"}</span>

<span className="text-primary text-[18px] font-label-md font-normal">{"/ 01"}</span>

</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{"FromSoftware Catalog ID: ER-SOTE-24"}</span>

</div>

<div className="prose max-w-none text-on-surface-variant font-body-lg text-body-lg leading-relaxed flex flex-col gap-4">
<p>{isReference ? (<>{"\n              Guided by Empyrean Miquella, players enter the Land of Shadow—a realm obscured by the Erdtree where the goddess Marika first set foot. Rather than merely expanding scale horizontally, "}<em className="text-on-surface not-italic font-semibold">{"Shadow of the Erdtree"}</em>
{" folds inwards, presenting a labyrinthine vertical mountainscape of ruined fortresses, subterranean abysses, and spectral moors dripping with the sap of the veiled Scadutree.\n            "}</>) : "This is a preview entry. Its editorial details and reviews are sample content."}</p>

<p>{isReference ? (<>{"\n              Hidetaka Miyazaki’s design team abandons standard open-world signposting in favor of organic, architectural discoveries. Legacy dungeons like the Belurat Tower Settlement and the Shadow Keep represent the pinnacle of FromSoftware's environmental composition, seamlessly blending somber environmental storytelling with brutally choreographed encounters that test even max-level Tarnished.\n            "}</>) : "This is a preview entry. Its editorial details and reviews are sample content."}</p>

</div>

<div className="flex flex-wrap items-center gap-2 pt-2">
<span className="px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-high transition-colors">{"\n              #Soulslike\n            "}</span>

<span className="px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-high transition-colors">{"\n              #Vertical Architecture\n            "}</span>

<span className="px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-high transition-colors">{"\n              #Masterpiece Bosses\n            "}</span>

<span className="px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-high transition-colors">{"\n              #Miquella Lore\n            "}</span>

<span className="px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-high transition-colors">{"\n              #Atmospheric Melancholy\n            "}</span>

<span className="px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-high transition-colors">{"\n              #Steam Deck Verified\n            "}</span>

</div>

</section>

<section className="flex flex-col gap-4">
<div className="flex items-center justify-between">
<h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight flex items-center gap-2">
<span>{"Following Concordance"}</span>

<span className="text-primary text-[18px] font-label-md font-normal">{"/ 02"}</span>

</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{"3 Curators Followed"}</span>

</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-3">

<div className="p-4 rounded-lg bg-surface-container-low flex flex-col justify-between gap-3 shadow-sm hover:bg-surface-container transition-colors">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-label-md text-on-surface font-bold">{"HK"}</div>

<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold text-on-surface">{"Hideo Kojima"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant">{"@hideo_director"}</span>

</div>

</div>

<div className="bg-primary/10 text-primary px-2 py-0.5 rounded font-label-md text-label-md font-bold">{"\n                  98\n                "}</div>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 italic">{"\n                \"A pure manifestation of connection thesis beyond traditional ludology. Miyazaki has mastered silence.\"\n              "}</p>

</div>

<div className="p-4 rounded-lg bg-surface-container-low flex flex-col justify-between gap-3 shadow-sm hover:bg-surface-container transition-colors">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-label-md text-secondary font-bold">{"ER"}</div>

<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold text-on-surface">{"Elena Rostova"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant">{"@rostova_critique"}</span>

</div>

</div>

<div className="bg-primary/10 text-primary px-2 py-0.5 rounded font-label-md text-label-md font-bold">{"\n                  99\n                "}</div>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 italic">{"\n                \"Unrivaled architectural majesty. The Shadow Keep sets an insurmountable benchmark for vertical level craft.\"\n              "}</p>

</div>

<div className="p-4 rounded-lg bg-surface-container-low flex flex-col justify-between gap-3 shadow-sm hover:bg-surface-container transition-colors">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-label-md text-on-surface font-bold">{"JS"}</div>

<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold text-on-surface">{"Jason Schreier"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant">{"@jschreier"}</span>

</div>

</div>

<div className="bg-secondary/10 text-secondary px-2 py-0.5 rounded font-label-md text-label-md font-bold">{"\n                  96\n                "}</div>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 italic">{"\n                \"Bigger than most standalone games, tighter than any other sandbox this decade. An unbelievable achievement.\"\n              "}</p>

</div>

</div>

</section>

<section className="flex flex-col gap-4">
<div className="flex items-center justify-between">
<h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight flex items-center gap-2">
<span>{"Curator Dispatches"}</span>

<span className="text-primary text-[18px] font-label-md font-normal">{"/ 03"}</span>

</h2>

<div className="flex items-center gap-3">
<PreviewAction className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold" message={"Preview only: this feature is not connected yet."}>{"Most Helpful"}</PreviewAction>

<span className="text-surface-variant">{"|"}</span>

<PreviewAction className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors" message={"Preview only: this feature is not connected yet."}>{"Recent"}</PreviewAction>

</div>

</div>

<div className="flex flex-col gap-4">

<article className="p-6 rounded-lg bg-surface-container-low flex flex-col gap-4 shadow-sm">
<div className="flex flex-col min-[360px]:flex-row items-start justify-between gap-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-label-md font-bold">{"\n                    MK\n                  "}</div>

<div className="flex flex-col">
<div className="flex items-center gap-2">
<span className="font-headline-md text-headline-md text-on-surface font-semibold">{"Marius Kane"}</span>

<span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">{"Senior Fellow"}</span>

</div>

<span className="font-label-sm text-label-sm text-on-surface-variant">{"Logged on PC · 94.2 hrs logged · June 28, 2024"}</span>

</div>

</div>

<div className="flex items-center gap-2">
<div className="bg-primary/10 text-primary px-3 py-1 rounded font-label-lg text-label-lg font-bold">{"\n                    98 / 100\n                  "}</div>

</div>

</div>

<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{isReference ? (<>{"\n                Shadow of the Erdtree is not content to simply provide more Lands Between. It reshapes the grammar of FromSoftware's open space: no longer a planar field dotted with ruins, but an interlocking origami of plateaus, subterranean waterways, and abyssal descent. The final confrontation demands rhythm and discipline that feels almost musical.\n              "}</>) : "This is a preview entry. Its editorial details and reviews are sample content."}</p>

<div className="flex items-center justify-between pt-2">
<div className="flex items-center gap-4 text-on-surface-variant font-label-sm text-label-sm">
<PreviewAction className="inline-flex items-center gap-1 hover:text-primary transition-colors" message={"Preview only: this feature is not connected yet."}>
<span className="material-symbols-outlined text-[16px]">{"thumb_up"}</span>

<span>{"1,429 Curator Agrees"}</span>

</PreviewAction>

<PreviewAction className="inline-flex items-center gap-1 hover:text-primary transition-colors" message={"Preview only: this feature is not connected yet."}>
<span className="material-symbols-outlined text-[16px]">{"chat_bubble_outline"}</span>

<span>{"84 Notes"}</span>

</PreviewAction>

</div>

<span className="font-label-sm text-label-sm text-on-surface-variant/50">{"Curator Digest Issue #402"}</span>

</div>

</article>

<article className="p-6 rounded-lg bg-surface-container-low flex flex-col gap-4 shadow-sm">
<div className="flex flex-col min-[360px]:flex-row items-start justify-between gap-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-secondary font-label-md font-bold">{"\n                    SA\n                  "}</div>

<div className="flex flex-col">
<div className="flex items-center gap-2">
<span className="font-headline-md text-headline-md text-on-surface font-semibold">{"Sora Takahashi"}</span>

<span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">{"Curator"}</span>

</div>

<span className="font-label-sm text-label-sm text-on-surface-variant">{"Logged on PS5 · 61.0 hrs logged · July 2, 2024"}</span>

</div>

</div>

<div className="flex items-center gap-2">
<div className="bg-primary/10 text-primary px-3 py-1 rounded font-label-lg text-label-lg font-bold">{"\n                    97 / 100\n                  "}</div>

</div>

</div>

<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{isReference ? (<>{"\n                The Scadutree fragment progression elegantly circumvents the base game’s endgame over-leveling crisis, creating an unyielding tension reminiscent of our initial hours entering Limgrave. Yuka Kitamura's musical motifs echo through the scorched tombs with tragic grace.\n              "}</>) : "This is a preview entry. Its editorial details and reviews are sample content."}</p>

<div className="flex items-center justify-between pt-2">
<div className="flex items-center gap-4 text-on-surface-variant font-label-sm text-label-sm">
<PreviewAction className="inline-flex items-center gap-1 hover:text-primary transition-colors" message={"Preview only: this feature is not connected yet."}>
<span className="material-symbols-outlined text-[16px]">{"thumb_up"}</span>

<span>{"892 Curator Agrees"}</span>

</PreviewAction>

<PreviewAction className="inline-flex items-center gap-1 hover:text-primary transition-colors" message={"Preview only: this feature is not connected yet."}>
<span className="material-symbols-outlined text-[16px]">{"chat_bubble_outline"}</span>

<span>{"32 Notes"}</span>

</PreviewAction>

</div>

<span className="font-label-sm text-label-sm text-on-surface-variant/50">{"Curator Digest Issue #408"}</span>

</div>

</article>

<article className="p-6 rounded-lg bg-surface-container-low flex flex-col gap-4 shadow-sm">
<div className="flex flex-col min-[360px]:flex-row items-start justify-between gap-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface font-label-md font-bold">{"\n                    DL\n                  "}</div>

<div className="flex flex-col">
<div className="flex items-center gap-2">
<span className="font-headline-md text-headline-md text-on-surface font-semibold">{"David Lindqvist"}</span>

<span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">{"Archivist"}</span>

</div>

<span className="font-label-sm text-label-sm text-on-surface-variant">{"Logged on PC · 112.5 hrs logged · July 11, 2024"}</span>

</div>

</div>

<div className="flex items-center gap-2">
<div className="bg-secondary/10 text-secondary px-3 py-1 rounded font-label-lg text-label-lg font-bold">{"\n                    95 / 100\n                  "}</div>

</div>

</div>

<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{isReference ? (<>{"\n                A relentless, unapologetic expansion that asks players to unlearn complacency. The Scadualtar and Abyssal Woods explore dread with horror-game intimacy. Minor camera frictions during hyper-dense boss animations keep it just shy of absolute formal perfection.\n              "}</>) : "This is a preview entry. Its editorial details and reviews are sample content."}</p>

<div className="flex items-center justify-between pt-2">
<div className="flex items-center gap-4 text-on-surface-variant font-label-sm text-label-sm">
<PreviewAction className="inline-flex items-center gap-1 hover:text-primary transition-colors" message={"Preview only: this feature is not connected yet."}>
<span className="material-symbols-outlined text-[16px]">{"thumb_up"}</span>

<span>{"614 Curator Agrees"}</span>

</PreviewAction>

<PreviewAction className="inline-flex items-center gap-1 hover:text-primary transition-colors" message={"Preview only: this feature is not connected yet."}>
<span className="material-symbols-outlined text-[16px]">{"chat_bubble_outline"}</span>

<span>{"19 Notes"}</span>

</PreviewAction>

</div>

<span className="font-label-sm text-label-sm text-on-surface-variant/50">{"Curator Digest Issue #412"}</span>

</div>

</article>

</div>

</section>

</div>

<div className="lg:col-span-4 flex flex-col gap-8">

<div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-5 shadow-sm">
<div className="flex items-center justify-between">
<span className="font-headline-md text-headline-md text-on-surface font-semibold">{"Curator Rating Curve"}</span>

<span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-bold">{"Skew S-Tier"}</span>

</div>

<div className="flex flex-col gap-3 font-label-sm text-label-sm">

<div className="flex items-center gap-3">
<span className="w-14 text-on-surface font-semibold text-right">{"95–100"}</span>

<div className="flex-1 bg-surface-container-high h-4 rounded overflow-hidden p-0.5">
<div className="bg-primary h-full rounded-xs transition-all duration-1000" style={{"width": "72%"}}></div>

</div>

<span className="w-10 text-primary font-bold">{"72%"}</span>

</div>

<div className="flex items-center gap-3">
<span className="w-14 text-on-surface font-semibold text-right">{"90–94"}</span>

<div className="flex-1 bg-surface-container-high h-4 rounded overflow-hidden p-0.5">
<div className="bg-primary/70 h-full rounded-xs transition-all duration-1000" style={{"width": "18%"}}></div>

</div>

<span className="w-10 text-on-surface-variant">{"18%"}</span>

</div>

<div className="flex items-center gap-3">
<span className="w-14 text-on-surface-variant text-right">{"80–89"}</span>

<div className="flex-1 bg-surface-container-high h-4 rounded overflow-hidden p-0.5">
<div className="bg-secondary/60 h-full rounded-xs transition-all duration-1000" style={{"width": "7%"}}></div>

</div>

<span className="w-10 text-on-surface-variant">{"7%"}</span>

</div>

<div className="flex items-center gap-3">
<span className="w-14 text-on-surface-variant text-right">{"< 80"}</span>

<div className="flex-1 bg-surface-container-high h-4 rounded overflow-hidden p-0.5">
<div className="bg-on-surface-variant/30 h-full rounded-xs transition-all duration-1000" style={{"width": "3%"}}></div>

</div>

<span className="w-10 text-on-surface-variant">{"3%"}</span>

</div>

</div>

<div className="pt-3 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
<span>{"Sample: 12,490 logged users"}</span>

<span className="text-secondary font-semibold">{"Standard Dev: ±2.1"}</span>

</div>

</div>

<div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-4 shadow-sm">
<div className="flex items-center justify-between">
<span className="font-headline-md text-headline-md text-on-surface font-semibold">{"Curated In Lists"}</span>

<Link className="font-label-sm text-label-sm text-primary hover:underline uppercase tracking-wider" data-path="lists" href="/tiers">{"All 84 Lists"}</Link>

</div>

<div className="flex flex-col gap-3">

<PreviewAction className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex flex-col gap-1 group" message={"Preview only: this feature is not connected yet."}>
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md font-semibold text-on-surface group-hover:text-primary transition-colors">{"\n                  All-Time Masterpieces (95+)\n                "}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant">{"#3 / 48"}</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant">{"Curated by The Editorial Guild • 18.2k saves"}</p>

</PreviewAction>

<PreviewAction className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex flex-col gap-1 group" message={"Preview only: this feature is not connected yet."}>
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md font-semibold text-on-surface group-hover:text-primary transition-colors">{"\n                  FromSoftware Architecture & Lore\n                "}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant">{"#1 / 14"}</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant">{"Curated by Elena Rostova • 9.4k saves"}</p>

</PreviewAction>

<PreviewAction className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex flex-col gap-1 group" message={"Preview only: this feature is not connected yet."}>
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md font-semibold text-on-surface group-hover:text-primary transition-colors">{"\n                  GOTY 2024 Contenders\n                "}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant">{"#1 / 25"}</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant">{"Curated by Global Critic Aggregate • 34.1k saves"}</p>

</PreviewAction>

</div>

</div>

<div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-4 shadow-sm">
<span className="font-headline-md text-headline-md text-on-surface font-semibold">{"Technical Dossier"}</span>

<div className="flex flex-col gap-2.5 font-label-md text-label-md">
<div className="flex justify-between py-1.5 bg-surface-container/40 px-2 rounded">
<span className="text-on-surface-variant">{"Director"}</span>

<span className="text-on-surface font-medium">{"Hidetaka Miyazaki"}</span>

</div>

<div className="flex justify-between py-1.5 px-2">
<span className="text-on-surface-variant">{"Lead Designer"}</span>

<span className="text-on-surface font-medium">{"Kazuhiro Hamatani"}</span>

</div>

<div className="flex justify-between py-1.5 bg-surface-container/40 px-2 rounded">
<span className="text-on-surface-variant">{"Main Composer"}</span>

<span className="text-on-surface font-medium">{"Yuka Kitamura, Tsukasa Saitoh"}</span>

</div>

<div className="flex justify-between py-1.5 px-2">
<span className="text-on-surface-variant">{"Base Engine"}</span>

<span className="text-on-surface font-medium">{"FromSoftware Proprietary"}</span>

</div>

<div className="flex justify-between py-1.5 bg-surface-container/40 px-2 rounded">
<span className="text-on-surface-variant">{"Install Footprint"}</span>

<span className="text-on-surface font-medium">{"16.5 GB (Expansion)"}</span>

</div>

<div className="flex justify-between py-1.5 px-2">
<span className="text-on-surface-variant">{"Base Game Req."}</span>

<span className="text-secondary font-medium">{"Elden Ring (2022)"}</span>

</div>

</div>

</div>

</div>

</div>

</div>

</div>
</div>
</>);
}
