"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSearchMatches, SearchResults, type SearchScope } from "@/components/search-results";

export function SearchScreen({ initialQuery, returnPath, mode }: { initialQuery: string; returnPath: string; mode: "browse" | "log" }) {

const [query, setQuery] = useState(initialQuery);
const [scope, setScope] = useState<SearchScope>("all");
const dialog = useRef<HTMLDivElement>(null);
const input = useRef<HTMLInputElement>(null);
const router = useRouter();
const matchCounts = getSearchMatches(query);
const totalCount = matchCounts.titles.length + matchCounts.profiles.length + (matchCounts.listMatches ? 1 : 0) + 2;
function close() { router.push(returnPath); }
useEffect(() => { input.current?.focus(); input.current?.setSelectionRange(initialQuery.length, initialQuery.length); }, [initialQuery]);
function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
  if (event.key === "Escape") { event.preventDefault(); close(); }
  const links = Array.from(dialog.current?.querySelectorAll<HTMLAnchorElement>("[data-search-result]") ?? []);
  if ((event.key === "ArrowDown" || event.key === "ArrowUp") && links.length) {
    event.preventDefault();
    const current = links.findIndex((link) => link === document.activeElement);
    const next = current === -1 ? (event.key === "ArrowDown" ? 0 : links.length - 1) : (current + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
    links[next]?.focus();
  }
  if (event.key === "Enter" && event.target === input.current && links.length) { event.preventDefault(); links[0].click(); }
  if (event.key === "Tab") {
    const elements = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, [tabindex="0"]') ?? []);
    const first = elements[0], last = elements[elements.length - 1];
    if (event.shiftKey && event.target === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && event.target === last) { event.preventDefault(); first?.focus(); }
  }
}
return (<div onKeyDown={onKeyDown}>
<h1 className="sr-only">Search the sample catalog</h1>
<div className="w-full  bg-surface"><div className="flex flex-col w-full relative min-h-[calc(100vh-4rem)]">

<div aria-hidden="true" className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 opacity-25 filter blur-[3px] pointer-events-none select-none">
<div className="flex items-center justify-between pb-6">
<div className="space-y-1">
<span className="font-label-sm text-label-sm uppercase tracking-widest text-primary">{"Archival Index"}</span>

<h2 className="font-headline-xl text-headline-xl text-on-surface">{"Curated Database"}</h2>

</div>

<div className="flex gap-2">
<span className="px-3 py-1 bg-surface-container rounded font-label-md text-label-md text-on-surface-variant">{"4,281 Titles Tracked"}</span>

</div>

</div>

<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
<div className="aspect-[3/4] bg-surface-container rounded flex flex-col justify-end p-3">
<div className="h-3 w-3/4 bg-surface-container-highest rounded mb-1"></div>

<div className="h-2 w-1/2 bg-surface-container-high rounded"></div>

</div>

<div className="aspect-[3/4] bg-surface-container rounded flex flex-col justify-end p-3">
<div className="h-3 w-3/4 bg-surface-container-highest rounded mb-1"></div>

<div className="h-2 w-1/2 bg-surface-container-high rounded"></div>

</div>

<div className="aspect-[3/4] bg-surface-container rounded flex flex-col justify-end p-3">
<div className="h-3 w-3/4 bg-surface-container-highest rounded mb-1"></div>

<div className="h-2 w-1/2 bg-surface-container-high rounded"></div>

</div>

<div className="aspect-[3/4] bg-surface-container rounded flex flex-col justify-end p-3">
<div className="h-3 w-3/4 bg-surface-container-highest rounded mb-1"></div>

<div className="h-2 w-1/2 bg-surface-container-high rounded"></div>

</div>

<div className="aspect-[3/4] bg-surface-container rounded flex flex-col justify-end p-3">
<div className="h-3 w-3/4 bg-surface-container-highest rounded mb-1"></div>

<div className="h-2 w-1/2 bg-surface-container-high rounded"></div>

</div>

<div className="aspect-[3/4] bg-surface-container rounded flex flex-col justify-end p-3">
<div className="h-3 w-3/4 bg-surface-container-highest rounded mb-1"></div>

<div className="h-2 w-1/2 bg-surface-container-high rounded"></div>

</div>

</div>

</div>

<div className="fixed inset-0 top-16 z-40 bg-surface-container-lowest/80 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 md:p-10 overflow-y-auto" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>

<div className="w-full max-w-3xl bg-surface-container-low shadow-2xl rounded-xl overflow-hidden flex flex-col my-auto sm:my-8 transition-all animate-in fade-in duration-200" id="palette-dialog" ref={dialog} role={"dialog"} aria-modal={true} aria-label={"Search the sample catalog"}>

<div className="relative flex items-center px-5 py-4 bg-surface-container">
<span className="material-symbols-outlined text-primary text-[22px] mr-3.5 flex-shrink-0 animate-pulse">{"search"}</span>

<div className="flex-1 relative flex items-center">
<input className="w-full bg-transparent text-on-surface font-headline-md text-headline-md tracking-tight focus:outline-none placeholder:text-on-surface-variant/40 caret-primary" id="command-input" placeholder="Search titles, directors, lists, or commands..." type="text" ref={input} value={query} onChange={(event) => setQuery(event.target.value)} aria-label={"Search titles, profiles and commands"} />

<span className="hidden sm:inline-block w-2 h-5 bg-primary/80 ml-0.5 animate-pulse"></span>

</div>

<div className="flex items-center gap-2 ml-4">
<button className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm tracking-widest uppercase transition-colors" title="Close search" onClick={close}>{"\n            ESC\n          "}</button>

</div>

</div>

<div className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-low text-on-surface-variant overflow-x-auto">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant/70 mr-1 flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">{"tune"}</span>
{" Scope:\n        "}</span>

<button onClick={() => setScope("all")} aria-pressed={scope === "all"} className={"px-2.5 py-1 rounded font-label-sm text-label-sm tracking-wide transition-colors whitespace-nowrap flex items-center gap-1.5 " + (scope === "all" ? "bg-surface-container-high text-primary font-semibold shadow-sm" : "hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface")}><span>All Results</span><span className="px-1.5 py-0.2 bg-primary/20 text-primary rounded font-label-sm text-[10px]">{totalCount}</span></button>

<button onClick={() => setScope("games")} aria-pressed={scope === "games"} className={"px-2.5 py-1 rounded font-label-sm text-label-sm tracking-wide transition-colors whitespace-nowrap " + (scope === "games" ? "bg-surface-container-high text-primary font-semibold shadow-sm" : "hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface")}>Games ({matchCounts.titles.length})</button>

<button onClick={() => setScope("curators")} aria-pressed={scope === "curators"} className={"px-2.5 py-1 rounded font-label-sm text-label-sm tracking-wide transition-colors whitespace-nowrap " + (scope === "curators" ? "bg-surface-container-high text-primary font-semibold shadow-sm" : "hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface")}>Curators ({matchCounts.profiles.length})</button>

<button onClick={() => setScope("lists")} aria-pressed={scope === "lists"} className={"px-2.5 py-1 rounded font-label-sm text-label-sm tracking-wide transition-colors whitespace-nowrap " + (scope === "lists" ? "bg-surface-container-high text-primary font-semibold shadow-sm" : "hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface")}>Curated Lists ({matchCounts.listMatches ? 1 : 0})</button>

<button onClick={() => setScope("actions")} aria-pressed={scope === "actions"} className={"px-2.5 py-1 rounded font-label-sm text-label-sm tracking-wide transition-colors whitespace-nowrap " + (scope === "actions" ? "bg-surface-container-high text-primary font-semibold shadow-sm" : "hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface")}>Actions (2)</button>

</div>

<SearchResults query={query} scope={scope} mode={mode} />

<div className="flex items-center justify-between px-5 py-3 bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm">
<div className="flex items-center gap-4 flex-wrap">
<span className="flex items-center gap-1.5">
<kbd className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-semibold">{"↵"}</kbd>

<span>{"Select title"}</span>

</span>

<span className="flex items-center gap-1.5">
<kbd className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-semibold">{"↑↓"}</kbd>

<span>{"Navigate"}</span>

</span>

<span className="hidden sm:flex items-center gap-1.5">
<kbd className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-semibold">{"Tab"}</kbd>

<span>{"Switch category"}</span>

</span>

</div>

<div className="flex items-center gap-1.5">
<kbd className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-semibold">{"ESC"}</kbd>

<span>{"Dismiss"}</span>

</div>

</div>

</div>

</div>

</div>

</div>
</div>);
}
