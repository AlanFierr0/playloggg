"use client";
import { useMessages } from "@/components/site-preferences";
import { tasteStats } from "@/lib/taste";
import { playedPlatformLabels } from "@/lib/played-platforms";
import type { Game } from "@/types/domain";
export function TasteDetails({ games }: { games: Game[] }) {
  const t = useMessages(),
    stats = tasteStats(games);
  return (
    <div className="space-y-10">
      <p className="text-on-surface-variant text-body-sm">
        {t(
          "Group averages use scored entries only. Multi-genre games count once in each genre. Unknown metadata is excluded. Preferences need at least 3 scored games per group.",
        )}
      </p>
      {[
        { label: "Genre statistics", groups: stats.genres },
        { label: "Studio statistics", groups: stats.studios },
        { label: "Publisher statistics", groups: stats.publishers },
      ].map(({ label, groups }) => (
        <section key={label} className="space-y-4">
          <h2 className="font-headline-lg text-headline-lg">{t(label)}</h2>
          {groups.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <caption className="sr-only">{t(label)}</caption>
                <thead>
                  <tr>
                    {[
                      "Name",
                      "Games rated",
                      "Average score",
                      "Above/below your average",
                    ].map((label) => (
                      <th key={label} scope="col" className="p-3">
                        {t(label)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr
                      key={group.name}
                      className="border-t border-outline-variant/20"
                    >
                      <th
                        translate="no"
                        scope="row"
                        className="p-3 font-normal"
                      >
                        {group.name}
                      </th>
                      <td className="p-3">{group.count}</td>
                      <td className="p-3 text-primary">{group.average}</td>
                      <td className="p-3">
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
              {t("No rated games with this metadata yet.")}
            </p>
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
        <p className="text-body-sm text-on-surface-variant">
          {t("Release years describe your games, not when you played them.")}
        </p>
        {stats.eras.map(([era, count]) => (
          <div key={era} className="flex justify-between gap-4">
            <span>{era}</span>
            <span>
              {count} (
              {((count / (stats.logged - stats.unknownYears)) * 100).toFixed(1)}
              %)
            </span>
          </div>
        ))}
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
