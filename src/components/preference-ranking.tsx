"use client";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePortfolio } from "@/components/portfolio-provider";
import { useMessages } from "@/components/site-preferences";
import { saveRanking } from "@/app/actions/ranking";
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
  const [revision, setRevision] = useState(ranking?.revision ?? null);
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
  function move(slug: string, position: number) {
    if (!canEdit || pending || !Number.isInteger(position) || position < 0 || position >= order.length) return;
    setOrder(current => {
      if (!current.includes(slug)) return current;
      const next = current.filter(value => value !== slug);
      next.splice(position, 0, slug);
      return next;
    });
    setMessage("Save your ranking to keep these choices.");
  }
  function endDrag() { pointer.current = null; setDragged(null); setOver(null); }
  function targetAt(x: number, y: number) {
    return document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-ranking-game]")?.dataset.rankingGame;
  }
  function prefer(winner: string, loser: string) {
    setOrder((current) => {
      const next = current.filter((slug) => slug !== winner);
      next.splice(next.indexOf(loser), 0, winner);
      return next;
    });
    setPair((current) => current + 1);
    setMessage("Save your ranking to keep these choices.");
  }
  function save() {
    startTransition(async () => {
      const result = await saveRanking(order, revision);
      setMessage(result.message);
      if (result.ok && result.revision) setRevision(result.revision);
    });
  }
  return (
    <section className="space-y-6">
      <h2 className="font-headline-xl text-headline-xl">
        {t("Personal ranking")}
      </h2>
      {canEdit && order.length > 0 && <p className="text-body-sm text-on-surface-variant">{t("Drag games or edit their position. Save your ranking to keep the order.")}</p>}
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
      <ol className="space-y-3">
        {(canEdit ? order : savedOrder).map((slug, index) => {
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
      {canEdit && order.length > 0 && (
        <button className={button} disabled={pending} onClick={save}>
          {t(pending ? "Saving…" : "Save personal ranking")}
        </button>
      )}
      <p role="status" className="text-primary">
        {t(message)}
      </p>
    </section>
  );
}
