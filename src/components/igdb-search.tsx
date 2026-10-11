"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useMessages } from "@/components/site-preferences";
import { searchIgdb, importIgdb } from "@/app/actions/catalog";
import { catalogQuery } from "@/lib/catalog-input";
import type { Game } from "@/types/domain";

type Result = Awaited<ReturnType<typeof searchIgdb>> & { query: string };
export function IgdbSearch({ query, mode = "browse", onImported, onBusyChange, disabled = false, excludeSlugs = [] }: { query: string; mode?: "browse" | "log"; onImported?: (game: Game) => void; onBusyChange?: (busy: boolean) => void; disabled?: boolean; excludeSlugs?: string[] }) {
  const t = useMessages();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loadingQuery, setLoadingQuery] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<Result>();
  const [importMessage, setImportMessage] = useState({ query: "", value: "" });
  const cache = useRef(new Map<string, Awaited<ReturnType<typeof searchIgdb>>>());
  const current = query.trim();
  const cacheKey=`${mode}:${current.toLowerCase()}`;
  const visible = result?.query === current ? result : undefined;
  const loading = !disabled && loadingQuery === current;
  useEffect(() => {
    let cancelled = false;
    if (disabled || !catalogQuery(current)) return;
    const cached = cache.current.get(cacheKey);
    const timer = setTimeout(async () => {
      if (cached) { setResult({ ...cached, query: current }); setLoadingQuery(null); return; }
      setLoadingQuery(current);
      try {
        const response = await searchIgdb(current, mode === "log");
        if (cancelled) return;
        if (response.ok) {
          if (cache.current.size >= 20) cache.current.delete(cache.current.keys().next().value!);
          cache.current.set(cacheKey, response);
        }
        setResult({ ...response, query: current });
      } catch { if (!cancelled) setResult({ ok: false, query: current, games: [], message: "Game search is unavailable right now. Please retry." }); }
      finally { if (!cancelled) setLoadingQuery(null); }
    }, cached ? 0 : 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [current, disabled, retry, mode, cacheKey]);
  function select(id: number) {
    setImportMessage({ query: current, value: "" });
    onBusyChange?.(true);
    startTransition(async () => {
      try {
        const response = await importIgdb(id);
        setImportMessage({ query: current, value: response.message });
        if (response.ok && response.game) {
          cache.current.clear();
          if (onImported) onImported(response.game);
          else router.push(mode === "log" ? `/log?game=${encodeURIComponent(response.game.slug)}` : `/game/${encodeURIComponent(response.game.slug)}`);
          router.refresh();
        }
      } catch { setImportMessage({ query: current, value: "Import is unavailable. Please retry; existing games will be reused." }); }
      finally { onBusyChange?.(false); }
    });
  }
  if (!catalogQuery(current)) return null;
  return <div className="space-y-3">
    <p role="status" className="text-body-sm text-on-surface-variant">{t((importMessage.query === current ? importMessage.value : "") || (pending ? "Importing…" : loading ? "Searching games…" : visible?.ok && !visible.games.length && excludeSlugs.length ? "" : visible?.message ?? ""))}</p>
    {visible && !visible.ok && !loading && <button type="button" className="rounded px-3 py-2 bg-surface-container-high text-primary" onClick={() => setRetry(value => value + 1)}>{t("Retry search")}</button>}
    <ul className="space-y-2">{visible?.games.filter(game => !game.catalogSlug || !excludeSlugs.includes(game.catalogSlug)).map(game => <li key={game.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 rounded-lg p-2.5 hover:bg-surface-container">
      {game.cover ? <img src={game.cover} alt="" className="shrink-0 w-12 h-16 rounded object-cover" /> : <span className="shrink-0 w-12 h-16 rounded bg-surface-container-high flex items-center justify-center text-center text-[10px]">{t("No cover")}</span>}
      <div className="flex-1 min-w-0 space-y-1"><h3 className="break-words font-headline-md text-headline-md">{game.title}</h3><p className="text-on-surface-variant text-body-sm">{game.year ?? t("Release unknown")}</p><p className="break-words text-on-surface-variant text-label-sm">{game.platforms.join(" · ") || t("Platforms unknown")}</p></div>
      {game.catalogSlug && !onImported ? <Link data-search-result href={mode === "log" ? `/log?game=${game.catalogSlug}` : `/game/${game.catalogSlug}`} className="rounded px-3 py-2 text-primary">{t("Open game")}</Link> : <button data-search-result type="button" onClick={() => select(game.id)} disabled={disabled || pending || loading} aria-label={`${t(game.catalogSlug ? "Add" : "Import")} ${game.title}${game.year ? ` (${game.year})` : ""}`} className="w-full sm:w-auto shrink-0 rounded px-3 py-2 bg-surface-container-high text-primary text-label-md disabled:opacity-40">{t(game.catalogSlug ? "Add" : "Import")}</button>}
    </li>)}</ul>
  </div>;
}
