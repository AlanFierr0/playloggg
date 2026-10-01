"use client";
import Link from "next/link";
import { useMessages } from "@/components/site-preferences";
import { usePortfolio } from "@/components/portfolio-provider";
import { ProfileNavigation } from "@/components/profile-navigation";
import { averageScore, loggedGames, ratedGames } from "@/lib/portfolio-view";

export function ProfileDetailsScreen({ section }: { section: "reviews" | "stats" }) {
  const t = useMessages();
  const { games, publicBase } = usePortfolio();
  const rated = ratedGames(games);
  const entries = loggedGames(games);
  const reviews = entries.filter(game => game.review?.trim()).sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "") || a.slug.localeCompare(b.slug));
  const bands = [[0, 49], [50, 59], [60, 69], [70, 79], [80, 89], [90, 100]];
  return <section className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-8">
    {!publicBase && <ProfileNavigation />}<h1 className="font-headline-xl text-headline-xl">{t(section === "reviews" ? "Reviews" : "Stats")}</h1>
    {section === "reviews" ? <div className="max-w-4xl space-y-8">{reviews.map(game => <article key={game.slug} className="flex items-start gap-4 sm:gap-6"><Link href={publicBase ? `${publicBase}/game/${game.slug}` : `/game/${game.slug}`} className="shrink-0 w-16 sm:w-24"><img src={game.cover} alt={game.title} loading="lazy" className="w-full aspect-[2/3] rounded object-cover" /></Link><div className="min-w-0 space-y-3"><h2 translate="no" className="font-headline-lg text-headline-lg">{game.title}</h2><p className="text-primary">{t("Score")}: {game.score ?? t("Unrated")}</p><p translate="no" className="whitespace-pre-wrap break-words text-on-surface-variant">{game.review}</p></div></article>)}{!reviews.length && <p className="text-on-surface-variant">{t("No reviews yet.")}</p>}</div> : <div className="max-w-3xl space-y-8">
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-5">{[[t("Games rated"), rated.length], [t("Average score"), averageScore(rated)], [t("Completed games"), entries.filter(game => game.status === "completed").length]].map(([label, value]) => <div key={label}><dt className="text-on-surface-variant">{label}</dt><dd className="text-primary font-headline-xl text-headline-xl">{value}</dd></div>)}</dl>
      <section className="space-y-4"><h2 className="font-headline-lg text-headline-lg">{t("Rating distribution")}</h2><p className="text-on-surface-variant">{t("Only scored games are included. Zero is a real score.")}</p><ul className="space-y-4">{bands.map(([low, high]) => { const count = rated.filter(game => game.score! >= low && game.score! <= high).length; const percent = rated.length ? count / rated.length * 100 : 0; return <li key={low} className="space-y-2"><div className="flex justify-between gap-4"><span>{low}–{high}</span><span>{count} ({percent.toFixed(1)}%)</span></div><div aria-hidden="true" className="h-2 rounded bg-surface-container"><div className="h-full rounded bg-primary" style={{ width: `${percent}%` }} /></div></li>; })}</ul></section>
    </div>}
  </section>;
}
