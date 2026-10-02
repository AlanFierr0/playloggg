"use client";
import Link from "next/link";
import { useMessages } from "@/components/site-preferences";
import { tasteStats } from "@/lib/taste";
import type { Game } from "@/types/domain";
export function TasteSummary({ games, href }: { games: Game[]; href: string }) {
  const t = useMessages(),
    stats = tasteStats(games);
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-headline-lg text-headline-lg">
          {t("Taste Fingerprint")}
        </h2>
        <Link
          href={href}
          className="inline-flex min-h-11 items-center text-primary"
        >
          {t("View stats")}
        </Link>
      </div>
      <p className="text-body-sm text-on-surface-variant">
        {t(
          "Your highest-rated genres and studios, based on at least 3 scored games in each group.",
        )}
      </p>
      <div className="grid sm:grid-cols-2 gap-6">
        {[
          { label: "Top-rated genres", groups: stats.preferredGenres },
          { label: "Top-rated studios", groups: stats.preferredStudios },
        ].map(({ label, groups }) => (
          <div key={label} className="space-y-3">
            <h3 className="font-headline-md text-headline-md">{t(label)}</h3>
            {groups.length ? (
              groups.slice(0, 3).map((group) => (
                <div key={group.name} className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                  <span translate="no" className="min-w-0 break-words">
                    {group.name}
                  </span>
                  <span className="shrink-0 text-primary">
                    {group.average} / 100{" "}
                    <span className="text-on-surface-variant">
                      · {group.count} {t("Games")}
                    </span>
                  </span>
                </div>
              ))
            ) : (
              <p className="text-on-surface-variant">
                {t("Not enough rated games yet.")}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
