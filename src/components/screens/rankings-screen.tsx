"use client";
import Link from "next/link";
import { PreviewAction } from "@/components/preview-action";
import { useState } from "react";
import { matchesRankingFilter, type RankingFilter } from "@/data/prototype";

export function RankingsScreen() {
const [filter, setFilter] = useState<RankingFilter>("all");
return (<>
<div className="w-full  bg-surface"><div className="flex flex-col w-full">

<div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 py-10 overflow-x-clip">
<div className="absolute -top-12 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

<div className="absolute top-48 right-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

<header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12">
<div className="flex items-center gap-6">
<div className="relative group">
<img className="w-20 h-20 md:w-24 md:h-24 rounded object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC10WJHQ6xcmCtI2XkDbAxNeCgHlTziNZCIa6dyUePhcgmillWuI7XgKGaA5K4Uu_IborQAlk_k7IbxskrCFDF9Gm0vqdtNYekQEmKf4ey8b5B3eqFIv7JGO21pzkFGV2cFYTQ48B2wiJa8r4wPRlLSi3x79XASkYLnyh0j6NjwrfDcdDscRZ_Rz0p1yvfYYOwqYMYxK76w62uX44_x4ezYtBrzXVvqetuk0Lih35IEFX9cHPTtbSD6" alt="Editorial square-cut cinematic portrait of a creative media archivist in soft dramatic chiaroscuro lighting, deep graphite tones with warm amber keylight edge, textured film grain" />

<span className="absolute bottom-1 right-1 w-3 h-3 bg-secondary rounded-full ring-2 ring-surface shadow-sm"></span>

</div>

<div className="space-y-1.5">
<div className="flex items-center gap-3">
<h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-semibold">{"\n              Alex Vance\n            "}</h1>

<span className="font-label-sm text-label-sm uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-medium">{"Curator"}</span>

</div>

<p className="font-label-md text-label-md text-on-surface-variant tracking-normal">{"\n            @alexvance\n          "}</p>

<div className="flex items-center gap-2 pt-1 font-label-sm text-label-sm text-on-surface-variant">
<span className="text-on-surface font-semibold">{"384"}</span>
{" Games Rated\n            "}<span className="text-outline-variant">{"/"}</span>

<span className="text-primary font-semibold">{"78"}</span>
{" Avg Score\n          "}</div>

</div>

</div>

<nav aria-label="Ranking Categories" className="flex items-center gap-6 md:gap-8 overflow-x-auto pb-1">
<button data-filter="all" onClick={() => setFilter("all")} aria-pressed={filter === "all"} className={filter === "all" ? "filter-btn active font-body-md text-body-md text-on-surface font-semibold tracking-tight transition-colors relative py-1" : "filter-btn font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors relative py-1"}>{"\n          All\n          "}<span className={"filter-indicator absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" + (filter === "all" ? "" : " hidden")}></span>

</button>

<button data-filter="masterpieces" onClick={() => setFilter("masterpieces")} aria-pressed={filter === "masterpieces"} className={filter === "masterpieces" ? "filter-btn active font-body-md text-body-md text-on-surface font-semibold tracking-tight transition-colors relative py-1" : "filter-btn font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors relative py-1"}>{"\n          Masterpieces (90+)\n          "}<span className={"filter-indicator absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" + (filter === "masterpieces" ? "" : " hidden")}></span>

</button>

<button data-filter="recommended" onClick={() => setFilter("recommended")} aria-pressed={filter === "recommended"} className={filter === "recommended" ? "filter-btn active font-body-md text-body-md text-on-surface font-semibold tracking-tight transition-colors relative py-1" : "filter-btn font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors relative py-1"}>{"\n          Recommended (75+)\n          "}<span className={"filter-indicator absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" + (filter === "recommended" ? "" : " hidden")}></span>

</button>

<button data-filter="backlog" onClick={() => setFilter("backlog")} aria-pressed={filter === "backlog"} className={filter === "backlog" ? "filter-btn active font-body-md text-body-md text-on-surface font-semibold tracking-tight transition-colors relative py-1" : "filter-btn font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors relative py-1"}>{"\n          Backlog\n          "}<span className={"filter-indicator absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" + (filter === "backlog" ? "" : " hidden")}></span>

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

<span className="font-label-sm text-label-sm text-on-surface font-medium uppercase tracking-wider">{"Critical Rank (Asc)"}</span>

</div>

</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
{filter === "backlog" && <p className="col-span-full py-10 font-body-md text-body-md text-on-surface-variant">No backlog entries in this sample profile.</p>}

{matchesRankingFilter(filter, 98, "completed") && (<article className="relative group flex flex-col cursor-pointer transition-transform duration-300" data-rank="1" data-score="98">
<div className="relative w-full aspect-[3/4] rounded bg-surface-container-low overflow-hidden shadow-xl">
<img className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdDwxkJwnIL8zh3IR87S76JC_q8DMN092a4QK6IlwuYSB3VQU3lzneYn3N301Bv6s1UnfOrh4S-NvVkYoSOocchSWWoxSZrcopHG4eHYVPuMrb5ryJ9T4uaHhSHfWW2JSGf5vbcCHEPB3WHVePXHIspxQAsI4ytHdcm9q3_-blAGEb9dl9ORb_jysY8c-yGpTAITkEg5L6klX7_cWfsuYM9VYAsCduE7QUJZ2KkVw3EgvhxVDj8b4I" alt="Elden Ring vertical atmospheric cover artwork showing the Erd Tree glowing faintly gold in misty dark shattered landscapes with Tarnished warrior looking on, high-end fine art rendering, dark obsidian tones, moody aesthetic" />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

<div className="absolute top-3 left-3 flex items-center">
<span className="font-label-md text-label-md font-bold px-2 py-1 rounded bg-surface-container-lowest/80 text-on-surface backdrop-blur-md shadow-md">{"#01"}</span>

</div>

<div className="absolute top-3 right-3 flex items-center">
<span className="font-label-md text-label-md font-bold px-2.5 py-1 rounded bg-surface-container-lowest/90 text-primary backdrop-blur-md shadow-md">{"98"}</span>

</div>

<div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">{"Masterpiece"}</span>

<div className="flex items-center gap-1 text-primary">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>

<span className="font-label-sm text-label-sm font-bold">{"5.0"}</span>

</div>

</div>

</div>

<div className="mt-3.5 space-y-1">
<div className="flex items-baseline justify-between gap-2">
<h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight truncate group-hover:text-primary transition-colors"><Link className="after:absolute after:inset-0" href="/game/elden-ring">{"\n              Elden Ring\n            "}</Link>
</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant flex-shrink-0">{"2022"}</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant truncate">{"\n            FromSoftware\n          "}</p>

</div>

</article>)}

{matchesRankingFilter(filter, 97, "completed") && (<article className="relative group flex flex-col cursor-pointer transition-transform duration-300" data-rank="2" data-score="97">
<div className="relative w-full aspect-[3/4] rounded bg-surface-container-low overflow-hidden shadow-xl">
<img className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUA17JUFqOTxEhe-2AbD9brJEtpu1QHBEKJUNJRqd1qxrlwTgjomudlkhA2l1WjU8hqlvxpxRNvPHr_-al571DwWbyZhwmU1E2GgGPGzUVH-83DZOLSX7JjfbeoNa1s_L6EsM0paQPUGA5rwlfpL6mtE5ptBK0sMAf7hK5KNjSMctet15u2G6ZRlfm7fr_mm2jYvtPu9sbX6mbwcuWdoc-_zFaCnXBDCFDodb5Y_8P9ZtafuJOZgtr" alt="Baldurs Gate 3 dark fantasy portrait poster showing illithid mindflayer silhouette and glowing nautiloid ship amid violet and amber gothic night sky, cinematic editorial poster composition" />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

<div className="absolute top-3 left-3 flex items-center">
<span className="font-label-md text-label-md font-bold px-2 py-1 rounded bg-surface-container-lowest/80 text-on-surface backdrop-blur-md shadow-md">{"#02"}</span>

</div>

<div className="absolute top-3 right-3 flex items-center">
<span className="font-label-md text-label-md font-bold px-2.5 py-1 rounded bg-surface-container-lowest/90 text-primary backdrop-blur-md shadow-md">{"97"}</span>

</div>

<div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">{"Masterpiece"}</span>

<div className="flex items-center gap-1 text-primary">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>

<span className="font-label-sm text-label-sm font-bold">{"5.0"}</span>

</div>

</div>

</div>

<div className="mt-3.5 space-y-1">
<div className="flex items-baseline justify-between gap-2">
<h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight truncate group-hover:text-primary transition-colors"><Link className="after:absolute after:inset-0" href="/game/baldurs-gate-3">{"\n              Baldur's Gate 3\n            "}</Link>
</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant flex-shrink-0">{"2023"}</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant truncate">{"\n            Larian Studios\n          "}</p>

</div>

</article>)}

{matchesRankingFilter(filter, 95, "completed") && (<article className="relative group flex flex-col cursor-pointer transition-transform duration-300" data-rank="3" data-score="95">
<div className="relative w-full aspect-[3/4] rounded bg-surface-container-low overflow-hidden shadow-xl">
<img className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkxc4ZHZWBjrHTA1pv1BXCGcdEYCSNyeupsGDrK6gr5zn6j0WJ1rL2DgpkVpfIl2B8IV3tkuNqKAtB71po9tH2t802Grl8VJmqEGDxXfwqHptKYuo4ZtyBV5xbFPzV5umzsI0CfzsZh-pCNxuUaOVnzgeakjGKAJi1p9Dt98GQou94wla-ujx6OkR0xuuFZCG8LJUzfGdA7x2BOyRQse5K8dNXVjlBCrNHcrXLS-wbK6tDjJFz1xuK" alt="Cyberpunk 2077 Night City vertical poster depicting rain-drenched skyscrapers with neon yellow high-contrast reflections and a lone nomad standing against vehicle headlights, moody dystopian photo style" />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

<div className="absolute top-3 left-3 flex items-center">
<span className="font-label-md text-label-md font-bold px-2 py-1 rounded bg-surface-container-lowest/80 text-on-surface backdrop-blur-md shadow-md">{"#03"}</span>

</div>

<div className="absolute top-3 right-3 flex items-center">
<span className="font-label-md text-label-md font-bold px-2.5 py-1 rounded bg-surface-container-lowest/90 text-primary backdrop-blur-md shadow-md">{"95"}</span>

</div>

<div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">{"Masterpiece"}</span>

<div className="flex items-center gap-1 text-primary">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>

<span className="font-label-sm text-label-sm font-bold">{"4.8"}</span>

</div>

</div>

</div>

<div className="mt-3.5 space-y-1">
<div className="flex items-baseline justify-between gap-2">
<h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight truncate group-hover:text-primary transition-colors"><Link className="after:absolute after:inset-0" href="/game/cyberpunk-2077">{"\n              Cyberpunk 2077\n            "}</Link>
</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant flex-shrink-0">{"2023"}</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant truncate">{"\n            CD PROJEKT RED\n          "}</p>

</div>

</article>)}

{matchesRankingFilter(filter, 94, "completed") && (<article className="relative group flex flex-col cursor-pointer transition-transform duration-300" data-rank="4" data-score="94">
<div className="relative w-full aspect-[3/4] rounded bg-surface-container-low overflow-hidden shadow-xl">
<img className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhXnI4_fIuy976kg3EZzbNpt-b0RZmQ2ygUOF9nTk6v0fpH2sBVpOCHOEEeelMy_CgCspd1nt6jfjp7f8EdcxbMgIDYt89DgG77DA8Axn-ivgfYj69wsymNb5J3qzxxXG5wzFIphkJB7qHvk-ZRnwOQWT3tQytS4PIy2O6gI_n6Z8oc-ABTJJDEFftr0SwMFCmwKJ81sNd1lHCn892kc5b5oL7rL_8YgGRBvKzzivVXsJYIZBJoELo" alt="Disco Elysium expressionist oil painting style poster of Revachol coastal winter harbor, brush stroked silhouette with cigarette glow and melancholic olive, amber and charcoal tones" />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

<div className="absolute top-3 left-3 flex items-center">
<span className="font-label-md text-label-md font-bold px-2 py-1 rounded bg-surface-container-lowest/80 text-on-surface backdrop-blur-md shadow-md">{"#04"}</span>

</div>

<div className="absolute top-3 right-3 flex items-center">
<span className="font-label-md text-label-md font-bold px-2.5 py-1 rounded bg-surface-container-lowest/90 text-primary backdrop-blur-md shadow-md">{"94"}</span>

</div>

<div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">{"Masterpiece"}</span>

<div className="flex items-center gap-1 text-primary">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>

<span className="font-label-sm text-label-sm font-bold">{"4.7"}</span>

</div>

</div>

</div>

<div className="mt-3.5 space-y-1">
<div className="flex items-baseline justify-between gap-2">
<h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight truncate group-hover:text-primary transition-colors"><Link className="after:absolute after:inset-0" href="/game/disco-elysium">{"\n              Disco Elysium\n            "}</Link>
</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant flex-shrink-0">{"2021"}</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant truncate">{"\n            ZA/UM\n          "}</p>

</div>

</article>)}

{matchesRankingFilter(filter, 93, "completed") && (<article className="relative group flex flex-col cursor-pointer transition-transform duration-300" data-rank="5" data-score="93">
<div className="relative w-full aspect-[3/4] rounded bg-surface-container-low overflow-hidden shadow-xl">
<img className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK7Wmk-0M6Nlk5bUKRwT5U_hVw0nX4uCLP5NjEfirCANwcHqYRTmwSFj67BCsXY5XZ66VgQ7LJmXrZZqwABSCHRmi6FTbjuS3N-hY5kTYeWrUw2LfLVt9FBvNkXae32jocM7Pgmwk4TA-QN4PJrmFSIRVbqADyamMxuSHHD3kFXuqw6K3F_nDCPewc1MDiWGmLnvBHg-WchQJ-czGHodixDUO-Ex6VyqsAUVRtN6ue5CjEp-y3D_no" alt="Half-Life 2 minimalist dystopian poster featuring City 17 towering dark Citadel structure, strider legs walking through desolate European cobblestone plaza, cool blue atmospheric haze with orange lambda insignia" />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

<div className="absolute top-3 left-3 flex items-center">
<span className="font-label-md text-label-md font-bold px-2 py-1 rounded bg-surface-container-lowest/80 text-on-surface backdrop-blur-md shadow-md">{"#05"}</span>

</div>

<div className="absolute top-3 right-3 flex items-center">
<span className="font-label-md text-label-md font-bold px-2.5 py-1 rounded bg-surface-container-lowest/90 text-primary backdrop-blur-md shadow-md">{"93"}</span>

</div>

<div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">{"Masterpiece"}</span>

<div className="flex items-center gap-1 text-primary">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>

<span className="font-label-sm text-label-sm font-bold">{"4.8"}</span>

</div>

</div>

</div>

<div className="mt-3.5 space-y-1">
<div className="flex items-baseline justify-between gap-2">
<h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight truncate group-hover:text-primary transition-colors"><Link className="after:absolute after:inset-0" href="/game/half-life-2">{"\n              Half-Life 2\n            "}</Link>
</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant flex-shrink-0">{"2004"}</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant truncate">{"\n            Valve\n          "}</p>

</div>

</article>)}

{matchesRankingFilter(filter, 92, "completed") && (<article className="relative group flex flex-col cursor-pointer transition-transform duration-300" data-rank="6" data-score="92">
<div className="relative w-full aspect-[3/4] rounded bg-surface-container-low overflow-hidden shadow-xl">
<img className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYvJ-pkAOE8X8BNi9ADVv98v72CE5cetzgCL_KcEfdyITFozG1C2GxhCWj59uEMrR9nyHW2qd1S4wSgL62g0TCE1NyamFRSwNUBDvGF_MA_jnqNR4sjT7FXLeZhkPom7DEx_5EUFQODIVBMKsr4k-vDAVMa0N6WzCkZHB7wBReIBo9EHMXkX-CRO1gVTRpNiU9OoXcTXvv42DnlaQe956676cgcknZv0953N-EeUZteQiv6D2m9fqe" alt="Alan Wake 2 psychological thriller poster art with Pacific Northwest dark pine forests double-exposed over deep crimson surreal spiral chamber, lone writer with flashlight cutting through shadow" />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

<div className="absolute top-3 left-3 flex items-center">
<span className="font-label-md text-label-md font-bold px-2 py-1 rounded bg-surface-container-lowest/80 text-on-surface backdrop-blur-md shadow-md">{"#06"}</span>

</div>

<div className="absolute top-3 right-3 flex items-center">
<span className="font-label-md text-label-md font-bold px-2.5 py-1 rounded bg-surface-container-lowest/90 text-primary backdrop-blur-md shadow-md">{"92"}</span>

</div>

<div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">{"Masterpiece"}</span>

<div className="flex items-center gap-1 text-primary">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>

<span className="font-label-sm text-label-sm font-bold">{"4.6"}</span>

</div>

</div>

</div>

<div className="mt-3.5 space-y-1">
<div className="flex items-baseline justify-between gap-2">
<h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight truncate group-hover:text-primary transition-colors"><Link className="after:absolute after:inset-0" href="/game/alan-wake-2">{"\n              Alan Wake 2\n            "}</Link>
</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant flex-shrink-0">{"2023"}</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant truncate">{"\n            Remedy Entertainment\n          "}</p>

</div>

</article>)}

{matchesRankingFilter(filter, 92, "completed") && (<article className="relative group flex flex-col cursor-pointer transition-transform duration-300" data-rank="7" data-score="92">
<div className="relative w-full aspect-[3/4] rounded bg-surface-container-low overflow-hidden shadow-xl">
<img className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4ZIfvCCbbXYG0Glfy35UaKnkvYBoqfQW9RTWyKRC8d1QLvOllBmzVFJ28MfzvsSKKY0kn8TbVW6WdKv4PxptrurNLRl5r_xPEyHzOs-cKeUS3043kz1Pwfi8CquZO8OMkQPqdzb_J3pXSpV2pZBpdbFIXChZl4pByxevN9q9wClbiSxEnvd_c9Pa07-TBxCmmxDMHvW9CNPDnnZFi_9g4QMXJn0fUP2WLome1SFz2bcDS-ilDDgzY" alt="Hades Greek myth stylized vertical artwork showing Zagreus wielding the Stygian Blade surrounded by underworld flames and blood-red Tartarus pillars, energetic graphic illustration style with sharp inks" />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

<div className="absolute top-3 left-3 flex items-center">
<span className="font-label-md text-label-md font-bold px-2 py-1 rounded bg-surface-container-lowest/80 text-on-surface backdrop-blur-md shadow-md">{"#07"}</span>

</div>

<div className="absolute top-3 right-3 flex items-center">
<span className="font-label-md text-label-md font-bold px-2.5 py-1 rounded bg-surface-container-lowest/90 text-primary backdrop-blur-md shadow-md">{"92"}</span>

</div>

<div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">{"Masterpiece"}</span>

<div className="flex items-center gap-1 text-primary">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>

<span className="font-label-sm text-label-sm font-bold">{"4.7"}</span>

</div>

</div>

</div>

<div className="mt-3.5 space-y-1">
<div className="flex items-baseline justify-between gap-2">
<h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight truncate group-hover:text-primary transition-colors"><Link className="after:absolute after:inset-0" href="/game/hades">{"\n              Hades\n            "}</Link>
</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant flex-shrink-0">{"2020"}</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant truncate">{"\n            Supergiant Games\n          "}</p>

</div>

</article>)}

{matchesRankingFilter(filter, 91, "completed") && (<article className="relative group flex flex-col cursor-pointer transition-transform duration-300" data-rank="8" data-score="91">
<div className="relative w-full aspect-[3/4] rounded bg-surface-container-low overflow-hidden shadow-xl">
<img className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7YiUk0GEGRvHGw7RnWE53Xe0sr0SDa6PecU5cMB9xWTcYbbdBhllKVuhL7laofsSvNbg1xD-yIxPHf9lPS86udWWhHopgbPsqaVC0r0xYbzYiN364IDVbczJWYMWVn6DDcrdTvYctYqCeOHu8EBRoT2NKVe5C4H6JaUtrk_iCmpBLXOb6ThUe_gysCtYd1WwnaIDWshr3_Bm_usohyv3etuPjFjm0i6fXMh0nF4-82YaTRoGot5c8" alt="Bloodborne gothic Victorian hunter standing in wet Yharnam cobblestone alley under pale blood moon with saw cleaver dripping, dark atmospheric horror photography style, sepia graphite highlights" />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

<div className="absolute top-3 left-3 flex items-center">
<span className="font-label-md text-label-md font-bold px-2 py-1 rounded bg-surface-container-lowest/80 text-on-surface backdrop-blur-md shadow-md">{"#08"}</span>

</div>

<div className="absolute top-3 right-3 flex items-center">
<span className="font-label-md text-label-md font-bold px-2.5 py-1 rounded bg-surface-container-lowest/90 text-primary backdrop-blur-md shadow-md">{"91"}</span>

</div>

<div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">{"Masterpiece"}</span>

<div className="flex items-center gap-1 text-primary">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>

<span className="font-label-sm text-label-sm font-bold">{"4.9"}</span>

</div>

</div>

</div>

<div className="mt-3.5 space-y-1">
<div className="flex items-baseline justify-between gap-2">
<h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight truncate group-hover:text-primary transition-colors"><Link className="after:absolute after:inset-0" href="/game/bloodborne">{"\n              Bloodborne\n            "}</Link>
</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant flex-shrink-0">{"2015"}</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant truncate">{"\n            FromSoftware\n          "}</p>

</div>

</article>)}

</div>

<footer className="pt-16 pb-6 flex items-center justify-between text-on-surface-variant">
<div className="flex items-center gap-3">
<PreviewAction aria-label="Previous Page" className="p-2 rounded hover:bg-surface-container-high hover:text-on-surface transition-colors disabled:opacity-30 disabled:pointer-events-none" disabled={true} message={"Preview only: this feature is not connected yet."}>
<span className="material-symbols-outlined text-[20px]">{"west"}</span>

</PreviewAction>

<span className="font-label-md text-label-md text-on-surface font-medium tracking-widest">{"\n          1 "}<span className="text-outline-variant font-normal">{"of"}</span>
{" 48\n        "}</span>

<PreviewAction aria-label="Next Page" className="p-2 rounded hover:bg-surface-container-high hover:text-on-surface transition-colors" message={"Preview only: this feature is not connected yet."}>
<span className="material-symbols-outlined text-[20px]">{"east"}</span>

</PreviewAction>

</div>

<div className="hidden sm:flex items-center gap-4 font-label-sm text-label-sm">
<span className="text-on-surface-variant/70">{"Displaying entries 1–8 of 384"}</span>

<span className="w-1 h-1 rounded-full bg-surface-container-highest"></span>

<span className="text-on-surface-variant/70">{"Updated 4h ago"}</span>

</div>

</footer>

</div>

</div>
</div>
</>);
}
