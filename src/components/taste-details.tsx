"use client";
import { useState } from "react";
import { useMessages } from "@/components/site-preferences";
import { tasteStats } from "@/lib/taste";
import { playedPlatformLabels } from "@/lib/played-platforms";
import type { Game } from "@/types/domain";
export function TasteDetails({ games }: { games: Game[] }) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const t = useMessages(),
    stats = tasteStats(games);
  return (
    <div className="space-y-10">
      {[
        { label: "Genre statistics", groups: stats.genres },
        { label: "Studio statistics", groups: stats.studios },
        { label: "Publisher statistics", groups: stats.publishers },
      ].map(({ label, groups }) => (
        <section key={label} className="space-y-4">
          <h2 className="font-headline-lg text-headline-lg">{t(label)}</h2>
          {groups.some(group => expanded.includes(label) || group.count >= 5) ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-md text-body-md leading-relaxed">
                <caption className="sr-only">{t(label)}</caption>
                <thead>
                  <tr>
                    {[
                      "Name",
                      "Games rated",
                      "Average score",
                      "Above/below your average",
                    ].map((label) => (
                      <th key={label} scope="col" className="p-3 text-body-sm font-medium text-on-surface-variant">
                        {t(label)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groups.filter(group => expanded.includes(label) || group.count >= 5).map((group) => (
                    <tr
                      key={group.name}
                      className="border-t border-outline-variant/20"
                    >
                      <th
                        translate="no"
                        scope="row"
                        className="p-3 font-semibold text-on-surface"
                      >
                        {group.name}
                      </th>
                      <td className="p-3 font-medium tabular-nums">{group.count}</td>
                      <td className="p-3 font-bold tabular-nums text-primary">{group.average}</td>
                      <td className="p-3 font-medium tabular-nums">
                        {group.delta > 0 ? "+" : ""}
                        {group.delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-on-surface-variant">
              {t(groups.length ? "No groups with at least 5 rated games yet." : "No rated games with this metadata yet.")}
            </p>
          )}
          {!expanded.includes(label) && groups.some(group => group.count < 5) && (
            <button
              type="button"
              className="min-h-11 rounded-xl bg-surface-container-high px-5 py-3 text-on-surface hover:bg-surface-container-highest"
              onClick={() => setExpanded(current => [...current, label])}
              aria-label={`${t("Load more")} — ${t(label)}`}
            >
              {t("Load more")}
            </button>
          )}
        </section>
      ))}
      <section className="space-y-4">
        <h2 className="font-headline-lg text-headline-lg">
          {t("Rating behavior")}
        </h2>
        <dl className="grid grid-cols-2 gap-5">
          {[
            {
              label: "Games scored 90+",
              value: `${stats.highScores} (${stats.rated ? ((stats.highScores / stats.rated) * 100).toFixed(1) : "0"}%)`,
            },
            {
              label: "Completion rate",
              value:
                stats.completionRate === null
                  ? "—"
                  : `${stats.completionRate}%`,
            },
            { label: "Shelved games", value: stats.shelved },
            { label: "Currently playing", value: stats.active },
            { label: "Paused", value: stats.paused },
            { label: "Stopped playing", value: stats.stopped },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-on-surface-variant">{t(label)}</dt>
              <dd className="text-primary text-headline-lg font-headline-lg">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-body-sm text-on-surface-variant">
          {t(
            "Completion rate is completed entries divided by all logged entries, including backlog. Shelved does not necessarily mean dropped.",
          )}
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="font-headline-lg text-headline-lg">
          {t("Release eras")}
        </h2>
        <ul className="space-y-4">
          {stats.eras.map(([era, count]) => {
            const percent = count / (stats.logged - stats.unknownYears) * 100;
            return <li key={era} className="space-y-2">
              <div className="flex justify-between gap-4">
                <span>{era}</span>
                <span>{count} ({percent.toFixed(1)}%)</span>
              </div>
              <div aria-hidden="true" className="h-2 rounded bg-surface-container">
                <div className="h-full rounded bg-primary" style={{ width: `${percent}%` }} />
              </div>
            </li>;
          })}
        </ul>
        {!stats.eras.length && <p>{t("No known release years yet.")}</p>}
      </section>
      <section className="space-y-4">
        <h2 className="font-headline-lg text-headline-lg">
          {t("Platforms played")}
        </h2>
        {stats.platforms.map(([platform, count]) => (
          <div key={platform} className="flex justify-between gap-4">
            <span>
              {
                t(playedPlatformLabels[
                  platform as keyof typeof playedPlatformLabels
                ])
              }
            </span>
            <span>{count}</span>
          </div>
        ))}
        {!stats.platforms.length && (
          <p className="text-on-surface-variant">
            {t("No played platforms saved yet.")}
          </p>
        )}
      </section>
    </div>
  );
}
