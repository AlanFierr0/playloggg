import Link from "next/link";
import type { Game, Profile } from "@/types/domain";

export function ReferenceGame0({ game, query, mode }: { game: Game; query: string; mode: "browse" | "log" }) { return (<Link data-search-result className="group relative flex items-center justify-between p-2.5 rounded-lg bg-surface-container-high shadow-md transition-all" href={mode === "log" ? "/log?game=" + game.slug : "/game/" + game.slug}>
<div className="flex items-center gap-3.5 min-w-0">
<div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-surface-container-highest shadow">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAB_4g_lDi59xZBF98BIwVrApVThkis9Q56RTuHZdyX3q7ds0YVEdchiYT17z3Dek4fxidPQAKG-Lv3BtktGDXnNznBp03OKO72jkL5l8iE9gTbbdl89zDI8nv3SQ8jvXg2bWPuqhQLIOFljPGGs7c1Qrkd-gjNHpzXDDRWSqUe0xdbp4V_dv9ajEmuohd0gX4r-UmJ5OKVKnEq2fIxC4giapwkR5g_tBUJ5lx9v3x8gBp1YCYFXmrX" alt="Moody cinematic box art poster for Cyberpunk 2077 Phantom Liberty featuring high contrast neon amber and dark obsidian shadows with a solitary spy silhouette in a dystopian retro-futuristic city." />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent"></div>

</div>

<div className="min-w-0 flex flex-col gap-0.5">
<div className="flex items-center gap-2 flex-wrap">
<span className="font-headline-md text-headline-md text-on-surface font-semibold truncate group-hover:text-primary transition-colors">
<HighlightedTitle title={game.title} query={query} /></span>

<span className="px-1.5 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface-variant font-medium">{game.year ?? "—"}</span>

<span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-label-sm text-label-sm font-bold tracking-wider">{game.tier ? "TIER " + game.tier : "UNASSIGNED"}</span>

</div>

<div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
<span>{game.genres?.[0] ?? "Catalog entry"}</span>

<span className="text-on-surface-variant/40">{"•"}</span>

<span className="inline-flex items-center gap-1 text-secondary font-medium">
<span className="material-symbols-outlined text-[14px]">{"check_circle"}</span>
{game.score === null ? " Unrated" : " Sample rating"}</span>

<span className="text-on-surface-variant/40">{"•"}</span>

<span className="font-label-md text-label-md text-on-surface-variant">{"Read only"}</span>

</div>

</div>

</div>

<div className="flex items-center gap-3 pl-4 flex-shrink-0">
<div className="flex flex-col items-end">
<span className="px-2 py-0.5 rounded bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm">{game.score ?? "—"}</span>

<span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">{game.score === null ? "Unrated" : "Sample score"}</span>

</div>

<div className="hidden sm:flex items-center justify-center w-7 h-7 rounded bg-surface-container text-primary">
<span className="material-symbols-outlined text-[16px]">{"keyboard_return"}</span>

</div>

</div>

</Link>
); }

export function ReferenceGame1({ game, query, mode }: { game: Game; query: string; mode: "browse" | "log" }) { return (<Link data-search-result className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-container transition-all" href={mode === "log" ? "/log?game=" + game.slug : "/game/" + game.slug}>
<div className="flex items-center gap-3.5 min-w-0">
<div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-surface-container-highest shadow">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRfWK-EIqNC8BRJjm-esKfllBT8NsqDaudcYBsGdfb6aVtolgHsqVOFZ976IH-VBhAoX32bO1gu-xps5D9KuR3UJRq_UVPiUJd2YnblMhwli9iB_p6XRLe-3CE8vnNDlpuvFmIESXxf2M4LZxzvCBsC2nnuB-q_5Npl-xGjCUYRnQ-SX1p174f4VH7QclfPHqYgdtmmgAt0CMDwzerbJivygQ-JQYS9GnVmiwnZgOPta6WrKqneV1a" alt="Dystopian neon aesthetic game cover for Cyberpunk 2077 with yellow background hue, futuristic cyberware warrior character profile with dark obsidian cinematic palette." />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent"></div>

</div>

<div className="min-w-0 flex flex-col gap-0.5">
<div className="flex items-center gap-2 flex-wrap">
<span className="font-headline-md text-headline-md text-on-surface font-semibold truncate group-hover:text-primary transition-colors">
<HighlightedTitle title={game.title} query={query} /></span>

<span className="px-1.5 py-0.5 rounded bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant">{game.year ?? "—"}</span>

<span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-semibold tracking-wider">{game.tier ? "TIER " + game.tier : "UNASSIGNED"}</span>

</div>

<div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
<span>{game.genres?.[0] ?? "Catalog entry"}</span>

<span className="text-on-surface-variant/40">{"•"}</span>

<span className="inline-flex items-center gap-1 text-on-surface-variant font-medium">
<span className="material-symbols-outlined text-[14px]">{"done_all"}</span>
{game.score === null ? " Unrated" : " Sample rating"}</span>

<span className="text-on-surface-variant/40">{"•"}</span>

<span className="font-label-md text-label-md text-on-surface-variant">{"Read only"}</span>

</div>

</div>

</div>

<div className="flex items-center gap-3 pl-4 flex-shrink-0">
<div className="flex flex-col items-end">
<span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-label-md text-label-md font-semibold">{game.score ?? "—"}</span>

<span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">{game.score === null ? "Unrated" : "Sample score"}</span>

</div>

</div>

</Link>
); }

export function ReferenceGame2({ game, query, mode }: { game: Game; query: string; mode: "browse" | "log" }) { return (<Link data-search-result className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-container transition-all" href={mode === "log" ? "/log?game=" + game.slug : "/game/" + game.slug}>
<div className="flex items-center gap-3.5 min-w-0">
<div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-surface-container-highest shadow">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtBc6YqCTsYfTis5J6jZdvzCYHtxHHhCdcrcS5N_ztQeB_PYssJdh8-_7CR7OHm735PqhYj0Jf7gKhXqyUuOTbnSMcxzvJyU538ww0aaA5r3PgCIIQ9FZrPN1W_8FtL3eT-ROOvis0mBL8208J8p7LbT95Pc5GEwzcWBx5tOkVGSkYWE9EGPCtujUtF2CYkZI0qMx9TRBX0gw5uh8fhR2sxR_fTn1fp43FN6m0GH_MSNapyxfUqQZa" alt="Minimalist dark sci-fi poster artwork for System Shock 2023 remake, menacing green electronic wireframe face of SHODAN artificial intelligence peering from dark void." />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent"></div>

</div>

<div className="min-w-0 flex flex-col gap-0.5">
<div className="flex items-center gap-2 flex-wrap">
<span className="font-headline-md text-headline-md text-on-surface font-semibold truncate group-hover:text-primary transition-colors"><HighlightedTitle title={game.title} query={query} /></span>

<span className="px-1.5 py-0.5 rounded bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant">{game.year ?? "—"}</span>

<span className="px-1.5 py-0.5 rounded bg-secondary-container/20 text-secondary font-label-sm text-label-sm font-semibold tracking-wider">{game.tier ? "TIER " + game.tier : "UNASSIGNED"}</span>

<span className="font-label-sm text-[10px] text-primary uppercase tracking-wider bg-primary/10 px-1 rounded">{"Catalog"}</span>

</div>

<div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
<span>{game.genres?.[0] ?? "Catalog entry"}</span>

<span className="text-on-surface-variant/40">{"•"}</span>

<span className="inline-flex items-center gap-1 text-tertiary font-medium">
<span className="material-symbols-outlined text-[14px]">{"bookmark"}</span>
{game.score === null ? " Unrated" : " Sample rating"}</span>

</div>

</div>

</div>

<div className="flex items-center gap-3 pl-4 flex-shrink-0">
<div className="flex flex-col items-end">
<span className="px-2 py-0.5 rounded bg-secondary/20 text-secondary font-label-md text-label-md font-bold">{game.score ?? "—"}</span>

<span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">{game.score === null ? "Unrated" : "Sample score"}</span>

</div>

</div>

</Link>
); }

export function ReferenceProfile0({ profile, count, average }: { profile: Profile; count: number; average: string }) { return (<Link data-search-result className="group flex items-center gap-3 p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors" href="/profile">
<div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface-container-highest shadow">
<img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPR3kE6YXPh0KcbLB3QdntYw9Fur-K2Xwb06_RrKu21UnICzGWkoNyFVhMMidS1ncft6NyJSyWZR3gy8Z7qfEMRxjov1ssU2ObkYQT_M9LTnqpIBAHHa7UUW4B5MhoDtu0wBqGAEOZgh5feeC_BW_hJvTrOuTomxItaobb8mSBp5K5gGiTSBCnUcCb9rUByhMEV_3QAX1MyFEm9KKWic0jpPHQq43FznLNkqURWot_nJyKlvnJqM6b" alt="Monochrome minimal portrait of a digital game curator with clean framing, soft lighting, and high contrast cinematic mood." />

</div>

<div className="min-w-0 flex-1">
<div className="flex items-center gap-1.5">
<span className="font-headline-md text-body-lg font-bold text-on-surface truncate group-hover:text-primary transition-colors">{profile.displayName}</span>

<span className="font-label-sm text-label-sm text-primary bg-primary/10 px-1 rounded uppercase font-semibold">{"Sample"}</span>

</div>

<div className="font-body-sm text-body-sm text-on-surface-variant truncate">{"@" + profile.handle + " · " + count + " rated titles · " + average + " avg score"}</div>

</div>

<span className="material-symbols-outlined text-on-surface-variant text-[18px] group-hover:translate-x-0.5 transition-transform">{"chevron_right"}</span>

</Link>
); }

export function ReferenceProfile1() { return (<Link data-search-result className="group flex items-center gap-3 p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors" href="/compare">
<div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface-container-highest shadow">
<img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEtR9byXm7ZjLBZF0UBD0ISuEXlkZRVwRnTF3HVd5ZRuPaSK_fxzKrG9Ua42HiNvU37ACIPE9SgOUnHU7qszYaO9JEMDN7XNqvhxsz9EZ17KLpvA61Jfmq_bLkC3QLOdkA-cdOaqMAlpaXK2-9XqwXKbGyP_Zjn4HBo8W10nrkBDNT9pOTF5TLH7XAIAMtPOCkASnxW2VTP2_XGFq655q0s0C9ra1JWHYXLj4rMT4pWrRBWdK_v1MM" alt="Atmospheric studio portrait of acclaimed game director with glasses under subtle amber rim lighting, dark moody studio background." />

</div>

<div className="min-w-0 flex-1">
<div className="flex items-center gap-1.5">
<span className="font-headline-md text-body-lg font-bold text-on-surface truncate group-hover:text-primary transition-colors">{"Hideo Kojima"}</span>

<span className="material-symbols-outlined text-secondary text-[14px]">{"verified"}</span>

</div>

<div className="font-body-sm text-body-sm text-on-surface-variant truncate">{"\n                  Auteur • 142 mutuals (81% affinity)\n                "}</div>

</div>

<span className="material-symbols-outlined text-on-surface-variant text-[18px] group-hover:translate-x-0.5 transition-transform">{"chevron_right"}</span>

</Link>
); }

export function ReferenceList() { return (<Link data-search-result className="group flex items-center justify-between p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors" href="/tiers">
<div className="flex items-center gap-3.5 min-w-0">
<div className="flex -space-x-4 flex-shrink-0">
<div className="w-8 h-11 rounded bg-surface-container-highest overflow-hidden shadow">
<img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQNPQeG3Qmgp4H50Xo8L4GbFJ3-sFTqAMWj0ySuRQu3fsX7monV1jPc4qGWsJqLMBt8S4xixHOBl7yGU0gRk4Q-0vspL9AgW4Ealc-m7gb-SXm-9Z1Zb5HWEmL-i495dN-tNZHVgHh6VziQkQGkDbUTLFFuFCeXdWxztvKt1EU9eNR8T9loYTSSliRQXFRQubW_gk4EiQ7Zkjhzqp5KMJKV89cl4KMEtiBcIHjbTS5Sp6cI7wZjKIo" alt="Dark neon cityscape poster thumbnail for sci-fi atmosphere ranking." />

</div>

<div className="w-8 h-11 rounded bg-surface-container-high overflow-hidden shadow">
<img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiiY0_jteuov2-LxX_IYok4YMHeE1UnGu4twbJwbZCb_rCkalwGraOxHdndMHro9H3U7IF6W7CzPw6gxdpP54dplTkgRMp_968PeD2L6PMQl3bprCgVwO4bdakt_-Gvw3rIdMs4JQq6Kb9RfwkMzK79w-1zxAlFXx7rpkV6TxOgqQl8j4lLf9CsZfEXR0zQpdP7jl9qO8aLC9eZHp7v-spJbJgIipUkep3VLNC8728Bk5PMeHcTlz1" alt="Obsidian tech terminal interface poster thumbnail for retro sci-fi games." />

</div>

<div className="w-8 h-11 rounded bg-surface-container overflow-hidden shadow">
<img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRH7KnRnOnfZbyB3C9Gia_Jra8n6iCisrgweHjwx0NFhNnEEIj69Kq6akCyYK4Lw4PS-iR1Gl7Ikp-ct6C8gc_G6FsN3HZjQfGAZXH-EGJzHJQDKfgszZ80mH3kFhswIlVARXbUSGU_GNa7Umz9qeAHNoQPVgzPs-ylBqCy2ZOIBVg7lwklOWylryYsEkb6FNtmwIKt4JQ4wMqHJod4D3Iq48PynwKtSJY9Jtxxc6oCoZobM9SHTnV" alt="Moody cinematic portrait poster thumbnail of an android in torrential rain." />

</div>

</div>

<div className="min-w-0">
<div className="font-headline-md text-body-lg text-on-surface font-semibold truncate group-hover:text-primary transition-colors">
<mark className="bg-transparent text-primary">{"Cyber"}</mark>
{"punk & Dystopian Sci-Fi Atmospheres\n                "}</div>

<div className="font-body-sm text-body-sm text-on-surface-variant">{"\n                  Archived by "}<span className="text-on-surface">{"@neon_diegesis"}</span>
{" • 42 ranked titles • Updated 4d ago\n                "}</div>

</div>

</div>

<div className="flex items-center gap-2 pl-4 flex-shrink-0">
<span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">{"\n                42 entries\n              "}</span>

<span className="material-symbols-outlined text-on-surface-variant text-[18px]">{"open_in_new"}</span>

</div>

</Link>
); }

export function ReferenceCommand0() { return (<Link data-search-result className="w-full flex items-center justify-between p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-left transition-colors group" href="/log">
<div className="flex items-center gap-2.5 min-w-0">
<div className="w-7 h-7 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
<span className="material-symbols-outlined text-[16px]">{"add"}</span>

</div>

<div className="min-w-0">
<span className="font-body-md text-body-md text-on-surface font-medium truncate block group-hover:text-primary transition-colors">{"\n                    Log new game entry\n                  "}</span>

<span className="font-body-sm text-[11px] text-on-surface-variant block">{"Open rating & shelf modal"}</span>

</div>

</div>

<kbd className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm tracking-widest">{"\n                L\n              "}</kbd>

</Link>
); }

export function ReferenceCommand1() { return (<Link data-search-result className="w-full flex items-center justify-between p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-left transition-colors group" href="/compare">
<div className="flex items-center gap-2.5 min-w-0">
<div className="w-7 h-7 rounded bg-surface-container-highest text-tertiary flex items-center justify-center font-bold">
<span className="material-symbols-outlined text-[16px]">{"compare_arrows"}</span>

</div>

<div className="min-w-0">
<span className="font-body-md text-body-md text-on-surface font-medium truncate block group-hover:text-primary transition-colors">{"\n                    Compare libraries...\n                  "}</span>

<span className="font-body-sm text-[11px] text-on-surface-variant block">{"Dual-matrix side by side"}</span>

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
