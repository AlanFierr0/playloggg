"use client";
import { useState, useTransition } from "react";
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
  const [pending, startTransition] = useTransition();
  const bySlug = new Map(logged.map((game) => [game.slug, game]));
  const canEdit = Boolean(access?.canEdit);
  const left = order.length > 1 ? order[pair % order.length] : null;
  const right = order.length > 1 ? order[(pair + 1) % order.length] : null;
  function move(index: number, direction: number) {
    setOrder((current) => {
      const next = [...current];
      [next[index], next[index + direction]] = [
        next[index + direction],
        next[index],
      ];
      return next;
    });
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
              className="flex flex-wrap items-center gap-3 rounded bg-surface-container-low p-3"
            >
              <span className="text-primary">#{index + 1}</span>
              <img
                src={game.cover}
                alt=""
                loading="lazy"
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
                <div className="flex gap-2">
                  <button
                    className={button}
                    aria-label={t(`Move ${game.title} up`)}
                    disabled={pending || index === 0}
                    onClick={() => move(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    className={button}
                    aria-label={t(`Move ${game.title} down`)}
                    disabled={pending || index === order.length - 1}
                    onClick={() => move(index, 1)}
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
