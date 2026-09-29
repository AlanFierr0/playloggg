import { gameImages } from "@/lib/game-images";
import { ProfileAvatar } from "@/components/profile-avatar";
import { PreviewAction } from "@/components/preview-action";

export function CompareScreen() {
return (<>
<h1 className="sr-only">Compare gaming taste</h1>
<div className="w-full  bg-surface"><div className="flex flex-col w-full">

<div className="relative overflow-x-clip w-full max-w-7xl mx-auto px-6 lg:px-12 py-10 md:py-16">
<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

<div className="absolute top-3/4 left-1/4 w-72 h-72 bg-tertiary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

<header className="w-full mb-16 md:mb-24">
<div className="flex flex-col items-center">

<span className="font-label-sm text-label-sm uppercase tracking-widest text-outline mb-4">{"Archival Concordance Analysis"}</span>

<div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 bg-surface-container-low/70 backdrop-blur-md rounded-xl p-8 lg:p-12 shadow-xl">

<div className="flex items-center gap-6 w-full md:w-auto justify-start">
<div className="relative flex-shrink-0">
<ProfileAvatar className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-md" name="Alex Vance" />

<span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-secondary"></span>

</div>

<div className="flex flex-col">
<span className="font-label-md text-label-md uppercase tracking-wider text-outline">{"Senior Critic"}</span>

<h1 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">{"Alex Vance"}</h1>

<span className="font-label-sm text-label-sm text-on-surface-variant font-mono mt-0.5">{"842 logs • Paris, FR"}</span>

</div>

</div>

<div className="flex flex-col items-center justify-center my-4 md:my-0 text-center px-6 py-4 rounded-xl bg-surface-container/80 shadow-inner">
<div className="flex items-center gap-2 mb-1">
<span className="material-symbols-outlined text-primary text-[20px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"auto_awesome"}</span>

<span className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">{"Taste Affinity"}</span>

</div>

<div className="flex items-baseline gap-1 my-1">
<span className="font-display-lg text-display-lg text-primary font-bold tracking-tight">{"81%"}</span>

</div>

<span className="font-label-sm text-label-sm font-mono text-outline">{"142 Shared Games Logged"}</span>

</div>

<div className="flex items-center gap-6 w-full md:w-auto justify-end flex-row-reverse md:flex-row">
<div className="flex flex-col items-end">
<span className="font-label-md text-label-md uppercase tracking-wider text-outline">{"Director & Auteur"}</span>

<h2 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">{"Hideo Kojima"}</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant font-mono mt-0.5">{"1,219 logs • Tokyo, JP"}</span>

</div>

<div className="relative flex-shrink-0">
<ProfileAvatar className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-md" name="Hideo Kojima" />

<span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-primary"></span>

</div>

</div>

</div>

<div className="w-full max-w-xl mt-6 flex items-center justify-between font-label-sm text-label-sm text-outline px-4">
<span>{"78 Consensus Agreements"}</span>

<span className="w-1.5 h-1.5 rounded-full bg-surface-bright"></span>

<span>{"16 Polarization Divides"}</span>

<span className="w-1.5 h-1.5 rounded-full bg-surface-bright"></span>

<span>{"48 Minor Variances (≤5 pts)"}</span>

</div>

</div>

</header>

<section className="w-full mb-20 md:mb-28">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-2">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">{"Major Polarity"}</span>

<h3 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight mt-1">{"Key Divergences"}</h3>

</div>

<p className="font-body-md text-body-md text-on-surface-variant max-w-md">{"Titles where aesthetic worldview and structural critique parted ways most substantially."}</p>

</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

<article className="bg-surface-container-low rounded-xl overflow-hidden p-6 md:p-8 flex flex-col justify-between shadow-lg transition-transform duration-300 hover:scale-[1.01]">
<div className="flex flex-col sm:flex-row gap-6 items-start">
<div className="w-28 sm:w-32 aspect-[3/4] flex-shrink-0 rounded-lg overflow-hidden shadow-md relative bg-surface-container">
<img className="w-full h-full object-cover" src={gameImages("death-stranding").cover} alt="death stranding cover" />

<span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/85 backdrop-blur font-label-sm text-label-sm font-mono text-primary font-bold">{"2019"}</span>

</div>

<div className="flex-1 flex flex-col">
<div className="flex items-center justify-between mb-2">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">{"Action / Strand"}</span>

<span className="font-label-sm text-label-sm font-mono text-error font-semibold px-2 py-0.5 rounded bg-surface-container-high">{"Δ -18 pts"}</span>

</div>

<h4 className="font-headline-md text-headline-md text-on-surface font-semibold">{"Death Stranding"}</h4>

<p className="font-body-md text-body-md text-on-surface-variant mt-2 line-clamp-3">{"\n                Kojima regards the isolated logistical odyssey as his singular auteur manifesto, while Vance praised the worldbuilding but critiqued structural pacing hurdles.\n              "}</p>

</div>

</div>

<div className="mt-8 pt-6 bg-surface-container/60 rounded-lg px-6 py-4 flex items-center justify-between">
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{"Alex Vance"}</span>

<span className="font-display-lg text-[32px] leading-8 font-bold font-headline-md text-on-surface mt-1">{"82"}</span>

</div>

<div className="flex flex-col items-center">
<div className="h-8 w-px bg-surface-variant"></div>

</div>

<div className="flex flex-col items-end">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{"Hideo Kojima"}</span>

<span className="font-display-lg text-[32px] leading-8 font-bold font-headline-md text-primary mt-1">{"100"}</span>

</div>

</div>

</article>

<article className="bg-surface-container-low rounded-xl overflow-hidden p-6 md:p-8 flex flex-col justify-between shadow-lg transition-transform duration-300 hover:scale-[1.01]">
<div className="flex flex-col sm:flex-row gap-6 items-start">
<div className="w-28 sm:w-32 aspect-[3/4] flex-shrink-0 rounded-lg overflow-hidden shadow-md relative bg-surface-container">
<img className="w-full h-full object-cover" src={gameImages("starfield").cover} alt="starfield cover" />

<span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/85 backdrop-blur font-label-sm text-label-sm font-mono text-primary font-bold">{"2023"}</span>

</div>

<div className="flex-1 flex flex-col">
<div className="flex items-center justify-between mb-2">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">{"Sci-Fi RPG"}</span>

<span className="font-label-sm text-label-sm font-mono text-error font-semibold px-2 py-0.5 rounded bg-surface-container-high">{"Δ -24 pts"}</span>

</div>

<h4 className="font-headline-md text-headline-md text-on-surface font-semibold">{"Starfield"}</h4>

<p className="font-body-md text-body-md text-on-surface-variant mt-2 line-clamp-3">{"\n                Kojima championed the romantic NASA-punk analog aesthetics and ambient celestial contemplation; Vance lamented disjointed loading boundaries and dated quest loops.\n              "}</p>

</div>

</div>

<div className="mt-8 pt-6 bg-surface-container/60 rounded-lg px-6 py-4 flex items-center justify-between">
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{"Alex Vance"}</span>

<span className="font-display-lg text-[32px] leading-8 font-bold font-headline-md text-on-surface-variant mt-1">{"62"}</span>

</div>

<div className="flex flex-col items-center">
<div className="h-8 w-px bg-surface-variant"></div>

</div>

<div className="flex flex-col items-end">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{"Hideo Kojima"}</span>

<span className="font-display-lg text-[32px] leading-8 font-bold font-headline-md text-primary mt-1">{"86"}</span>

</div>

</div>

</article>

</div>

</section>

<section className="w-full mb-20 md:mb-28">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-2">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">{"Consensus Apex"}</span>

<h3 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight mt-1">{"Unanimous Masterpieces"}</h3>

</div>

<p className="font-body-md text-body-md text-on-surface-variant">{"Near-perfect alignment on seminal triumphs across design generations."}</p>

</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

<div className="bg-surface-container-low rounded-xl p-5 flex flex-col justify-between shadow-md hover:bg-surface-container transition-colors group">
<div className="w-full aspect-[16/10] rounded-lg overflow-hidden mb-4 relative bg-surface-container">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={gameImages("elden-ring").cover} alt="elden ring cover" />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-80"></div>

<span className="absolute bottom-3 left-3 font-headline-md text-headline-md text-on-surface font-bold drop-shadow">{"Elden Ring"}</span>

</div>

<div className="flex items-center justify-between pt-2">
<div className="flex items-center gap-2">
<span className="font-label-sm text-label-sm text-outline">{"VANCE"}</span>

<span className="font-label-lg text-label-lg font-mono font-bold text-primary">{"98"}</span>

</div>

<div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>

<div className="flex items-center gap-2">
<span className="font-label-lg text-label-lg font-mono font-bold text-primary">{"98"}</span>

<span className="font-label-sm text-label-sm text-outline">{"KOJIMA"}</span>

</div>

</div>

</div>

<div className="bg-surface-container-low rounded-xl p-5 flex flex-col justify-between shadow-md hover:bg-surface-container transition-colors group">
<div className="w-full aspect-[16/10] rounded-lg overflow-hidden mb-4 relative bg-surface-container">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={gameImages("metal-gear-solid-3-snake-eater").cover} alt="metal gear solid 3 snake eater cover" />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-80"></div>

<span className="absolute bottom-3 left-3 font-headline-md text-headline-md text-on-surface font-bold drop-shadow">{"Metal Gear Solid 3"}</span>

</div>

<div className="flex items-center justify-between pt-2">
<div className="flex items-center gap-2">
<span className="font-label-sm text-label-sm text-outline">{"VANCE"}</span>

<span className="font-label-lg text-label-lg font-mono font-bold text-primary">{"96"}</span>

</div>

<div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>

<div className="flex items-center gap-2">
<span className="font-label-lg text-label-lg font-mono font-bold text-primary">{"98"}</span>

<span className="font-label-sm text-label-sm text-outline">{"KOJIMA"}</span>

</div>

</div>

</div>

<div className="bg-surface-container-low rounded-xl p-5 flex flex-col justify-between shadow-md hover:bg-surface-container transition-colors group">
<div className="w-full aspect-[16/10] rounded-lg overflow-hidden mb-4 relative bg-surface-container">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={gameImages("super-mario-bros-3").cover} alt="super mario bros 3 cover" />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-80"></div>

<span className="absolute bottom-3 left-3 font-headline-md text-headline-md text-on-surface font-bold drop-shadow">{"Super Mario Bros. 3"}</span>

</div>

<div className="flex items-center justify-between pt-2">
<div className="flex items-center gap-2">
<span className="font-label-sm text-label-sm text-outline">{"VANCE"}</span>

<span className="font-label-lg text-label-lg font-mono font-bold text-primary">{"94"}</span>

</div>

<div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>

<div className="flex items-center gap-2">
<span className="font-label-lg text-label-lg font-mono font-bold text-primary">{"94"}</span>

<span className="font-label-sm text-label-sm text-outline">{"KOJIMA"}</span>

</div>

</div>

</div>

</div>

</section>

<section className="w-full">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">{"Curated Ledger"}</span>

<h3 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight mt-1">{"Shared Catalog Matrix"}</h3>

</div>

<div className="flex items-center gap-2">
<PreviewAction className="px-3 py-1.5 rounded bg-surface-container text-primary font-label-md text-label-md transition-colors" message={"Preview only: this feature is not connected yet."}>{"All Shared (142)"}</PreviewAction>

<PreviewAction className="px-3 py-1.5 rounded bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-colors" message={"Preview only: this feature is not connected yet."}>{"Ties (18)"}</PreviewAction>

<PreviewAction className="px-3 py-1.5 rounded bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-colors" message={"Preview only: this feature is not connected yet."}>{"Disagreements >10"}</PreviewAction>

</div>

</div>

<div className="w-full bg-surface-container-low rounded-xl overflow-hidden shadow-xl">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-high/40 text-outline font-label-sm text-label-sm uppercase tracking-wider">
<th className="py-4 px-6 font-semibold">{"Title"}</th>

<th className="py-4 px-6 font-semibold">{"Release"}</th>

<th className="py-4 px-6 font-semibold text-right">{"Alex Vance"}</th>

<th className="py-4 px-6 font-semibold text-right">{"Hideo Kojima"}</th>

<th className="py-4 px-6 font-semibold text-right">{"Difference"}</th>

</tr>

</thead>

<tbody className="divide-y-0 text-on-surface font-body-md text-body-md">

<tr className="hover:bg-surface-container/60 transition-colors">
<td className="py-4 px-6 font-semibold">
<div className="flex items-center gap-3">
<span className="w-2 h-2 rounded-full bg-primary"></span>

<span>{"Bloodborne"}</span>

</div>

</td>

<td className="py-4 px-6 font-mono text-outline font-label-md text-label-md">{"2015"}</td>

<td className="py-4 px-6 text-right font-mono font-bold text-on-surface">{"95"}</td>

<td className="py-4 px-6 text-right font-mono font-bold text-primary">{"97"}</td>

<td className="py-4 px-6 text-right font-mono text-secondary font-label-md text-label-md">{"+2 pts"}</td>

</tr>

<tr className="bg-surface-container-lowest/30 hover:bg-surface-container/60 transition-colors">
<td className="py-4 px-6 font-semibold">
<div className="flex items-center gap-3">
<span className="w-2 h-2 rounded-full bg-surface-variant"></span>

<span>{"Cyberpunk 2077"}</span>

</div>

</td>

<td className="py-4 px-6 font-mono text-outline font-label-md text-label-md">{"2020"}</td>

<td className="py-4 px-6 text-right font-mono font-bold text-on-surface">{"78"}</td>

<td className="py-4 px-6 text-right font-mono font-bold text-primary">{"91"}</td>

<td className="py-4 px-6 text-right font-mono text-error font-label-md text-label-md">{"+13 pts"}</td>

</tr>

<tr className="hover:bg-surface-container/60 transition-colors">
<td className="py-4 px-6 font-semibold">
<div className="flex items-center gap-3">
<span className="w-2 h-2 rounded-full bg-secondary"></span>

<span>{"The Legend of Zelda: Tears of the Kingdom"}</span>

</div>

</td>

<td className="py-4 px-6 font-mono text-outline font-label-md text-label-md">{"2023"}</td>

<td className="py-4 px-6 text-right font-mono font-bold text-primary">{"96"}</td>

<td className="py-4 px-6 text-right font-mono font-bold text-primary">{"95"}</td>

<td className="py-4 px-6 text-right font-mono text-secondary font-label-md text-label-md">{"-1 pt"}</td>

</tr>

<tr className="bg-surface-container-lowest/30 hover:bg-surface-container/60 transition-colors">
<td className="py-4 px-6 font-semibold">
<div className="flex items-center gap-3">
<span className="w-2 h-2 rounded-full bg-surface-variant"></span>

<span>{"Alan Wake 2"}</span>

</div>

</td>

<td className="py-4 px-6 font-mono text-outline font-label-md text-label-md">{"2023"}</td>

<td className="py-4 px-6 text-right font-mono font-bold text-on-surface">{"88"}</td>

<td className="py-4 px-6 text-right font-mono font-bold text-primary">{"94"}</td>

<td className="py-4 px-6 text-right font-mono text-error font-label-md text-label-md">{"+6 pts"}</td>

</tr>

<tr className="hover:bg-surface-container/60 transition-colors">
<td className="py-4 px-6 font-semibold">
<div className="flex items-center gap-3">
<span className="w-2 h-2 rounded-full bg-secondary"></span>

<span>{"Shadow of the Colossus"}</span>

</div>

</td>

<td className="py-4 px-6 font-mono text-outline font-label-md text-label-md">{"2005"}</td>

<td className="py-4 px-6 text-right font-mono font-bold text-primary">{"97"}</td>

<td className="py-4 px-6 text-right font-mono font-bold text-primary">{"97"}</td>

<td className="py-4 px-6 text-right font-mono text-outline font-label-md text-label-md">{"0 pts"}</td>

</tr>

<tr className="bg-surface-container-lowest/30 hover:bg-surface-container/60 transition-colors">
<td className="py-4 px-6 font-semibold">
<div className="flex items-center gap-3">
<span className="w-2 h-2 rounded-full bg-surface-variant"></span>

<span>{"BioShock"}</span>

</div>

</td>

<td className="py-4 px-6 font-mono text-outline font-label-md text-label-md">{"2007"}</td>

<td className="py-4 px-6 text-right font-mono font-bold text-primary">{"95"}</td>

<td className="py-4 px-6 text-right font-mono font-bold text-on-surface">{"90"}</td>

<td className="py-4 px-6 text-right font-mono text-secondary font-label-md text-label-md">{"-5 pts"}</td>

</tr>

<tr className="hover:bg-surface-container/60 transition-colors">
<td className="py-4 px-6 font-semibold">
<div className="flex items-center gap-3">
<span className="w-2 h-2 rounded-full bg-surface-variant"></span>

<span>{"Silent Hill 2"}</span>

</div>

</td>

<td className="py-4 px-6 font-mono text-outline font-label-md text-label-md">{"2001"}</td>

<td className="py-4 px-6 text-right font-mono font-bold text-primary">{"93"}</td>

<td className="py-4 px-6 text-right font-mono font-bold text-primary">{"96"}</td>

<td className="py-4 px-6 text-right font-mono text-secondary font-label-md text-label-md">{"+3 pts"}</td>

</tr>

</tbody>

</table>

</div>

<div className="px-6 py-4 bg-surface-container-high/20 flex flex-col sm:flex-row items-center justify-between gap-4 font-label-sm text-label-sm text-outline">
<span>{"Showing 7 of 142 shared catalog entries"}</span>

<div className="flex items-center gap-2">
<PreviewAction className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-bright text-on-surface transition-colors" message={"Preview only: this feature is not connected yet."}>{"Previous"}</PreviewAction>

<span className="font-mono text-on-surface px-1">{"1 / 21"}</span>

<PreviewAction className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-bright text-on-surface transition-colors" message={"Preview only: this feature is not connected yet."}>{"Next"}</PreviewAction>

</div>

</div>

</div>

</section>

</div>

</div>
</div>
</>);
}
