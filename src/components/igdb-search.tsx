"use client";
import { useMessages } from "@/components/site-preferences";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { searchIgdb, importIgdb } from "@/app/actions/catalog";
import { catalogQuery, type IgdbMatch } from "@/lib/catalog-input";
import type { Game } from "@/types/domain";

export function IgdbSearch({ query, mode = "browse", onImported, onBusyChange, disabled = false }: { query: string; mode?: "browse" | "log"; onImported?: (game: Game) => void; onBusyChange?: (busy: boolean) => void; disabled?: boolean }) {
  const t = useMessages();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ query: string; games: IgdbMatch[]; message: string }>();
  const [importMessage, setImportMessage] = useState("");
  const current = query.trim();
  // Results are tied to the submitted query, so edits/in-flight responses cannot
  // display candidates for an earlier title or enable an accidental import.
  const visible = result?.query === current ? result : undefined;
  function search() {
    setImportMessage("");
    onBusyChange?.(true);
    startTransition(async () => {
      try {
        const response = await searchIgdb(query);
        setResult({ query: current, games: response.games, message: response.message });
      } catch { setResult({ query: current, games: [], message: "IGDB search is unavailable. Please retry." }); }
      finally { onBusyChange?.(false); }
    });
  }
  function select(id: number) {
    setImportMessage("");
    onBusyChange?.(true);
    startTransition(async () => {
      try {
        const response = await importIgdb(id);
        setImportMessage(response.message);
        if (response.ok && response.game) {
          if (onImported) onImported(response.game);
          else router.push(mode === "log" ? `/log?game=${encodeURIComponent(response.game.slug)}` : `/game/${encodeURIComponent(response.game.slug)}`);
          router.refresh();
        }
      } catch { setImportMessage("Import is unavailable. Please retry; existing games will be reused."); }
      finally { onBusyChange?.(false); }
    });
  }
  return <section aria-label={t("Search IGDB")} className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="min-w-0 flex-1 text-on-surface-variant font-body-sm text-body-sm">{t("Find games beyond the saved catalog. Import adds shared game metadata; personal entries are saved separately.")}</p>
      <button data-igdb-search type="button" disabled={disabled || pending || !catalogQuery(query)} onClick={search} className="shrink-0 px-3 py-2 rounded bg-primary-container text-on-primary-container font-label-md text-label-md disabled:opacity-40">{pending ? t("Working…") : t("Search IGDB")}</button>
    </div>
    <p role="status" className="font-body-sm text-body-sm text-on-surface-variant">{t(importMessage || (pending ? "Contacting IGDB…" : visible?.message ?? "Enter at least two characters, then search IGDB."))}</p>
    <ul className="space-y-2">{visible?.games.map((game) => <li key={game.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 rounded-lg bg-surface-container p-3">
      {game.cover ? <img src={game.cover} alt={""} className="shrink-0 w-12 h-16 rounded object-cover" /> : <span className="shrink-0 w-12 h-16 rounded bg-surface-container-high flex items-center justify-center text-center text-[10px]">{t("No cover")}</span>}
      <div className="flex-1 min-w-0 space-y-1"><h3 className="break-words font-headline-md text-headline-md">{game.title}</h3><p className="break-words text-on-surface-variant font-body-sm text-body-sm">{game.year ?? t("Release unknown")}{game.type ? t(` · ${game.type}`) : ""}</p><p className="break-words text-on-surface-variant font-label-sm text-label-sm">{game.platforms.join(" · ") || t("Platforms unknown")}</p></div>
      <button data-search-result type="button" onClick={() => select(game.id)} disabled={disabled || pending} aria-label={t(`Import ${game.title}${game.year ? ` (${game.year})` : ""}`)} className="w-full sm:w-auto shrink-0 rounded px-3 py-2 bg-surface-container-high text-primary font-label-md text-label-md disabled:opacity-40">{onImported ? t("Import & add") : mode === "log" ? t("Import & log") : t("Import & view")}</button>
    </li>)}</ul>
    <a className="inline-flex items-center font-label-sm text-label-sm text-primary" href="https://www.igdb.com/" target="_blank" rel="noopener noreferrer">{t("Game data and images from IGDB ↗")}</a>
  </section>;
}
