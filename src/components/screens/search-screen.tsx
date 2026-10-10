"use client";
import { useMessages } from "@/components/site-preferences";

import { Suspense, use, useEffect, useRef, useState, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { SearchResults, type SearchScope } from "@/components/search-results";

import { PortfolioProvider } from "@/components/portfolio-provider";
import type { Portfolio, Profile } from "@/types/domain";


export function SearchScreen({ initialQuery, returnPath, mode, portfolio }: { initialQuery: string; returnPath: string; mode: "browse" | "log"; portfolio: Promise<Portfolio & {hasMore: boolean}> }) {
  const t = useMessages();


const [query, setQuery] = useState(initialQuery);
const [offset, setOffset] = useState(0);
const [scope, setScope] = useState<SearchScope>("all");
const dialog = useRef<HTMLDialogElement>(null);
const input = useRef<HTMLInputElement>(null);
const router = useRouter();
const [profileSearch, setProfileSearch] = useState<{ query: string; profiles: Profile[]; error?: boolean } | null>(null);
const profiles = profileSearch?.query === query ? profileSearch.profiles : [];
const profilesLoading = mode !== "log" && profileSearch?.query !== query;
useEffect(() => {
  if (mode === "log") return;
  const controller = new AbortController();
  const timer = setTimeout(async () => {
    try {
      const response = await fetch(`/api/profiles/search?q=${encodeURIComponent(query)}`, { signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error("Profile search failed.");
      const data: { profiles: Profile[] } = await response.json();
      if (!controller.signal.aborted) setProfileSearch({ query, profiles: data.profiles });
    } catch {
      if (!controller.signal.aborted) setProfileSearch({ query, profiles: [], error: true });
    }
  }, 250);
  return () => { clearTimeout(timer); controller.abort(); };
}, [query, mode]);
const categories: { scope: SearchScope; label: string }[] = [{ scope: "all", label: "All Results" }, { scope: "games", label: "Games" }, { scope: "curators", label: "Profiles" }];

function close() { router.push(returnPath); }
useEffect(() => {
  const element = dialog.current;
  element?.showModal();
  return () => element?.close();
}, []);
useEffect(() => { input.current?.focus(); input.current?.setSelectionRange(initialQuery.length, initialQuery.length); }, [initialQuery]);
function onKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
  const links = Array.from(dialog.current?.querySelectorAll<HTMLElement>("[data-search-result]:not([disabled])") ?? []).filter(link => link.getClientRects().length > 0);
  if ((event.key === "ArrowDown" || event.key === "ArrowUp") && links.length) {
    event.preventDefault();
    const current = links.findIndex((link) => link === document.activeElement);
    const next = current === -1 ? (event.key === "ArrowDown" ? 0 : links.length - 1) : (current + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
    links[next]?.focus();
  }
  if (event.key === "Enter" && event.target === input.current) {
    if (links.length) { event.preventDefault(); links[0].click(); }
  }
  if (event.key === "Tab") {
    const elements = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, [tabindex="0"]') ?? []);
    const first = elements[0], last = elements[elements.length - 1];
    if (event.shiftKey && event.target === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && event.target === last) { event.preventDefault(); first?.focus(); }
  }
}
return (
  <dialog ref={dialog} onKeyDown={onKeyDown} onCancel={event => { event.preventDefault(); close(); }} aria-label={t("Search the game catalog")} className="fixed inset-x-0 bottom-0 top-[var(--site-header-height)] m-0 h-[calc(100dvh-var(--site-header-height))] w-full max-w-none max-h-none border-0 open:flex items-center justify-center bg-surface/90 text-on-surface backdrop-blur-sm backdrop:bg-transparent p-3 sm:p-6" onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <div id="palette-dialog" className="search-dialog flex w-full max-w-3xl min-w-0 min-h-0 flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low shadow-2xl">
      <header className="shrink-0 px-4 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <h1 className="font-headline-lg text-headline-lg">{t(mode === "log" ? "Choose a game" : "Search the game catalog")}</h1>
            <p className="text-body-sm text-on-surface-variant">{t(mode === "log" ? "Search for a game, then select it to open its log options." : "Browse games in the Playlogg catalog.")}</p>
          </div>
          <button type="button" onClick={close} aria-label={t("Close search")} title={t("Close search")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"><span aria-hidden="true" className="material-symbols-outlined text-[20px]">close</span></button>
        </div>
        <div className="mt-5 flex min-h-14 items-center gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-colors">
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-[22px] shrink-0">search</span>
          <input ref={input} id="command-input" type="text" value={query} onChange={event => {setQuery(event.target.value); setOffset(0);}} placeholder={t("Search games…")} maxLength={100} aria-label={t("Search titles and profiles")} className="min-w-0 flex-1 bg-transparent py-4 text-body-lg text-on-surface placeholder:text-on-surface-variant caret-primary focus:outline-none" />
        </div>
        {mode !== "log" && <nav aria-label={t("Search categories")} className="mt-4 flex flex-wrap gap-1 border-b border-outline-variant/20 pb-4">
          {categories.map(category => <button key={category.scope} type="button" onClick={() => setScope(category.scope)} aria-pressed={scope === category.scope} className={`min-h-11 rounded-lg px-3 sm:px-4 text-body-sm font-medium transition-colors ${scope === category.scope ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"}`}>{t(category.label)}{category.scope === "curators" && <span className="ml-1.5 text-label-sm">({profilesLoading ? "…" : profiles.length})</span>}</button>)}
        </nav>}
      </header>
      <Suspense fallback={<p role="status" className="px-6 py-8 text-on-surface-variant">{t("Loading…")}</p>}>
      <SearchData portfolio={portfolio} initialQuery={initialQuery} offset={offset} onLoadMore={() => setOffset(value => value + 24)} query={query} scope={mode === "log" ? "games" : scope} mode={mode} profiles={profiles} profilesLoading={profilesLoading} profilesError={profileSearch?.query === query && profileSearch.error} />
      </Suspense>
      <footer className="search-help hidden sm:flex shrink-0 items-center justify-between gap-4 border-t border-outline-variant/20 px-6 py-3 text-body-sm text-on-surface-variant">
        <div className="flex items-center gap-4"><span>{t("Navigate")}</span><span>{t("Select title")}</span></div>
        <span>{t("Dismiss")}</span>
      </footer>
    </div>
  </dialog>
);
}

function SearchData({ portfolio, initialQuery, offset, onLoadMore, ...props }: Omit<ComponentProps<typeof SearchResults>, "gamesLoading" | "gamesError" | "hasMore" | "onLoadMore" | "onRetry"> & { portfolio: Promise<Portfolio & {hasMore: boolean}>; initialQuery: string; offset: number; onLoadMore: () => void }) {
  const initial = use(portfolio);
  type Batch = Pick<Portfolio, "games"> & {hasMore: boolean};
  const [results, setResults] = useState(() => new Map<string, Batch>([[`0:${initialQuery}`, initial]]));
  const [failed, setFailed] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const key = `${offset}:${props.query}`;
  const visible = results.get(key);
  const previous = offset ? results.get(`${offset - 24}:${props.query}`) : undefined;
  useEffect(() => {
    if ((props.scope !== "all" && props.scope !== "games") || results.has(key)) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/games/search?q=${encodeURIComponent(props.query)}&offset=${offset}`, {signal: controller.signal, cache: "no-store"});
        if (!response.ok) throw new Error("Game search failed.");
        const data: Batch = await response.json();
        if (!controller.signal.aborted) setResults(cached => {
          const next = new Map(cached);
          if (next.size >= 20) next.delete(next.keys().next().value!);
          next.set(key, {...data, games: [...(previous?.games ?? []), ...data.games]});
          return next;
        });
      } catch {
        if (!controller.signal.aborted) setFailed(key);
      }
    }, 250);
    return () => {clearTimeout(timer); controller.abort();};
  }, [props.query, props.scope, offset, retry, results, key, previous]);
  return <PortfolioProvider portfolio={{...initial, games: visible?.games ?? previous?.games ?? []}}><SearchResults {...props} gamesLoading={!visible && failed !== key} gamesError={!visible && failed === key} hasMore={visible?.hasMore ?? false} onLoadMore={onLoadMore} onRetry={() => {setFailed(null); setRetry(value => value + 1);}} /></PortfolioProvider>;
}
