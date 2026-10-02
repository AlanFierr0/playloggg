"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { usePortfolio } from "@/components/portfolio-provider";
import { useMessages } from "@/components/site-preferences";
import { FavoriteControls } from "@/components/favorite-controls";
import { saveRating } from "@/app/actions/ratings";
import { playbackLabels } from "@/lib/playback-status";
import type { Game, PlaybackStatus, Tier } from "@/types/domain";
type Draft = { score: string; tier: string; status: string; review: string };
const control = "w-full rounded bg-surface-container p-3";
export function QuickRating() {
  const t = useMessages(),
    { games, favorites = [] } = usePortfolio();
  const [query, setQuery] = useState("");
  const [slug, setSlug] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saved, setSaved] = useState<Record<string, Game>>({});
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const game = saved[slug] ?? games.find((game) => game.slug === slug);
  const draft = game
    ? (drafts[slug] ?? {
        score: game.score === null ? "" : String(game.score),
        tier: game.tier ?? "",
        status: game.status ?? "",
        review: game.review ?? "",
      })
    : null;
  const results = games
    .filter((game) =>
      game.title.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .slice(0, 30);
  function change(field: keyof Draft, value: string) {
    if (draft)
      setDrafts((current) => ({
        ...current,
        [slug]: { ...draft, [field]: value },
      }));
  }
  function save() {
    if (!game || !draft) return;
    const score = draft.score === "" ? null : Number(draft.score);
    if (
      score !== null &&
      (!Number.isInteger(score) || score < 0 || score > 100)
    ) {
      setMessage("Use a whole-number score from 0 to 100.");
      return;
    }
    if (
      !game.logged &&
      score === null &&
      !draft.status &&
      !draft.tier &&
      !draft.review.trim()
    ) {
      setMessage("Choose a score or status, or save a favorite separately.");
      return;
    }
    const input = {
      slug,
      score,
      tier: (draft.tier || null) as Tier | null,
      status: (draft.status || null) as PlaybackStatus | null,
      review: draft.review,
      platform: game.platform ?? null,
      hoursPlayed: game.hoursPlayed ?? null,
      completedOn: game.completedOn ?? null,
      tags: game.tags ?? [],
    };
    startTransition(async () => {
      try {
        const result = await saveRating(input);
        setMessage(result.message);
        if (result.ok) {
          setSaved((current) => ({
            ...current,
            [slug]: { ...game, ...input, logged: true },
          }));
        }
      } catch {
        setMessage(
          "Saving is unavailable right now. Your draft has been kept; please try again.",
        );
      }
    });
  }
  return (
    <section className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-6">
      <h1 className="font-headline-xl text-headline-xl">{t("Quick rating")}</h1>
      <p className="text-on-surface-variant">
        {t(
          "Find a game, save your score or status, and move straight to the next. Drafts stay here while you switch games.",
        )}
      </p>
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8">
        <div className="space-y-4">
          <label className="block space-y-2">
            <span>{t("Search titles")}</span>
            <input
              type="search"
              className={control}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              disabled={pending}
            />
          </label>
          <div className="max-h-[60dvh] overflow-y-auto scroll-region space-y-2">
            {results.map((game) => (
              <button
                key={game.slug}
                type="button"
                disabled={pending}
                aria-pressed={slug === game.slug}
                onClick={() => {
                  setSlug(game.slug);
                  setMessage("");
                }}
                className={`flex items-center gap-3 w-full text-left rounded p-2 ${slug === game.slug ? "bg-primary/10" : "hover:bg-surface-container"}`}
              >
                <img
                  src={game.cover}
                  alt=""
                  loading="lazy"
                  className="w-10 aspect-[3/4] rounded object-cover"
                />
                <span className="break-words">{game.title}</span>
              </button>
            ))}
          </div>
        </div>
        {game && draft ? (
          <div className="space-y-5">
            <h2 translate="no" className="font-headline-lg text-headline-lg">
              {game.title}
            </h2>
            <fieldset disabled={pending} className="space-y-5">
              <div className="grid sm:grid-cols-3 gap-4">
                <label className="space-y-2">
                  <span className="block">{t("Score")}</span>
                  <input
                    className={control}
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={draft.score}
                    onChange={(event) => change("score", event.target.value)}
                  />
                </label>
                <label className="space-y-2">
                  <span className="block">{t("Tier")}</span>
                  <select
                    aria-label={t("Tier")}
                    className={control}
                    value={draft.tier}
                    onChange={(event) => change("tier", event.target.value)}
                  >
                    <option value="">{t("Unassigned")}</option>
                    {["S", "A", "B", "C", "D", "F"].map((tier) => (
                      <option key={tier}>{tier}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="block">{t("Playback status")}</span>
                  <select
                    aria-label={t("Playback status")}
                    className={control}
                    value={draft.status}
                    onChange={(event) => change("status", event.target.value)}
                  >
                    <option value="">{t("Not set")}</option>
                    {Object.entries(playbackLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {t(label)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                {t(
                  "Score: how good is this game? Tier: how much does it mean to you? Favorites and ranking are separate.",
                )}
              </p>
              <details>
                <summary className="cursor-pointer text-primary">
                  {t("Optional review")}
                </summary>
                <label className="block mt-3">
                  <span className="sr-only">{t("Review")}</span>
                  <textarea
                    className={control}
                    rows={4}
                    maxLength={20000}
                    value={draft.review}
                    onChange={(event) => change("review", event.target.value)}
                  />
                </label>
              </details>
              <button
                type="button"
                className="rounded bg-primary px-6 py-3 text-on-primary disabled:opacity-50"
                onClick={save}
              >
                {t(pending ? "Saving…" : "Save entry")}
              </button>
              <Link
                href={`/log?game=${slug}`}
                className="inline-flex ml-4 py-3 text-primary"
              >
                {t("Full editor")}
              </Link>
            </fieldset>
            <p role="status" className="text-primary break-words">
              {t(message)}
            </p>
            <FavoriteControls
              key={slug}
              slug={slug}
              favorite={favorites.find((favorite) => favorite.slug === slug)}
            />
          </div>
        ) : (
          <p className="text-on-surface-variant">
            {t("Choose a game to start rating.")}
          </p>
        )}
      </div>
    </section>
  );
}
