"use client";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePortfolio } from "@/components/portfolio-provider";
import { useMessages } from "@/components/site-preferences";
import { saveRanking } from "@/app/actions/ranking";
import { parseHours } from "@/lib/rating-input";
import { playedPlatformLabels } from "@/lib/played-platforms";
const button =
  "inline-flex items-center justify-center rounded bg-surface-container px-4 py-3 text-primary disabled:opacity-40";
export function PreferenceRanking() {
  const t = useMessages(),
    { games, ranking, access, publicBase } = usePortfolio();
  const logged = games.filter((game) => game.logged);
  const savedOrder =
    ranking?.slugs.filter((slug) =>
      logged.some((game) => game.slug === slug),
    ) ?? [];
  const initial = [
    ...savedOrder,
    ...logged
      .filter((game) => !savedOrder.includes(game.slug))
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((game) => game.slug),
  ];
  const [order, setOrder] = useState(initial);
  const revision = useRef(ranking?.revision ?? null);
  const saving = useRef(false);
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
  const left = order.length > 1 ? order[pair % order.length] : null;
  const right = order.length > 1 ? order[(pair + 1) % order.length] : null;
  const minHours = parseHours(minimum), maxHours = parseHours(maximum);
  const validBounds = minHours !== undefined && maxHours !== undefined &&
    (minHours === null || maxHours === null || minHours <= maxHours);
  const visible = (canEdit ? order : savedOrder).filter(slug => {
    const game = bySlug.get(slug);
    return game && validBounds && game.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) &&
      (!platform || (platform === "unset" ? !game.platform : game.platform === platform)) &&
      (minHours === null || (game.hoursPlayed != null && game.hoursPlayed >= minHours)) &&
      (maxHours === null || (game.hoursPlayed != null && game.hoursPlayed <= maxHours));
  });
  function move(slug: string, position: number) {
    if (!canEdit || saving.current || !order.includes(slug) || !Number.isInteger(position) || position < 0 || position >= order.length || order.indexOf(slug) === position) return;
    const next = order.filter(value => value !== slug);
    next.splice(position, 0, slug);
    setOrder(next);
    save(next);
  }
  function endDrag() { pointer.current = null; setDragged(null); setOver(null); }
  function targetAt(x: number, y: number) {
    return document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-ranking-game]")?.dataset.rankingGame;
  }
  function prefer(winner: string, loser: string) {
    if (saving.current) return;
    const next = order.filter(slug => slug !== winner);
    next.splice(next.indexOf(loser), 0, winner);
    setOrder(next);
    setPair(current => current + 1);
    save(next);
  }
  function save(next: string[]) {
    if (saving.current) return;
    saving.current = true;
    setFailed(false);
    setMessage("Saving…");
    startTransition(async () => {
      try {
        const result = await saveRanking(next, revision.current);
        setMessage(result.message);
        setFailed(!result.ok);
        if (result.ok && result.revision) revision.current = result.revision;
      } catch {
        setMessage("Ranking could not be saved. Your draft has been kept.");
        setFailed(true);
      } finally {
        saving.current = false;
      }
    });
  }
  return (
    <section className="space-y-6">
      <h2 className="font-headline-xl text-headline-xl">
        {t("Personal ranking")}
      </h2>
      {canEdit && order.length > 0 && <p className="text-body-sm text-on-surface-variant">{t("Drag games or edit their position. Changes save automatically.")}</p>}
      {canEdit && left && right && (
        <details className="space-y-5">
          <summary className="cursor-pointer text-primary">
            {t("Which game do you prefer?")}
          </summary>
          <div className="grid grid-cols-2 gap-4 pt-4">
            {[left, right].map((slug) => {
              const game = bySlug.get(slug)!;
              return (
                <button
                  key={slug}
                  className="text-left space-y-2 disabled:opacity-40"
                  disabled={pending}
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
            disabled={pending}
            onClick={() => setPair((current) => current + 1)}
          >
            {t("Skip")}
          </button>
        </details>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label>{t("Search your games")}<input className="mt-2 min-h-11 w-full rounded-xl bg-surface-container p-3" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <label>{t("Platform")}<select className="mt-2 min-h-11 w-full rounded-xl bg-surface-container p-3" value={platform} onChange={event => setPlatform(event.target.value)}><option value="">{t("All platforms")}</option><option value="unset">{t("Unassigned")}</option>{Object.entries(playedPlatformLabels).map(([id, label]) => <option key={id} value={id}>{t(label)}</option>)}</select></label>
        <label>{t("Minimum hours")}<input className="mt-2 min-h-11 w-full rounded-xl bg-surface-container p-3" type="number" min="0" step="any" value={minimum} onChange={event => setMinimum(event.target.value)} /></label>
        <label>{t("Maximum hours")}<input className="mt-2 min-h-11 w-full rounded-xl bg-surface-container p-3" type="number" min="0" step="any" value={maximum} onChange={event => setMaximum(event.target.value)} /></label>
      </div>
      {!validBounds && <p role="alert">{t("Use nonnegative hours and a minimum no greater than the maximum.")}</p>}
      {validBounds && !visible.length && <p className="text-on-surface-variant">{t("No logged games match these filters.")}</p>}
      <ol className="space-y-3">
        {visible.map((slug) => {
          const index = (canEdit ? order : savedOrder).indexOf(slug);
          const game = bySlug.get(slug);
          return game ? (
            <li
              key={slug}
              data-ranking-game={slug}
              draggable={canEdit && !pending}
              onDragStart={event => { if (!canEdit || pending) { event.preventDefault(); return; } setDragged(slug); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", slug); }}
              onDragOver={event => { if (canEdit && !pending && dragged) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setOver(slug); } }}
              onDrop={event => { if (!canEdit || pending || !dragged) return; event.preventDefault(); move(dragged, index); endDrag(); }}
              onDragEnd={endDrag}
              className={`flex flex-wrap items-center gap-3 rounded bg-surface-container-low p-3 ${dragged === slug ? "opacity-50" : ""} ${over === slug && dragged !== slug ? "ring-2 ring-primary" : ""}`}
            >
              {canEdit ? <>
                <button type="button" disabled={pending} aria-label={`${t("Drag to reorder")}: ${game.title}`} title={t("Drag to reorder")} className="flex min-h-11 min-w-11 items-center justify-center rounded bg-surface-container text-on-surface-variant touch-none cursor-grab active:cursor-grabbing disabled:opacity-40"
                  onClick={event => { if (pointerMoved.current) { pointerMoved.current = false; return; } event.currentTarget.closest("li")?.querySelector("input")?.focus(); }}
                  onKeyDown={event => { if (event.key === "Escape") endDrag(); }}
                  onPointerDown={event => { if (pending || event.button !== 0) return; event.preventDefault(); pointerMoved.current = false; event.currentTarget.setPointerCapture(event.pointerId); pointer.current = { slug, x: event.clientX, y: event.clientY, moved: false }; }}
                  onPointerMove={event => { const current = pointer.current; if (!current) return; current.moved ||= Math.hypot(event.clientX - current.x, event.clientY - current.y) > 6; if (!current.moved) return; pointerMoved.current = true; setDragged(current.slug); setOver(targetAt(event.clientX, event.clientY) ?? null); if (event.clientY < 80) window.scrollBy(0, -12); else if (event.clientY > innerHeight - 80) window.scrollBy(0, 12); }}
                  onPointerUp={event => { const current = pointer.current; const target = targetAt(event.clientX, event.clientY); endDrag(); if (current?.moved && target) move(current.slug, order.indexOf(target)); }}
                  onPointerCancel={endDrag} onLostPointerCapture={endDrag}>
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">drag_indicator</span>
                </button>
                <input key={`${slug}:${index}`} type="text" inputMode="numeric" aria-label={`${t("Position for")} ${game.title}`} title={t("Edit ranking position")} defaultValue={index + 1} disabled={pending} maxLength={String(order.length).length} className="w-14 min-h-11 rounded border border-outline-variant/40 bg-surface-container px-2 text-center text-primary tabular-nums disabled:opacity-40"
                  onFocus={event => event.currentTarget.select()}
                  onChange={event => { const value = event.currentTarget.value.replace(/\D/g, ""); event.currentTarget.value = value ? String(Math.max(1, Math.min(order.length, Number(value)))) : ""; }}
                  onBlur={event => { const position = Number(event.currentTarget.value); if (position >= 1 && position <= order.length) move(slug, position - 1); else event.currentTarget.value = String(index + 1); }}
                  onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); event.currentTarget.blur(); } if (event.key === "Escape") { event.currentTarget.value = String(index + 1); event.currentTarget.blur(); } }} />
              </> : <span className="text-primary">#{index + 1}</span>}
              <img
                src={game.cover}
                alt=""
                loading="lazy"
                draggable={false}
                className="w-10 aspect-[3/4] rounded object-cover"
              />
              <Link
                translate="no"
                className="flex-1 min-w-0 break-words"
                href={
                  publicBase ? `${publicBase}/game/${slug}` : `/game/${slug}`
                }
              >
                {game.title}
              </Link>
              {canEdit && (
                <div className="flex w-full sm:w-auto justify-end gap-2">
                  <button
                    className={button}
                    aria-label={t(`Move ${game.title} up`)}
                    disabled={pending || index === 0}
                    onClick={() => move(slug, index - 1)}
                  >
                    ↑
                  </button>
                  <button
                    className={button}
                    aria-label={t(`Move ${game.title} down`)}
                    disabled={pending || index === order.length - 1}
                    onClick={() => move(slug, index + 1)}
                  >
                    ↓
                  </button>
                </div>
              )}
            </li>
          ) : null;
        })}
      </ol>
      {canEdit && failed && (
        <button className={button} disabled={pending} onClick={() => save(order)}>
          {t("Retry saving ranking")}
        </button>
      )}
      <p role="status" aria-live="polite" className="text-primary">
        {t(message)}
      </p>
    </section>
  );
}
