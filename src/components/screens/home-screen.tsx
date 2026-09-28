import Link from "next/link";
import { PreviewAction } from "@/components/preview-action";

export function HomeScreen() {
return (<>
<div className="w-full  bg-surface"><div className="flex flex-col w-full">

<div className="relative w-full overflow-hidden">
<div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none"></div>

<section className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-20">
<div className="relative rounded-xl overflow-hidden bg-surface-container-lowest shadow-2xl group">

<div className="bg-cover bg-center h-[520px] sm:h-[600px] w-full transition-transform duration-700 ease-out group-hover:scale-[1.015]" data-alt="Cinematic atmospheric vista of a towering withered spectral gold tree bleeding sap against a tempestuous twilight charcoal sky. Somber muted palette of deep obsidian, charcoal ash, and subtle golden amber luminescence, dark fantasy editorial key art style with immense sense of scale, moody, solitary knight standing on a distant jagged ridge." style={{"backgroundImage": "url(\"https://lh3.googleusercontent.com/aida-public/AB6AXuD0NnT2Y_Nz3MroWPy-S8FfVfig5bFH4m2hhLxfuFdoZXCUmDbHFZ9ADG0BUC_XgHadWbAFftpkYoEL5l91LbMieia6ld2wiKCrRDqLtEZxEKQuMfFpVeoi5pJweGAKWVKdXuTSB9jFMflsHYeU9UgkJTnc5_8eey6Gq1mjK4F3vSezEqTj_2vrOR4g4_h_chNU8nGszmGx-HaR6pRVDzAHTroUXoClWvdvmlyzl_ty_CTb3XuNykL_\")"}}>
</div>

<div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"></div>

<div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/40 to-transparent"></div>

<div className="absolute top-8 left-8 sm:left-12 flex items-center gap-3">
<span className="px-2.5 py-1 rounded bg-surface-container-high/80 backdrop-blur-md font-label-sm text-label-sm text-primary uppercase tracking-widest">{"Editor's Spotlight"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{"Vol. XIV • Curated Feature"}</span>

</div>

<div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 max-w-3xl flex flex-col gap-5">
<div className="flex flex-wrap items-center gap-3">
<span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{"FromSoftware"}</span>

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

<div className="flex items-center gap-4 pt-2">
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

<section className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
<div className="flex items-end justify-between mb-8">
<div>
<span className="font-label-sm text-label-sm text-primary uppercase tracking-widest block mb-1">{"Archival Selection"}</span>

<h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">{"The Essential Canon"}</h2>

</div>

<Link className="group flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" data-path="rankings" href="/profile">
<span className="">{"Explore All 250"}</span>

<span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">{"arrow_forward"}</span>

</Link>

</div>

<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">

<Link className="group flex flex-col" data-path="game/baldurs-gate-3" href="/game/baldurs-gate-3">
<div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-surface-container-low shadow-md transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDK2U3PzNCWB3y5Jnqs2Q_oIiisOznnbfOV9jnX4CUJMBcHOmSIp1tZ_e1-jWZV8SSHNcpEuszWG4mWIVOe3KthSn7b_PQ7oF9NIFqNjzstwbd9MxhPY6mgn8oKlMFTQCA93twZyA5zYcaMycnlSunKpne9HU-5ZM7Qrn5rp0CqleKXX2veTaGtqsqqWTQ3Gbcsyaq1lVegqRSxrO2Io1hF9oQ6imD38EhnyDRjQZvL98p0IgI0jWmG" alt="Editorial artistic game portrait of a silver-haired vampire elf rogue with crimson eyes against a dark moody twilight gothic forest backdrop, high fantasy portraiture, cinematic lighting, muted shadows with subtle gold embers, deep charcoal tone." />

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
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-h5CKf7Ik-rT86iVNmmQXhF1klJb-9Psf1vYqYYJnx30RTrtJ8j4FZgdRDe2r3glGnLdlYcPPfmJkiORjA2G4KSu_ek-ngdepCtdskMOIoP2cQxOs-S8HZ8KsYXnmpy5tVPJb-bIZf66E0VP4k14rRRgGvcQxeCB4UP0Oxp178oS0GTIi3MutYtF5SYFEfugoMJU0yGYXQKt-74-oB114dVppRjFMcILSa56CWJwkJhTsg5wcQP0s" alt="Oil painted expressionist portrait of a melancholic disheveled detective in a stained green blazer against a stark, winter coastal European seaside slum with dilapidated pale brick buildings and muted olive gray sky, artistic painterly brushstrokes." />

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
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAai175ca8B5tiQvS4VkQ_MqckPgmsMaXKBfK45rGnZo31ObUboBFIAbNaXwh_AsmkMwIY8qDnSIkQIbkU2soXO1FFC-23WYX37O-E2yKmx90_Rqe5VPJe8nRRB-87lR5E9mBpRyTgOqjQpqgBMUKmH6wxen--dCOedClT2b_S6fo9whKRDhj45xoOUZxFKGejDiuZ3Ys57Z49IrksjZV827dUsBKzXZmWU1R6BkysK4YVhHCN1HgJ" alt="Stylized anime-influenced fantasy art piece showing an ethereal young protagonist with azure eyes looking towards a floating colossal gothic cathedral in a crimson twilight sky, sleek modern typographic contrast, subtle gold filigree, Studio Zero aesthetic." />

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
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYd9aDwZ6JCUqFqC6dYyeZVhun4XJ6_7m3qeHdsHj2NqC_Hkzd7Tya56rM-mZHHDMrTNEYTHQY78D_QIA8dne2G_houQSK-RyRVO51NCbKqDgNHrU3jIa9c7kxnmERnlDamWvI5GPa6EY8WXJvEvv4wfKe4HC1XtUVThoBed-PR4aF0-JLZNViJPFJFZYkBccc-tpGPm73L3ffAibwxR-jU7Zwynswf8uor40LOtr5ufjAH4p_UTZL" alt="Psychological horror neo-noir composition of a man with a flashlight in dense misty Pacific Northwest rain forest at night, deep saturated crimson illumination overlapping shadowy pine silhouettes, cinematic film grain, Twin Peaks evocative mood." />

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
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFLFzx6mxMCqAZetfA9IJEHRyYPzTz7Ij-bkaZsBwlScBDx-_yoZIjDl8o5ImFJQgaqMNYn3XC-v_vI62fC6MoEqa4MIuK2u0P3z-k6_WhbZ7iUluRByKbfr3DLFmlia3dN54GGaFT8QCPDxoZ8t43slNKFaq6iErXtVX7MKlDfg2jn_23sgXUMMLZh3IGnpqN9Y6V0WBTG5229ncrDjjjIxip3jUZjzQDnAynrOsIHqzAOhpTuVGx" alt="Brutalist dystopian urban sci-fi vista of City 17 featuring a colossal dark metallic Citadel rising through cold overcast slate clouds over crumbling Eastern European neoclassical brick buildings, atmospheric muted industrial tones, quiet dystopia." />

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

<section className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

</div>

</section>

<section className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-16">
</section>

</div>

</div>
</div>
</>);
}
