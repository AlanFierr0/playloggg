"use client";
import Link from "next/link";
import { useState } from "react";
import { ProfileNavigation } from "@/components/profile-navigation";
import { usePortfolio } from "@/components/portfolio-provider";
import { useMessages, useSitePreferences } from "@/components/site-preferences";
import { completionTimeline } from "@/lib/completion-timeline";

export function ProfileTimelineScreen() {
  const { games } = usePortfolio(), t = useMessages(), { locale } = useSitePreferences();
  const [year, setYear] = useState(""), [limit, setLimit] = useState(12);
  const timeline = completionTimeline(games);
  const years = [...new Set(timeline.months.map(group => group.month.slice(0, 4)))];
  const months = timeline.months.filter(group => !year || group.month.startsWith(year));
  const dated = months.flatMap(group => group.games);
  const recorded = dated.filter(game => game.hoursPlayed != null);
  const number = (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 2 });
  const monthFormat = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" });
  const dayFormat = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" });
  const date = (value: string, format: Intl.DateTimeFormat) => format.format(new Date(`${value}T00:00:00Z`));
  return <section className="site-container mx-auto w-full min-w-0 space-y-8 px-4 py-8 sm:px-6 lg:px-12">
    <ProfileNavigation />
    <header className="space-y-5 border-b border-outline-variant/30 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-2"><h1 className="font-headline-xl text-headline-xl">{t("Completion timeline")}</h1><p className="text-body-md text-on-surface-variant">{t("Your finished games, month by month.")}</p></div>
        {years.length > 0 && <label className="space-y-1 text-body-sm"><span className="block text-on-surface-variant">{t("Year")}</span><select aria-label={t("Year")} value={year} onChange={event => { setYear(event.target.value); setLimit(12); }} className="min-h-11 rounded-xl border border-outline-variant/40 bg-surface-container px-3"><option value="">{t("All years")}</option>{years.map(value => <option key={value} value={value}>{value}</option>)}</select></label>}
      </div>
      <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        <div><dt className="text-body-sm text-on-surface-variant">{t("Dated completions")}</dt><dd className="mt-1 text-headline-xl font-semibold tabular-nums text-primary">{dated.length}</dd></div>
        <div><dt className="text-body-sm text-on-surface-variant">{t("Recorded playtime")}</dt><dd className="mt-1 text-headline-xl font-semibold tabular-nums">{recorded.length ? number(recorded.reduce((sum, game) => sum + game.hoursPlayed!, 0)) : "—"}<span className="ml-1 text-body-sm font-normal text-on-surface-variant">{t("hrs")}</span><span className="block text-body-sm font-normal text-on-surface-variant">{recorded.length} / {dated.length} {t("Games with recorded hours")}</span></dd></div>
        <div><dt className="text-body-sm text-on-surface-variant">{t("Completion months")}</dt><dd className="mt-1 text-headline-xl font-semibold tabular-nums">{months.length}</dd></div>
      </dl>
      <p className="max-w-3xl text-body-sm text-on-surface-variant">{t("Playtime and scores are current values for games completed in each month, not a history of changes.")}</p>
    </header>
    {months.length ? <ol className="space-y-10 border-l border-outline-variant/40 pl-5 sm:pl-8">{months.slice(0, limit).map(group => <li key={group.month} className="relative" data-timeline-month={group.month}>
      <span aria-hidden="true" className="absolute -left-[26px] top-2 h-3 w-3 rounded-full bg-primary sm:-left-[38px]" />
      <section className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2"><h2 className="font-headline-lg text-headline-lg"><time dateTime={group.month}>{date(`${group.month}-01`, monthFormat)}</time></h2><div className="flex flex-wrap gap-2">{group.genres.map(genre => <span key={genre} translate="no" className="rounded-lg bg-surface-container-low px-2.5 py-1 text-body-sm text-on-surface-variant">{genre}</span>)}</div></div>
          <dl className="flex flex-wrap gap-x-5 gap-y-2 text-body-sm"><div><dt className="text-on-surface-variant">{t("Completed games")}</dt><dd className="font-semibold tabular-nums">{group.games.length}</dd></div><div><dt className="text-on-surface-variant">{t("Average score")}</dt><dd className="font-semibold tabular-nums text-primary">{group.average ?? "—"}</dd></div><div><dt className="text-on-surface-variant">{t("Recorded playtime")}</dt><dd className="font-semibold tabular-nums">{group.hours === null ? "—" : number(group.hours)} {t("hrs")}</dd></div></dl>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{group.games.map(game => <Link key={game.slug} href={`/game/${game.slug}`} className="group flex min-w-0 items-start gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-low p-3 transition-colors hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
          <img src={game.cover} alt="" loading="lazy" className="h-24 w-16 shrink-0 rounded-lg object-cover bg-surface-container" />
          <div className="min-w-0 space-y-2"><h3 translate="no" className="line-clamp-2 text-body-md font-semibold group-hover:text-primary">{game.title}</h3><time dateTime={game.completedOn!} className="block text-body-sm text-on-surface-variant">{date(game.completedOn!, dayFormat)}</time><p className="text-body-sm"><span className="font-semibold tabular-nums text-primary">{game.score === null ? t("Unrated") : `${game.score} / 100`}</span>{game.hoursPlayed != null && <span className="text-on-surface-variant"> · {number(game.hoursPlayed)} {t("hrs")}</span>}</p></div>
        </Link>)}</div>
      </section>
    </li>)}</ol> : <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6 sm:p-8 space-y-3"><h2 className="font-headline-lg text-headline-lg">{t("Your timeline starts with a completion date.")}</h2><p className="text-body-md text-on-surface-variant">{t("Mark a game completed and add its completion date to see it here.")}</p><Link href="/log" className="ui-action bg-primary text-on-primary">{t("Log a game")}</Link></div>}
    {months.length > limit && <button type="button" onClick={() => setLimit(value => value + 12)} className="ui-action bg-surface-container-high">{t("Load more")}</button>}
    {timeline.undated.length > 0 && <section className="space-y-4 border-t border-outline-variant/30 pt-6"><h2 className="font-headline-lg text-headline-lg">{t("Completed without a date")} <span className="text-on-surface-variant">({timeline.undated.length})</span></h2><p className="text-body-sm text-on-surface-variant">{t("Add a completion date to place these games on your timeline.")}</p><div className="flex flex-wrap gap-2">{timeline.undated.map(game => <Link key={game.slug} href={`/log?game=${encodeURIComponent(game.slug)}`} translate="no" className="inline-flex min-h-11 items-center rounded-xl border border-outline-variant/30 px-3 text-body-sm hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{game.title}</Link>)}</div></section>}
  </section>;
}
