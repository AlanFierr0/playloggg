import { gameImages } from "@/lib/game-images";
import Link from "next/link";
import { PreviewAction } from "@/components/preview-action";

export function HomeScreen() {
return (<>
<div className="w-full  bg-surface"><div className="flex flex-col w-full">

<div className="relative w-full overflow-hidden">
<div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none"></div>

<section className="site-container mx-auto px-4 sm:px-6 lg:px-12 pt-6 sm:pt-8 pb-8 sm:pb-20">
<div className="home-spotlight relative flex min-h-[560px] sm:min-h-[600px] flex-col justify-end rounded-xl overflow-hidden bg-surface-container-lowest shadow-2xl group">

<div className="absolute inset-0 bg-cover bg-center h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.015]" role="img" aria-label="Elden Ring: Shadow of the Erdtree artwork" style={{ backgroundImage: `url(${gameImages("elden-ring-shadow-of-the-erdtree").artwork})` }}>
</div>

<div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"></div>

<div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/40 to-transparent"></div>

<div className="relative z-10 mx-5 mt-5 sm:mx-12 sm:mt-8 flex flex-wrap items-center gap-3">
<span className="px-2.5 py-1 rounded bg-surface-container-high/80 backdrop-blur-md font-label-sm text-label-sm text-primary uppercase tracking-widest">{"Editor's Spotlight"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{"Vol. XIV • Curated Feature"}</span>

</div>

<div className="relative z-10 mt-auto p-5 sm:p-12 max-w-3xl flex flex-col gap-5">
<div className="flex flex-wrap items-center gap-3">
<span translate="no" className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{"FromSoftware"}</span>

<span className="text-on-surface-variant/40">{"•"}</span>

<span className="font-label-md text-label-md text-on-surface-variant">{"2024"}</span>

<span className="text-on-surface-variant/40">{"•"}</span>

<span className="font-label-md text-label-md text-on-surface-variant">{"Action RPG"}</span>

<div className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-primary-container/20 backdrop-blur-sm text-primary">
<span className="material-symbols-outlined text-[14px]" style={{"fontVariationSettings": "\"FILL\" 1"}}>{"star"}</span>

<span className="font-label-md text-label-md font-semibold">{"98"}</span>

<span className="font-label-sm text-label-sm text-primary/70">{"/ 100"}</span>

</div>

</div>

<h1 className="font-display-lg text-display-lg sm:text-[64px] sm:leading-[68px] text-on-surface tracking-tight">{"\n            Elden Ring:"}<br />

<span className="text-primary-fixed-dim font-light italic">{"Shadow of the Erdtree"}</span>

</h1>

<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl font-light leading-relaxed">{"\n            “An extraordinary elegy of ruin and majesty, where Miyazaki's subterranean architecture redefines the melancholic beauty of the open world.”\n          "}</p>

<div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-2">
<Link className="inline-flex items-center gap-2 px-6 py-3 rounded bg-primary text-on-primary hover:bg-primary-fixed-dim transition-all duration-200 font-label-md text-label-md uppercase tracking-wider font-semibold shadow-lg shadow-primary/10 hover:shadow-primary/20" data-path="game/elden-ring-shadow-of-the-erdtree" href="/game/elden-ring-shadow-of-the-erdtree">
<span className="">{"View Title"}</span>

<span className="material-symbols-outlined text-[16px]">{"arrow_forward"}</span>

</Link>

<PreviewAction className="inline-flex items-center gap-2 px-5 py-3 rounded bg-surface-container-high/70 hover:bg-surface-container-highest backdrop-blur-md text-on-surface transition-colors font-label-md text-label-md uppercase tracking-wider" message={"Preview only: this feature is not connected yet."}>
<span className="material-symbols-outlined text-[16px]">{"bookmark_border"}</span>

<span className="">{"Shelf"}</span>

</PreviewAction>

<PreviewAction className="inline-flex items-center justify-center w-11 h-11 rounded bg-surface-container-high/70 hover:bg-surface-container-highest backdrop-blur-md text-on-surface transition-colors" message={"Preview only: this feature is not connected yet."}>
<span className="material-symbols-outlined text-[18px]">{"share"}</span>

</PreviewAction>

</div>

</div>

</div>

</section>

<section className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
<div>
<span className="font-label-sm text-label-sm text-primary uppercase tracking-widest block mb-1">{"Archival Selection"}</span>

<h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">{"The Essential Canon"}</h2>

</div>

<Link className="group flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" data-path="games" href="/games">
<span className="">{"Explore All Games"}</span>

<span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">{"arrow_forward"}</span>

</Link>

</div>

<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">

<Link className="group flex flex-col" data-path="game/baldurs-gate-3" href="/game/baldurs-gate-3">
<div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-surface-container-low shadow-md transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={gameImages("baldurs-gate-3").cover} alt="Baldur's Gate III cover" />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

<div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-md">
<span className="font-label-sm text-label-sm font-semibold text-primary">{"97"}</span>

</div>

</div>

<div className="mt-3 flex flex-col">
<h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors truncate">{"Baldur's Gate 3"}</h3>

<span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{"2023 • Larian Studios"}</span>

</div>

</Link>

<Link className="group flex flex-col" data-path="game/disco-elysium" href="/game/disco-elysium">
<div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-surface-container-low shadow-md transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={gameImages("disco-elysium").cover} alt="Disco Elysium cover" />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

<div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-md">
<span className="font-label-sm text-label-sm font-semibold text-primary">{"95"}</span>

</div>

</div>

<div className="mt-3 flex flex-col">
<h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors truncate">{"Disco Elysium"}</h3>

<span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{"2019 • ZA/UM"}</span>

</div>

</Link>

<Link className="group flex flex-col" data-path="game/metaphor-refantazio" href="/game/metaphor-refantazio">
<div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-surface-container-low shadow-md transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={gameImages("metaphor-refantazio").cover} alt="Metaphor: ReFantazio cover" />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

<div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-md">
<span className="font-label-sm text-label-sm font-semibold text-primary">{"94"}</span>

</div>

</div>

<div className="mt-3 flex flex-col">
<h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors truncate">{"Metaphor: ReFantazio"}</h3>

<span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{"2024 • Studio Zero"}</span>

</div>

</Link>

<Link className="group flex flex-col" data-path="game/alan-wake-2" href="/game/alan-wake-2">
<div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-surface-container-low shadow-md transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={gameImages("alan-wake-2").cover} alt="Alan Wake II cover" />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

<div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-md">
<span className="font-label-sm text-label-sm font-semibold text-primary">{"93"}</span>

</div>

</div>

<div className="mt-3 flex flex-col">
<h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors truncate">{"Alan Wake 2"}</h3>

<span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{"2023 • Remedy Ent."}</span>

</div>

</Link>

<Link className="group flex flex-col" data-path="game/half-life-2" href="/game/half-life-2">
<div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-surface-container-low shadow-md transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={gameImages("half-life-2").cover} alt="Half-Life 2 cover" />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

<div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-md">
<span className="font-label-sm text-label-sm font-semibold text-primary">{"96"}</span>

</div>

</div>

<div className="mt-3 flex flex-col">
<h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors truncate">{"Half-Life 2"}</h3>

<span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{"2004 • Valve"}</span>

</div>

</Link>

</div>

</section>

<section className="hidden sm:block site-container mx-auto px-4 sm:px-6 lg:px-12 py-12">
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

</div>

</section>

<section className="hidden sm:block site-container mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-16">
</section>

</div>

</div>
</div>
</>);
}
