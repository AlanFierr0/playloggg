import Link from "next/link";
import { PreviewAction } from "@/components/preview-action";

export function TiersScreen() {
return (<>
<div className="w-full  bg-surface"><div className="flex flex-col w-full">

<div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 py-10 flex flex-col gap-10">

<div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-gradient-to-b from-primary/10 via-tertiary/5 to-transparent blur-3xl pointer-events-none -z-10"></div>

<section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
<div className="flex flex-col gap-2">
<div className="flex items-center gap-3">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-container text-primary font-label-sm text-label-sm uppercase tracking-widest font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
{"\n            Tier Matrix\n          "}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{"Playlog Curated Registry"}</span>

</div>

<h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">{"\n          Personal Tier Board\n        "}</h1>

<p className="font-body-md text-body-md text-on-surface-variant">{"\n          384 titles classified by critical standing and enduring impact.\n        "}</p>

</div>

<div className="flex items-center gap-2 p-1.5 bg-surface-container rounded-lg self-start md:self-auto overflow-x-auto max-w-full">
<a className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-bright transition-colors text-on-surface group" href="#tier-s">
<span className="font-label-md text-label-md font-bold text-primary">{"S"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{"14"}</span>

</a>

<a className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface group" href="#tier-a">
<span className="font-label-md text-label-md font-bold text-secondary">{"A"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{"58"}</span>

</a>

<a className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface group" href="#tier-b">
<span className="font-label-md text-label-md font-bold text-tertiary">{"B"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{"120"}</span>

</a>

<a className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface group" href="#tier-c">
<span className="font-label-md text-label-md font-bold text-outline">{"C"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{"132"}</span>

</a>

<a className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface group" href="#tier-d">
<span className="font-label-md text-label-md font-bold text-on-surface-variant">{"D"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{"46"}</span>

</a>

<a className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface group" href="#tier-f">
<span className="font-label-md text-label-md font-bold text-error">{"F"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{"14"}</span>

</a>

</div>

</section>

<div className="flex flex-col gap-6 w-full">

<section className="flex flex-col md:flex-row gap-4 p-4 lg:p-6 rounded-xl bg-surface-container-low shadow-sm" id="tier-s">

<div className="flex md:flex-col justify-between items-center md:items-start w-full md:w-44 flex-shrink-0 p-4 rounded-lg bg-surface-container">
<div className="flex items-center md:flex-col md:items-start gap-2">
<span className="font-display-lg text-display-lg font-bold text-primary leading-none">{"S"}</span>

<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold uppercase tracking-wider text-on-surface">{"Pinnacle"}</span>

<span className="font-label-sm text-label-sm text-primary">{"Score 95–100"}</span>

</div>

</div>

<div className="flex items-center gap-1.5 pt-0 md:pt-6">
<span className="font-label-sm text-label-sm text-on-surface-variant">{"14 games"}</span>

<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>

</div>

</div>

<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 flex-1 min-w-0">

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYrLeQtaNjMowdrp1iTiJ6bbK127AAJ54R-OJXvQGnQtz2FKeO41AmYauY_mOLHh-46YKCPkCjKI8YsUcREJN1n3kENb_iFd9sfPYuCpQiyJ9QB6o2LM5FkXwT9Z_289OHqj22nyIKZoyIn1zr7n79X6RORLl5zBLBCIj5TSFl1GjTMXzEsuYEvdsw3I9z7xEs3BglaAS8c2MDgBXeNFr--ihwio-ydGVy-Cgb6ENFbias9DvCSGMQ" alt="Dark fantasy video game poster depicting a tarnished armored knight kneeling before the glowing golden Elden Ring tree canopy against a deep obsidian sky, moody atmospheric chiaroscuro lighting, cinematic digital painting, amber gold and deep slate tones" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-primary">{"97"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/elden-ring">{"Elden Ring"}</Link>
</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"FromSoftware · 2022"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8vhCA67rHf2FB3S88qhjLwDsD0pqPsP3HudGC62qLDdVHfzxnyxssWF1YwJY9b_qEnaqIxrANp7qlVJEOC9Vx5CDitD5N9mzSBsIBwLDjIAjwfy7HvQmg_-XC0xf-bjG3TbyWX9lSIptZNJPDMPHU2lRitLN1MHZve2bi-rS9Ce7CWVwJVi6OdS8MGnuLuntQ8S2hDxqmNiSE12ItwpjbV5CJz-tXmmWebtLOn8HEFa9Kyly-GIa2" alt="Epic isometric roleplaying video game cover featuring heroic adventurers standing before a glowing arcane nautiloid tentacle silhouette against a starry midnight nebula, richly detailed fantasy concept art, amber illumination and dark cosmic hues" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-primary">{"96"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/baldurs-gate-3">{"Baldur's Gate 3"}</Link>
</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Larian Studios · 2023"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJ5Fugxy3WxZIwUZMV01tQ0Fizu_Xh98_ia2gfVINuxZDSIceykn1AJtmWg2bvIF91_VmNqDpBcJZckCHGCexZgiHhAQLY385uLcpq-z2oiANLSt2IG1-Qs7X8A8PXD517k7-Ay1GotnTEsiAGWb2SWaYoby7ghqGl1CgEakGbojw-jowFGelVpkZ_FjaR8DZ2cBEJ6pCSMMrjfNufKKVPkueyEnKd_gJ4GosTZMLgMWtxk5PQKINE" alt="Oil painted expressionist detective video game key art showing an introspective weathered detective portrait layered over a crumbling coastal Revachol cityscape, textured brushstrokes, melancholic muted gold and graphite color palette" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-primary">{"97"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/disco-elysium">{"Disco Elysium"}</Link>
</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"ZA/UM · 2019"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-S1wATaU7D-L_zMs49tRxIkBEOOgdW8-XV1fQhOpgXQbIxTYbW72AIV5nf3q7tyKxeNvSlCZthekUajfsc626AEpz9CI0rheF-y2GFOIl-_VJ6pkoa4BwF_i8fXboofTiXFL8O7iQlncVm1TEhsqH5MQ7PfoJwC6_0cwOptt58JAovnjyPgPQYbVKaJpuzjsFoHYy9R64-QLra-H3wSxpMolAlwicpils4vtkBMCraaODv0z99H86" alt="Stylized fantasy anime game art portraying an elegant protagonist with a fluttering royal banner standing in front of an impossible floating castle citadel under a sharp high-contrast dusk sky, fine typographic detailing, rich gold accents" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-primary">{"95"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/metaphor-refantazio">{"Metaphor"}</Link>
</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Studio Zero · 2024"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAu18uSy0XRzkAhU6lE6xoLtPdtced436h7V1gZHhfUPxpuFKt3NEVqpm_LBfc7lqqIVUkzbG2QZSsnH9-AA9F0s9X-u1yjaFRCh1k1Sl-usUekmnDXrSBAh3FTRiYEibOV7FwxNLuowDkzuPCOToEDYzlHu1ijTpYoPZz00DdSEuQgSxw5E7W8oABaIDMR85OVkSgZGFuBb6XcSqvDsj8ot_3IE8XQWlCFWuyTFdEaVNG394pbrgWI" alt="Dynamic neo-noir anime video game poster with a masked phantom thief silhouette against dynamic diagonal speedlines, sharp black and warm amber tones, graphic pop art layout with intricate comic book crosshatching" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-primary">{"95"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/persona-5-royal">{"Persona 5 Royal"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Atlus · 2020"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm89untNcchD855bs1QycjHek77ZFe3TGSQWg70wFjrC28zVzf0bhsI4wHpc6cFtMedq0ivUjMdSY6SJT2COzTm_0p2Sd4-v4F4bY0vo7su-Cz2QGcTFkfzSiQzfcfHKlDQDokXvydqfnRhXKoUVFRZgkmnKGtD-OmTVaYgwW-WuC9GvjNbBssmmGbsFcU31u8LF6Nwifr2E4grOqqRy6fbtVLkZod8pbR8GFMyrAMEtvLpo1fn6gD" alt="Vast open world adventure video game poster showcasing a young hero diving headfirst from ancient floating stone sky islands into a cloud sea bathed in radiant morning sunlight, expansive horizons, painterly cel-shaded aesthetic" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-primary">{"96"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/the-legend-of-zelda-tears-of-the-kingdom">{"Zelda: TotK"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Nintendo · 2023"}</span>

</div>

</div>

</div>

</section>

<section className="flex flex-col md:flex-row gap-4 p-4 lg:p-6 rounded-xl bg-surface-container-low shadow-sm" id="tier-a">

<div className="flex md:flex-col justify-between items-center md:items-start w-full md:w-44 flex-shrink-0 p-4 rounded-lg bg-surface-container">
<div className="flex items-center md:flex-col md:items-start gap-2">
<span className="font-display-lg text-display-lg font-bold text-secondary leading-none">{"A"}</span>

<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold uppercase tracking-wider text-on-surface">{"Essential"}</span>

<span className="font-label-sm text-label-sm text-secondary">{"Score 85–94"}</span>

</div>

</div>

<div className="flex items-center gap-1.5 pt-0 md:pt-6">
<span className="font-label-sm text-label-sm text-on-surface-variant">{"58 games"}</span>

<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>

</div>

</div>

<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 flex-1 min-w-0">

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZA53K2OZyeKL-rdEqnopP3N1VLOoK0Z3BZNvNbeSmE-qWef9KqUSeOBRw4zWlXvR_0coflIY4PRy5LtDT7Jaw7y9f-MuUA4ThUyyFiN2BPIU_6p3PiqhQkRRGcSPWfuGleqWcziATE76G4snLrZ6weDAUxAxaZJH2RKwCtPkvFRtyqpk_3uUfjxj8lKE2Fjwm-3ms3i4OejPYsUwUdP3kfOx3BEKgcVntsexX4261N4WV8ZRy5T05" alt="Psychological horror video game cover showing a tortured writer clutching a flashlight in misty Pacific Northwest rain forest shadows, double-exposure eerie forest overlay, cinematic dark emerald and slate mood" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-secondary">{"89"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/alan-wake-2">{"Alan Wake 2"}</Link>
</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Remedy · 2023"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1Xo6ZHIBstppiYbm427EfGGbT_T6Xq2TBGeCEe-ObwO0-F7x7GpBgp90yQOlLjbYPlpcc8jFhttNCd5VgJ2G3NXZJBRoOSIQikwRaP-Gsj0_Cx1yRkOVq-NN83U3Q2Bjt1480tv36VS3YUHQytrCu3k8pMKX-wPwoEeksbcJEHb4s-EePO39n3Jni2VBRpI4KcBZ6bUH8ZjpWbW0KxF05tbX6hxgSoW9urPGzksAN0uXEToTBLe8o" alt="Vibrant mythological roguelike key art featuring an athletic prince wielding a glowing stygian blade amidst underworld hydras, high contrast comic ink work, striking emerald flames and deep obsidian shadows" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-secondary">{"93"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/hades">{"Hades"}</Link>
</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Supergiant · 2020"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrfJjSIa4P42GKvpiwoY9VjbVqgpE2Oskgq0CGVISRGrg4fmZmKtuWENfnHwDlbs0NlHinKttcGv4MmyNdoMIFiJDfwgdlaWiE9g9f2j2fWNKsXy48zjHNagOmRMOfSySHAN02BPPt2Jn0qmQra-b7V52onpl4Dh9ho3ljrnRyWN1EFZZSZtq9MInFCGRA2VzSWBFMY4cww2o2_fJmOZUyAEeAQWIKBxBcrpPInkWPfbS5U_US7q1G" alt="Victorian gothic action game poster showing a cloaked hunter standing with saw cleaver and blunderbuss under an ominous blood-tinged moon in cobblestone streets of Yharnam, grim dark atmospheric fog and deep charcoal shadows" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-secondary">{"92"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/bloodborne">{"Bloodborne"}</Link>
</h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"FromSoftware · 2015"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2gtIPneab5q8tjzjekzcbJqulZC2eV2n4lHuMrIs-U2zHfoHOW3LNAsP12YqNJRiS4jM9mM0IZSNoXQvNbpp-lgyy5Pd7GgTzhWwiZkozNT51x_65DkGO5Tn6BZ9l-mO7OmNpeH5e0iSiY1ixy8E3LPphi0uKHYZjNPZpJE0xWhXIzhgcdGb1UofJuQRa4Y6FO7zp6L8-uJeEgXKUlVjHOoxjN0YBWTTninfOB3HMjKffJr7UFS5a" alt="Intricate 2D subterranean metroidvania cover depicting a tiny hooded horned insect knight holding an old nail weapon in a cavern of bioluminescent moss and falling blue dust spores, hand-drawn dark fairytale aesthetic" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-secondary">{"90"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/hollow-knight">{"Hollow Knight"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Team Cherry · 2017"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuekvGQgyO9rPEww_ERAxeTKbWy_Yecqh_sl-zBDPy4WkUJfEBtbhyfIVc4qDvCTQx4cV9lKEJDeN1Izsu9IdRN06nzdP6TLX_NhZzH1SO77M8tylHErwr8Zn_cNjULw823-0T6XRcO5BXZS6FjRxlwW8l_0_wZerk_-H39Xyx7VpcBoEVQKkrIUlnfVDEFWAcuJsD96eTQoymau203_PyLdZH0CAQEDD3t3qDOwbe9XP4eS-3p82q" alt="Feudal Japanese action game art depicting a one-armed shinobi warrior perched upon a snowy castle rooftop gazing across crimson maple leaves caught in wind, cinematic moody sunset, dark steel and warm emerald highlights" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-secondary">{"91"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/sekiro-shadows-die-twice">{"Sekiro: SDT"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"FromSoftware · 2019"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJ_UVKDtksUE9r0Ca3rdkD0sM267Bv3rHjVn2Qvg3BWgmJddBi6PT5AG5HMe5J-4126x18VODOPUvpGgxbIf4XukhSkthdB5_8tXz6g9zcLBC-EcW5qrXQzisY_h2g_jREzKxn8g9gaU8C0nD-XMHuKAeTzaxaUJseEIEeIXgoml9k6V5zgibiULemej3i4MGzP5Mqe_OccILd2iiF45TNaW6uUk3rEW3lTVJY11eOz_C8T31aTWUq" alt="Industrial sci-fi mecha poster featuring a heavy bipedal combat robot standing amidst smoldering burning coral ash ruins on a ruined ice planet, raw mechanical engineering details, deep charcoal and intense green sensor optics" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-secondary">{"86"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/armored-core-vi">{"Armored Core VI"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"FromSoftware · 2023"}</span>

</div>

</div>

</div>

</section>

<section className="flex flex-col md:flex-row gap-4 p-4 lg:p-6 rounded-xl bg-surface-container-low shadow-sm" id="tier-b">

<div className="flex md:flex-col justify-between items-center md:items-start w-full md:w-44 flex-shrink-0 p-4 rounded-lg bg-surface-container">
<div className="flex items-center md:flex-col md:items-start gap-2">
<span className="font-display-lg text-display-lg font-bold text-tertiary leading-none">{"B"}</span>

<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold uppercase tracking-wider text-on-surface">{"Commendable"}</span>

<span className="font-label-sm text-label-sm text-tertiary">{"Score 75–84"}</span>

</div>

</div>

<div className="flex items-center gap-1.5 pt-0 md:pt-6">
<span className="font-label-sm text-label-sm text-on-surface-variant">{"120 games"}</span>

<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>

</div>

</div>

<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 flex-1 min-w-0">

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8aPFbyM5bBhYkd5BMzHFlhqwB-etyPCBS_dD-19Kx66QDRPSbOuzj5X-DnyMJHQJetH8_sgkQw0fCwUUC6C3aBAc7wnEujFMiSqRjmzicVwKMjVbtS636Ji4ihEtXKe-ILYAKTRMtgj2kyqruvFUmMwsgkX2m4w1pmeMG2dttIQbwXtNLHW_uc4gylNCoqw6ZBuK0GBGuP2ofbbLN_Qoror5mrD3rqXNoZwD4BuPlYhVsxar5cDzO" alt="Cinematic fantasy sci-fi poster featuring a spiky-haired mercenary with an oversized broadsword standing overlooking vast grassy plains toward a high-tech glowing mako reactor, vivid dusk sky with soft cyan atmospheric glow" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-tertiary">{"84"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/final-fantasy-vii-rebirth">{"FFVII Rebirth"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Square Enix · 2024"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwOVtXx3nshyvDtECzeLq_vPwmXlakWlCgTcvZcFwJEmAF4O2j8KJt0-coInx5zFsRTPHrHs0BzicNQrQmXrXOt22gcCr8o8vWJYd9jC2tn8Lw8XBj-Q6dyKO7xLpOy3tKcQlt6QMd5GySWtRz6VeGJDtzLho6sw_OwS8bfswoH46_cIGifD0etRdLUxw0_W88USP2fAtdEEdZ7gAN3DsWFQ5gayhbNZva82FlRsYOaCICWsMyer4v" alt="Dark Belle Époque gothic action game poster showing a puppet protagonist with a mechanical left arm standing over broken brass automatons in rain-drenched Krat city streets, muted cyan lighting and Victorian ironworks" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-tertiary">{"80"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/lies-of-p">{"Lies of P"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Round8 Studio · 2023"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8fe3LFa0uhfspo9MnoBTTzwruGZdzSco1oR23zFBdgcft05KIIfOkHRjg1nNG5YacUrwcmsc2zNeZFhklW0Iq84oyXlBV_-Sjs9IBDZkhZbmlw3SRyJVyZ5rUhAdOCZStkvnHfphzzvHG9i_Aeg2RzusxVQhCoexzh7jM-CMT3yYMycTYsIUxrwFQd9irt0ZmIdpPtbRrrMHbhV-rKaLLDdYynCkWZEQ27ifCMw1VlK4bgbRv1ahb" alt="Sci-fi survival horror game poster depicting an engineer in a weathered ribbed metal pressure suit in a derelict spaceship corridor illuminated only by three glowing blue visor slits, eerie claustrophobic mood and deep shadows" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-tertiary">{"84"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/dead-space">{"Dead Space"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Motive · 2023"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtovhcwTdWgnVOLNtSa8H2BNciAlYrTiTU1OfA7fQaUK5IuJooPUgey9xEunnSIggnL43lokCbHQrfwjT2L6NQX89jgJnU9G6o9oF9rNdWMqpYqvPyXmAptwuRrjMbuRTtYesGoM2Q4usRJyvqCQz1JA8HAU-0U_4Iu6zC-Qfwf65zBPPkB1b1hj68YD5u_S0Z2DtunSLbshlei0J2uCuUarxmaraZB9P3-GeBspV_dXSGrPbXRbiq" alt="Survival horror video game art showing a trenchcoat-clad special agent in a decaying European rural village under an overcast grey autumn sky, subtle tension, dark slate and muted cyan tones" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-tertiary">{"83"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/resident-evil-4">{"Resident Evil 4"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Capcom · 2023"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAD1jqMIKRR6Pr3Sf4y7MyqKOrVXcSbJOWT_tsE7lahDQ4pc_2wZ1vs4nO71SFKC-8Ss-ssrdlY-daIg6Dgk5SZFo5IKvvbtKpAXtX3vgAk6NB9b3l1lhtutAN-ilqIIloiRDWgtZ88r4aM1i_88NGuxZPkeAF44CB-EERCDLiFn6hAFVYOaRtHddYesaEcTyLGQz4Mla7j6eT8GzXSBTwzP21D_led1j1NZ7FMRUEOkTCzSoeT7xEn" alt="Cosmic psychological sci-fi game cover featuring an astronaut woman face visible behind a cracked spacesuit visor staring at towering alien monolith ruins shrouded in blue fog and hostile biomechanical fauna" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-tertiary">{"82"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/returnal">{"Returnal"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Housemarque · 2021"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4irA8oyw_DFAY5qROS-Z51UwHEPGgA6DGrAHSqUD_YtJspRGX6W_Id4akUM-tjA6zHcmcpaju-b3svDo3qn5bfmXFu5tMz9AYlDSUxZqgsMFjWACSlD0Fguq9eXBD1aznq0skPs-6AghVFY82oli0_jtn1e4xcmageXANmCkVrn7WfePU4eXewgizXyNmAdsPGpKSRecwbE2pLp4lFNYjmAlcJ-pcVxSXgpKESEyPxw6y_oSQhmet" alt="Post-apocalyptic action RPG artwork showing a blindfolded android girl holding a katana amidst ruined overgrown highway overpasses and rusty ancient automatons, minimalist melancholic cyan-grey color palette" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-tertiary">{"81"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/nier-automata">{"NieR:Automata"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"PlatinumGames · 2017"}</span>

</div>

</div>

</div>

</section>

<section className="flex flex-col md:flex-row gap-4 p-4 lg:p-6 rounded-xl bg-surface-container-low shadow-sm" id="tier-c">

<div className="flex md:flex-col justify-between items-center md:items-start w-full md:w-44 flex-shrink-0 p-4 rounded-lg bg-surface-container">
<div className="flex items-center md:flex-col md:items-start gap-2">
<span className="font-display-lg text-display-lg font-bold text-outline leading-none">{"C"}</span>

<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold uppercase tracking-wider text-on-surface">{"Average"}</span>

<span className="font-label-sm text-label-sm text-outline">{"Score 60–74"}</span>

</div>

</div>

<div className="flex items-center gap-1.5 pt-0 md:pt-6">
<span className="font-label-sm text-label-sm text-on-surface-variant">{"132 games"}</span>

<span className="w-1.5 h-1.5 rounded-full bg-outline"></span>

</div>

</div>

<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 flex-1 min-w-0">

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5LUrSuXlk4JgzVz5KPXMcW78ikuJ8t9OXF1rQ0Wkga_uw-_Ok3EkNjcxW8OISnAc9FuQ_gAi_mbhif2jxUspaqwomXdcFxErXYdVdKTD0YLGlG59TKgHMfP73JO_d-kNZKDMFW2dToKd3jVW_1RjldziwFXyTLwoDCcOBG1dmkXxiPv74L9gM-v-fEdxO34UcX0fqZe6voIXEmGRRlec6DLR3J3YoYEYxs14hVngejDvQ68cbphN8" alt="High fantasy action game art showing an Arisen warrior holding a greatsword beside loyal party members facing a fire-breathing serpentine wyrm in rocky canyon terrain, muted warm earth tones with dark ash shading" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-outline">{"74"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/dragons-dogma-2">{"Dragon's Dogma 2"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Capcom · 2024"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO6EYBn1l7ZT6LEErUNjn0E8Gjp0AIYbd-UIcW42Hm_JEI6LFVcoajoLyIgYMcTOyICEh-aqY_YKphkC3NR_x5_nydY4Xw4Iu6TBpleCbUUoe65WL39MdtIeOmcz0XWm0i23Q70APUKV-7wCxO8aBqLSI6clWP7RpYJhqNS4zRZAshrMvJHFWcQO7vBErpNe0b5ZslvIx3oJEBpzeHldPSVnOmQAbcHxvfk76qlGo82X2RmBqzYuCm" alt="Nasa-punk space exploration video game key art featuring a lonely white exploration spacecraft parked on a barren moon surface looking up at a gas giant with rings, clean technical geometric line accents" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-outline">{"72"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/starfield">{"Starfield"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Bethesda · 2023"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFDowtCg41f-BinsUwT8jhxS77dRrNBdA6v36jf_JyKKZoJHkKpNH3pnjSkbTbdvwVl8qvh4CtOpaVuhZrXd_Frc6mFylZaKlxdpKYAEBzo71j1Wn0HRIwpZVbkvLc79N3MsKk_P8BzsJ5MwgDN9FcV07aODXKazywXywFfCHcbMtG8ndNYqiLqZ9YkdO30UTlJw3DMXBDYp1n0dn2bwrizzDoSDFics-hWGEAmCH4DHH7_o2rvrd0" alt="Cinematic sci-fi game cover showing a solitary delivery porter carrying stacked cargo crates across vast Icelandic volcanic moss hills under a dark cloudy rain-filled sky with inverted black rainbow reflections" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-outline">{"71"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/death-stranding">{"Death Stranding"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Kojima Prod · 2019"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBd-xzu5Ix3xwiRTw6dt13WAsw1G02zzWxOcPfKHgtJq6weZBPC2NhzG1JZKMDM6SN4tjC8AaGa1g9WfbMJB9kRtKg2YV13ElDI8yhSHVjhk8F-RQKu8VyTKOTuKXksjTohRh5Gs10yL8T0FsXQiHn6rPnjnd2LPdd_y3BI2Jyb7_edXWMxkJAgJiZa7BYN96YETvH5PuWCI05hL2HgrU_MV0BHkLKIq-Ep5o7xEP4k5tMvgZYM8PvO" alt="Gothic wizarding school game artwork depicting a robed student raising a glowing wand toward a distant towering castle lit by moonlight over calm dark lake waters, nostalgic atmosphere with deep slate shadows" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-outline">{"70"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/hogwarts-legacy">{"Hogwarts Legacy"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Avalanche · 2023"}</span>

</div>

</div>

<div className="hidden lg:flex flex-col items-center justify-center rounded-lg bg-surface-container/30 text-on-surface-variant/40">
<span className="material-symbols-outlined text-2xl">{"add"}</span>

<span className="font-label-sm text-label-sm mt-1 uppercase">{"Browse 128 more"}</span>

</div>

<div className="hidden lg:flex flex-col items-center justify-center rounded-lg bg-surface-container/20 text-on-surface-variant/30">
<span className="material-symbols-outlined text-xl">{"folder_open"}</span>

<span className="font-label-sm text-label-sm mt-1 uppercase">{"Tier C Shelf"}</span>

</div>

</div>

</section>

<section className="flex flex-col md:flex-row gap-4 p-4 lg:p-6 rounded-xl bg-surface-container-low shadow-sm" id="tier-d">

<div className="flex md:flex-col justify-between items-center md:items-start w-full md:w-44 flex-shrink-0 p-4 rounded-lg bg-surface-container">
<div className="flex items-center md:flex-col md:items-start gap-2">
<span className="font-display-lg text-display-lg font-bold text-on-surface-variant leading-none">{"D"}</span>

<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold uppercase tracking-wider text-on-surface">{"Subpar"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant">{"Score 40–59"}</span>

</div>

</div>

<div className="flex items-center gap-1.5 pt-0 md:pt-6">
<span className="font-label-sm text-label-sm text-on-surface-variant">{"46 games"}</span>

<span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span>

</div>

</div>

<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 flex-1 min-w-0">

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCs0YZxlxM8a1hoBECKf7r3jCP-ifEUpPIvmImkSA2-Vuc_vjWKvX-5UxdoFN6YkW7wX6uW8oM4dqUkUNMbug7ZDv3JfRytJgFHm4zyy3me3Hl-M4wafgg6UxiCheW6JQiI-P1GDHi4w7LJzzsl8ZT_aOzcx2Sy2H1gp9miZ8ArzfzU5Sao5xGZ7M1NRqO7u9WS_DwQXTDVA0vo9YAmw0MeWbd1z4wnZkFFEXIvbnu17wZ9P2vzFSRR" alt="Action RPG video game cover depicting a young woman with a magical flowing cape channeling crystalline rock magic in a barren ruined landscape under overcast skies, muted earthy tone with dark graphite tones" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-on-surface-variant">{"54"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/forspoken">{"Forspoken"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Luminous · 2023"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZBnYAkJHYyBjErwiBZN9sQ6vIKHYuKk0ogKzgH8Lsf9wK_6vWS9jNZwqotJxwJOGizezpNE3_MCUwpVUcEQcPMeTvBSQzgvZxdFWdCboxN4KQ_gHt71TgIRGjNrWAjwm0oZY93jup0eWUCJlu79V0drHVjP6gARa2cP4iBfqfkFBUnPSmK7n17Xf4u_04erG6IhWR7s_DMFlhOjSqqOwejiOil6VRHGkJfHNfWbIBfKHTSBayK1sM" alt="Co-op vampire shooter video game art portraying a group of quirky survivor combatants facing eerie levitating gothic vampires blocking out an eclipsed sun above an island port town, dark moody purple and slate ambiance" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-on-surface-variant">{"48"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/redfall">{"Redfall"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Arkane Austin · 2023"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWgAon-C4sbamed2Ksn7IiGCt1MnAfePV5P19kN3a_GSB8DRJu2W2K8K9yq8gszExHvTrI93xRDZ1WF24XfA98wZKM7WstbUdzvhZSv68Ocr6bkFZ1UbmZITIIG3Sdev2R1OudELSS0Wrbw9KwGpVQFsP8OpuTFHgD-8J1oWspLjwrkIh3O19_7PQpwkfGfwXwrHSUoY7tl_aeGediyDBwkae7Pig2xLjmovTJvBhx-jklk1BRnl5S" alt="Dark fantasy soulslike game artwork with an iron-clad crusader warrior raising a blue spirit lantern revealing a terrifying alternate skeletal realm hidden behind decayed church ruins, bleak high-contrast aesthetic" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-on-surface-variant">{"58"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/lords-of-fallen">{"Lords of Fallen"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Hexworks · 2023"}</span>

</div>

</div>

<div className="hidden lg:flex flex-col items-center justify-center rounded-lg bg-surface-container/30 text-on-surface-variant/40">
<span className="material-symbols-outlined text-2xl">{"add"}</span>

<span className="font-label-sm text-label-sm mt-1 uppercase">{"Browse 43 more"}</span>

</div>

</div>

</section>

<section className="flex flex-col md:flex-row gap-4 p-4 lg:p-6 rounded-xl bg-surface-container-low shadow-sm" id="tier-f">

<div className="flex md:flex-col justify-between items-center md:items-start w-full md:w-44 flex-shrink-0 p-4 rounded-lg bg-surface-container">
<div className="flex items-center md:flex-col md:items-start gap-2">
<span className="font-display-lg text-display-lg font-bold text-error leading-none">{"F"}</span>

<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold uppercase tracking-wider text-on-surface">{"Unplayable"}</span>

<span className="font-label-sm text-label-sm text-error">{"Score <40"}</span>

</div>

</div>

<div className="flex items-center gap-1.5 pt-0 md:pt-6">
<span className="font-label-sm text-label-sm text-on-surface-variant">{"14 games"}</span>

<span className="w-1.5 h-1.5 rounded-full bg-error"></span>

</div>

</div>

<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 flex-1 min-w-0">

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOjypVD7nx3dTen61RnMxKWMkO2fZqh_vwKzwUieciYK_Px3cyysUVpWdQMiZ-3o40iWhbZU8Y5M1ZI6-kSQhWf_CyIL21ao4m1B_IEfFD6HYfwdmcmW-YhintkAjcXcWgwxaFc53TOkBhQpzTJPZ33CXkQMcW-IsIMzFhGlsKUKwZiddVc1JeZhZ4TqxIUot6zRQyxBbgloNe_33Ok7FvjAmuE887oaeI3vVIoHGYTNFe4IvOWgUl" alt="Desolate post-apocalyptic zombie survival game poster featuring a masked figure with a tactical backpack standing on an empty snow-covered New York boulevard, murky muted grey and faded warning amber colors" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-error">{"21"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/the-day-before">{"The Day Before"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Fntastic · 2023"}</span>

</div>

</div>

<div className="group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1">
<div className="aspect-[3/4] w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3P-cEtDag7z1qemQEXk5drP2L4j9kpN6MYaPPbRO0g01_FUXwQPSMscexivjXS0rG4wos2g4zBuaqP8x3DqFpJ8D0yWxUqnt2cmtKSATP2hT7bmVMbqDQNpPZgrBXyfE-Fwuy9qbEwdNYHaCAvO_a41OB_71qHUHQp5yrDGa7HetKBKV1zxhheJoGlqvZRBb6n-zEcoJwH-Gkk8WK2kMr_pQvvcfVD-554jB4hpAn2ABCffxCRQcZ" alt="Dark fantasy adventure game art showing a gaunt creature crouching in the damp dark caverns of Mordor beneath glowing lava cracks, eerie shadowed cavern environment with dull rust and charcoal hues" />

</div>

<div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow">
<span className="font-label-sm text-label-sm font-bold text-error">{"34"}</span>

</div>

<div className="p-2.5 flex flex-col bg-surface-container">
<h2 className="font-headline-md text-body-md font-semibold text-on-surface truncate"><Link className="after:absolute after:inset-0" href="/game/the-lord-of-the-rings-gollum">{"LOTR: Gollum"}</Link></h2>

<span className="font-label-sm text-label-sm text-on-surface-variant truncate">{"Daedalic · 2023"}</span>

</div>

</div>

<div className="hidden lg:flex flex-col items-center justify-center rounded-lg bg-surface-container/30 text-on-surface-variant/40">
<span className="material-symbols-outlined text-2xl">{"add"}</span>

<span className="font-label-sm text-label-sm mt-1 uppercase">{"Browse 12 more"}</span>

</div>

</div>

</section>

</div>

<div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-surface-container-low text-on-surface-variant mt-4">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-xl">{"auto_awesome"}</span>

<span className="font-body-sm text-body-sm">{"\n          Board synchronized with your verified steam critique logs and personal reviews.\n        "}</span>

</div>

<div className="flex items-center gap-3">
<PreviewAction className="px-3.5 py-1.5 rounded bg-surface-container hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors" message={"Preview only: this feature is not connected yet."}>{"\n          Share Matrix\n        "}</PreviewAction>

<PreviewAction className="px-3.5 py-1.5 rounded bg-primary-container text-on-primary-container hover:bg-primary font-label-md text-label-md font-semibold transition-colors" message={"Preview only: this feature is not connected yet."}>{"\n          Organize Tiers\n        "}</PreviewAction>

</div>

</div>

</div>

</div>
</div>
</>);
}
