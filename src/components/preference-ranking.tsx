"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePortfolio } from "@/components/portfolio-provider";
import { useMessages } from "@/components/site-preferences";
import { saveRanking } from "@/app/actions/ranking";
import { readRankingDraft } from "@/lib/ranking-draft";
import { rankingOrder } from "@/lib/ranking-order";
import { loggedGames } from "@/lib/portfolio-view";
import { parseHours } from "@/lib/rating-input";
import { playedPlatformLabels } from "@/lib/played-platforms";
import { tierColors } from "@/components/rating-controls";
import { tierLabels } from "@/lib/tier-labels";
import { playbackLabels } from "@/lib/playback-status";
const button =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-surface-container px-3 py-2 text-primary hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40";
export function PreferenceRanking() {
  const t = useMessages(),
    { games, ranking, access, publicBase, profile } = usePortfolio();
  const logged = loggedGames(games);
  const savedOrder =
    ranking?.slugs.filter((slug) =>
      logged.some((game) => game.slug === slug),
    ) ?? [];
  const [manual, setManual] = useState<Record<string, number>>(ranking?.manualPositions ?? Object.fromEntries(savedOrder.map((slug, index) => [slug, index])));
  const order = rankingOrder(games, manual);
  const revision = useRef(ranking?.revision ?? null);
  const saving = useRef(false);
  const latest = useRef(manual);
  const queued = useRef<Record<string, number> | null>(null);
  const mounted = useRef(true);
  const [ready, setReady] = useState(false);
  const [conflictRevision, setConflictRevision] = useState<number | null | undefined>(undefined);
  const [storageWarning, setStorageWarning] = useState(false);
  const initialRanking = useRef({games, ranking});
  const draftKey = `playlogg-ranking-draft:${profile.id}`;
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState(""), [platform, setPlatform] = useState("");
  const [minimum, setMinimum] = useState(""), [maximum, setMaximum] = useState("");
  const [message, setMessage] = useState("");
  const [pair, setPair] = useState(0);
  const [dragged, setDragged] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const pointerMoved = useRef(false);
  const pointer = useRef<{ slug: string; x: number; y: number; moved: boolean } | null>(null);
  const [pending, startTransition] = useTransition();
  const bySlug = new Map(logged.map((game) => [game.slug, game]));
  const canEdit = Boolean(access?.canEdit);
  useEffect(() => {
    mounted.current=true;
    if (canEdit) {
      try {
        const draft=readRankingDraft(sessionStorage.getItem(draftKey));
        if(draft) queueMicrotask(()=>{
          if(!mounted.current)return;
          const restored=Object.fromEntries(Object.entries(draft.manual).filter(([slug])=>initialRanking.current.games.some(game=>game.logged&&game.slug===slug)).map(([slug,position])=>[slug,Math.min(position,loggedGames(initialRanking.current.games).length-1)]));
          latest.current=restored;setManual(restored);revision.current=draft.revision;
          setFailed(true);setMessage("Unsaved ranking restored. Review it before retrying.");
          if(draft.revision !== (initialRanking.current.ranking?.revision??null))setConflictRevision(initialRanking.current.ranking?.revision??null);
        });
      } catch { queueMicrotask(()=>setStorageWarning(true)); }
    }
    queueMicrotask(()=>{if(mounted.current)setReady(true);});
    return ()=>{mounted.current=false;};
  }, [draftKey, canEdit]); // Restore once per owned profile, not after each save refresh.
  function checkpoint(overrides:Record<string,number>) {
    try {sessionStorage.setItem(draftKey,JSON.stringify({version:1,revision:revision.current,manual:overrides}));}
    catch {setStorageWarning(true);}
  }
  const left = order.length > 1 ? order[pair % order.length] : null;
  const right = order.length > 1 ? order[(pair + 1) % order.length] : null;
  const minHours = parseHours(minimum), maxHours = parseHours(maximum);
  const validBounds = minHours !== undefined && maxHours !== undefined &&
    (minHours === null || maxHours === null || minHours <= maxHours);
  const visible = order.filter(slug => {
    const game = bySlug.get(slug);
    return game && validBounds && game.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) &&
      (!platform || (platform === "unset" ? !game.platform : game.platform === platform)) &&
      (minHours === null || (game.hoursPlayed != null && game.hoursPlayed >= minHours)) &&
      (maxHours === null || (game.hoursPlayed != null && game.hoursPlayed <= maxHours));
  });
  function move(slug: string, position: number) {
    const currentOrder=rankingOrder(games,latest.current);
    if (!canEdit || !ready || !currentOrder.includes(slug) || !Number.isInteger(position) || position < 0 || position >= order.length || currentOrder.indexOf(slug) === position) return;
    const next = rankingOrder(games,latest.current).filter(value => value !== slug);
    next.splice(position, 0, slug);
    const overrides = Object.fromEntries(Object.keys(latest.current).map(key => [key, next.indexOf(key)]).filter(([, index]) => Number(index) >= 0));
    overrides[slug] = position;
    latest.current=overrides;setManual(overrides);
    save(overrides);
  }
  function endDrag() { pointer.current = null; setDragged(null); setOver(null); }
  function targetAt(x: number, y: number) {
    return document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-ranking-game]")?.dataset.rankingGame;
  }
  function prefer(winner: string, loser: string) {
    if (!ready) return;
    const next = rankingOrder(games,latest.current).filter(slug => slug !== winner);
    next.splice(next.indexOf(loser), 0, winner);
    setPair(current => current + 1);
    const overrides = Object.fromEntries(Object.keys(latest.current).map(key => [key, next.indexOf(key)]).filter(([, index]) => Number(index) >= 0));
    overrides[winner] = next.indexOf(winner);
    latest.current=overrides;setManual(overrides);
    save(overrides);
  }
  function save(overrides = latest.current, retryConflict = false) {
    checkpoint(overrides);
    queued.current=overrides;
    if(saving.current || (conflictRevision!==undefined && !retryConflict))return;
    saving.current=true;setFailed(false);setMessage("Saving…");
    startTransition(async()=>{
      try {
        while(queued.current && mounted.current){
          const next=queued.current;queued.current=null;
          const result=await saveRanking(rankingOrder(games,next),revision.current,next);
          if(!result.ok){
            queued.current=null;setFailed(true);setMessage(result.message);
            if(result.conflict)setConflictRevision(result.revision??null);
            checkpoint(latest.current);return;
          }
          revision.current=result.revision??revision.current;
          if(queued.current || latest.current!==next)checkpoint(latest.current);
          else {
            try {sessionStorage.removeItem(draftKey);}catch{setStorageWarning(true);}
            setMessage(result.message);
          }
        }
      }catch{
        queued.current=null;checkpoint(latest.current);setMessage("Ranking could not be saved. Your draft has been kept.");setFailed(true);
      }finally{saving.current=false;}
    });
  }
  return (
    <section className="space-y-5" aria-label={t("Personal ranking")}>
      <h2 className="font-headline-lg text-headline-lg font-semibold">
        {t("Personal ranking")}
      </h2>
      {canEdit && order.length > 0 && <p className="text-body-sm text-on-surface-variant">{t("Drag games or edit their position. Changes save automatically.")}</p>}
      {canEdit && left && right && (
        <details className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 sm:p-5">
          <summary className="min-h-6 cursor-pointer text-body-md font-semibold text-primary">
            {t("Which game do you prefer?")}
          </summary>
          <div className="mb-4 grid max-w-lg grid-cols-2 gap-4 pt-4">
            {[left, right].map((slug) => {
              const game = bySlug.get(slug)!;
              return (
                <button
                  key={slug}
                  className="text-left space-y-2 disabled:opacity-40"
                  disabled={!ready}
                  onClick={() => prefer(slug, slug === left ? right : left)}
                >
                  <img
                    src={game.cover}
                    alt=""
                    className="w-full max-w-44 aspect-[3/4] rounded-lg object-cover"
                  />
                  <span translate="no" className="block">
                    {game.title}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            className={button}
            disabled={!ready}
            onClick={() => setPair((current) => current + 1)}
          >
            {t("Skip")}
          </button>
        </details>
      )}
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 text-body-sm sm:grid-cols-2 lg:grid-cols-[2fr_1.5fr_1fr_1fr]">
        <label className="col-span-2 sm:col-span-1">{t("Search your games")}<input className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant/40 bg-surface p-3" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <label className="col-span-2 sm:col-span-1">{t("Platform")}<select className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant/40 bg-surface p-3" value={platform} onChange={event => setPlatform(event.target.value)}><option value="">{t("All platforms")}</option><option value="unset">{t("Unassigned")}</option>{Object.entries(playedPlatformLabels).map(([id, label]) => <option key={id} value={id}>{t(label)}</option>)}</select></label>
        <label>{t("Minimum hours")}<input className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant/40 bg-surface p-3" type="number" min="0" step="any" value={minimum} onChange={event => setMinimum(event.target.value)} /></label>
        <label>{t("Maximum hours")}<input className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant/40 bg-surface p-3" type="number" min="0" step="any" value={maximum} onChange={event => setMaximum(event.target.value)} /></label>
      </div>
      {!validBounds && <p role="alert">{t("Use nonnegative hours and a minimum no greater than the maximum.")}</p>}
      {validBounds && !visible.length && <p className="text-on-surface-variant">{t("No logged games match these filters.")}</p>}
      <ol className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low divide-y divide-outline-variant/30">
        {visible.map((slug) => {
          const index = order.indexOf(slug);
          const game = bySlug.get(slug);
          return game ? (
            <li
              key={slug}
              data-ranking-game={slug}
              draggable={canEdit && ready}
              onDragStart={event => { if (!canEdit || !ready) { event.preventDefault(); return; } setDragged(slug); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", slug); }}
              onDragOver={event => { if (canEdit && ready && dragged) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setOver(slug); } }}
              onDrop={event => { if (!canEdit || !ready || !dragged) return; event.preventDefault(); move(dragged, index); endDrag(); }}
              onDragEnd={endDrag}
              className={`relative grid grid-cols-[2.75rem_3rem_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-3 p-3 sm:grid-cols-[2.75rem_3.5rem_3.5rem_minmax(0,1fr)_auto_auto] sm:gap-x-4 sm:p-4 transition-colors motion-reduce:transition-none hover:bg-surface-container ${dragged === slug ? "opacity-50" : ""} ${over === slug && dragged !== slug ? "ring-2 ring-inset ring-primary bg-primary/10" : ""}`}
            >
              {canEdit ? <>
                <button type="button" disabled={!ready} aria-label={`${t("Drag to reorder")}: ${game.title}`} title={t("Drag to reorder")} className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary touch-none cursor-grab active:cursor-grabbing disabled:opacity-40"
                  onClick={event => { if (pointerMoved.current) { pointerMoved.current = false; return; } event.currentTarget.closest("li")?.querySelector("input")?.focus(); }}
                  onKeyDown={event => { if (event.key === "Escape") endDrag(); }}
                  onPointerDown={event => { if (!ready || event.button !== 0) return; event.preventDefault(); pointerMoved.current = false; event.currentTarget.setPointerCapture(event.pointerId); pointer.current = { slug, x: event.clientX, y: event.clientY, moved: false }; }}
                  onPointerMove={event => { const current = pointer.current; if (!current) return; current.moved ||= Math.hypot(event.clientX - current.x, event.clientY - current.y) > 6; if (!current.moved) return; pointerMoved.current = true; setDragged(current.slug); setOver(targetAt(event.clientX, event.clientY) ?? null); if (event.clientY < 80) window.scrollBy(0, -12); else if (event.clientY > innerHeight - 80) window.scrollBy(0, 12); }}
                  onPointerUp={event => { const current = pointer.current; const target = targetAt(event.clientX, event.clientY); endDrag(); if (current?.moved && target) move(current.slug, order.indexOf(target)); }}
                  onPointerCancel={endDrag} onLostPointerCapture={endDrag}>
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">drag_indicator</span>
                </button>
                <input key={`${slug}:${index}`} type="text" inputMode="numeric" aria-label={`${t("Position for")} ${game.title}`} title={t("Edit ranking position")} defaultValue={index + 1} disabled={!ready} maxLength={String(order.length).length} className="w-full min-h-11 rounded-lg border border-outline-variant/40 bg-surface px-1 text-center text-body-lg font-semibold text-primary tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40"
                  onFocus={event => event.currentTarget.select()}
                  onChange={event => { const value = event.currentTarget.value.replace(/\D/g, ""); event.currentTarget.value = value ? String(Math.max(1, Math.min(order.length, Number(value)))) : ""; }}
                  onBlur={event => { const position = Number(event.currentTarget.value); if (position >= 1 && position <= order.length) move(slug, position - 1); else event.currentTarget.value = String(index + 1); }}
                  onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); event.currentTarget.blur(); } if (event.key === "Escape") { event.currentTarget.value = String(index + 1); event.currentTarget.blur(); } }} />
              </> : <span className="col-span-2 text-center text-headline-md font-semibold tabular-nums text-primary">#{index + 1}</span>}
              <img
                src={game.cover}
                alt=""
                loading="lazy"
                draggable={false}
                className="hidden w-14 aspect-[3/4] rounded-lg object-cover sm:block"
              />
              <div className="min-w-0 space-y-2">
                <Link translate="no" className="block break-words text-body-md font-semibold hover:text-primary sm:text-body-lg" href={publicBase ? `${publicBase}/game/${slug}` : `/game/${slug}`}>{game.title}</Link>
                <div className="flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">
                  {game.tier && <span className={`rounded px-2 py-0.5 text-label-sm font-semibold ${tierColors[game.tier]}`}>{game.tier} · {t(tierLabels[game.tier])}</span>}
                  {game.status && <span>{t(playbackLabels[game.status])}</span>}
                </div>
              </div>
              <div className="text-right tabular-nums"><span className="text-body-lg font-semibold text-primary">{game.score ?? t("Unrated")}</span>{game.score !== null && <span className="hidden text-body-sm text-on-surface-variant sm:inline"> / 100</span>}</div>
              {canEdit && (
                <div className="col-start-3 col-end-5 flex justify-end gap-2 sm:col-start-6 sm:col-end-7 sm:row-start-1">
                  <button
                    className={button}
                    aria-label={t(`Move ${game.title} up`)}
                    disabled={!ready || index === 0}
                    onClick={() => move(slug, index - 1)}
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </button>
                  <button
                    className={button}
                    aria-label={t(`Move ${game.title} down`)}
                    disabled={!ready || index === order.length - 1}
                    onClick={() => move(slug, index + 1)}
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_downward</span>
                  </button>
                </div>
              )}
            </li>
          ) : null;
        })}
      </ol>
      {canEdit && failed && conflictRevision===undefined && (
        <button className={button} disabled={pending || !ready} onClick={() => save()}>
          {t("Retry saving ranking")}
        </button>
      )}
      {canEdit && conflictRevision!==undefined && <button className={button} disabled={pending} onClick={()=>{
        revision.current=conflictRevision;setConflictRevision(undefined);queued.current=null;
        // Explicitly applying the reviewed draft permits a save against the latest revision.
        save(latest.current, true);
      }}>{t("Keep my order and retry")}</button>}
      {canEdit && failed && <button className={button} disabled={pending} onClick={()=>{try{sessionStorage.removeItem(draftKey);window.location.reload();}catch{setMessage("Unsaved ranking could not be discarded. Browser storage is unavailable.");}}}>{t("Discard unsaved ranking")}</button>}
      {storageWarning && <p role="alert">{t("Browser storage is unavailable. Keep this page open until your ranking saves.")}</p>}
      <p role="status" aria-live="polite" className="min-h-5 text-body-sm text-primary">
        {t(message)}
      </p>
    </section>
  );
}
