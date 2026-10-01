"use client";
import Link from "next/link";
import { useMessages } from "@/components/site-preferences";
import { usePortfolio } from "@/components/portfolio-provider";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ProfileNavigation } from "@/components/profile-navigation";
import { averageScore, ratedGames, loggedGames } from "@/lib/portfolio-view";
import type { Game } from "@/types/domain";

export function ProfileOverviewScreen() {
  const t = useMessages();
  const { profile, games, favorites = [], lists = [], access, publicBase } = usePortfolio();
  const base = publicBase ?? "/profile";
  const rated = ratedGames(games);
  const entries = loggedGames(games);
  const bySlug = new Map(games.map(game => [game.slug, game]));
  const featured = favorites.filter(f => f.featuredSlot !== null).sort((a, b) => a.featuredSlot! - b.featuredSlot!);
  const recent = entries.filter(g => g.updatedAt && Number.isFinite(Date.parse(g.updatedAt))).sort((a, b) => b.updatedAt!.localeCompare(a.updatedAt!) || a.slug.localeCompare(b.slug)).slice(0, 6);
  const reviews = entries.filter(g => g.review?.trim()).sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "") || a.slug.localeCompare(b.slug)).slice(0, 3);
  const gameHref = (game: Game) => publicBase && game.logged ? `${base}/game/${game.slug}` : `/game/${game.slug}`;
  return <section className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 space-y-10">
    <header className="space-y-6">
      <div className="flex items-start gap-4 sm:gap-6">
        <ProfileAvatar src={profile.avatarUrl} name={profile.displayName} className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl text-headline-xl" />
        <div className="min-w-0 space-y-2">
          <p className="text-label-sm font-label-sm uppercase tracking-widest text-primary">{profile.isSample ? t("Sample profile") : profile.isPublic ? t("Public profile") : t("Private profile")}</p>
          <h1 translate="no" className="font-display-lg text-display-lg sm:text-[56px] leading-tight break-words">{profile.displayName}</h1>
          <p translate="no" className="text-on-surface-variant break-words">@{profile.handle}</p>
        </div>
      </div>
      {profile.bio && <p translate="no" className="max-w-3xl text-body-lg text-on-surface-variant whitespace-pre-wrap break-words">{profile.bio}</p>}
      {(profile.location || profile.platformPreference) && <div className="flex flex-wrap gap-4 text-body-sm text-on-surface-variant">{profile.location && <p>{t("Location")}: <span translate="no">{profile.location}</span></p>}{profile.platformPreference && <p>{t("Platform preference")}: <span translate="no">{profile.platformPreference}</span></p>}</div>}
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-5 max-w-3xl">{[[t("Games rated"), rated.length], [t("Completed games"), entries.filter(g => g.status === "completed").length], [t("Average score"), averageScore(rated)], [t("Favorites"), favorites.length]].map(([label, value]) => <div key={label}><dt className="text-body-sm text-on-surface-variant">{label}</dt><dd className="font-headline-xl text-headline-xl text-primary">{value}</dd></div>)}</dl>
      {!publicBase && access?.canEdit && <div className="flex flex-wrap gap-5 text-primary font-label-md"><Link className="inline-flex min-h-11 items-center" href="/settings">{t("Edit profile")}</Link><Link className="inline-flex min-h-11 items-center" href="/profile/favorites">{t("Manage favorites")}</Link>{profile.isPublic && <Link className="inline-flex min-h-11 items-center" href={`/u/${profile.handle}`}>{t("Open public profile")}</Link>}</div>}
      {!publicBase && <ProfileNavigation />}
    </header>
    <section className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-headline-xl text-headline-xl">{t("Featured favorites")}</h2><Link className="inline-flex min-h-11 items-center text-primary" href={`${base}/favorites`}>{t("All favorites")}</Link></div>
      <p className="text-on-surface-variant text-body-sm">{t("Your favorites express what matters to you, independently of scores and tiers.")}</p>
      {featured.length ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">{featured.map(f => { const game = bySlug.get(f.slug); return game ? <Link key={f.slug} href={gameHref(game)} className="group min-w-0"><img src={game.cover} alt="" className="w-full aspect-[2/3] object-cover rounded-lg shadow-lg" /><p translate="no" className="mt-3 font-headline-md text-headline-md break-words group-hover:text-primary">{game.title}</p><p className="text-primary font-label-md">#{f.featuredSlot}</p></Link> : null; })}</div> : <p className="text-on-surface-variant">{t("No featured favorites yet.")}</p>}
    </section>
    <section className="space-y-5"><h2 className="font-headline-lg text-headline-lg">{t("Recently updated entries")}</h2><p className="text-body-sm text-on-surface-variant">{t("Latest saved entry updates, including rating, review or playback edits.")}</p>
      {recent.length ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">{recent.map(game => <Link href={gameHref(game)} key={game.slug} className="min-w-0"><img loading="lazy" src={game.cover} alt="" className="w-full aspect-[2/3] object-cover rounded" /><h3 translate="no" className="mt-2 font-headline-md text-headline-md break-words">{game.title}</h3><p className="text-primary text-body-sm">{t("Score")}: {game.score ?? t("Unrated")}</p><time className="text-body-sm text-on-surface-variant" dateTime={game.updatedAt}>{game.updatedAt!.slice(0, 10)}</time></Link>)}</div> : <p className="text-on-surface-variant">{t("No dated entry updates yet.")}</p>}
    </section>
    <div className="grid lg:grid-cols-2 gap-10">
      <section className="space-y-5"><h2 className="font-headline-lg text-headline-lg">{t("Reviews")}</h2>{reviews.length ? reviews.map(game => <article key={game.slug} className="space-y-2"><Link href={gameHref(game)} translate="no" className="text-primary font-headline-md text-headline-md">{game.title}</Link><p translate="no" className="text-on-surface-variant break-words whitespace-pre-wrap line-clamp-3">{game.review}</p></article>) : <p className="text-on-surface-variant">{t("No reviews yet.")}</p>}<Link className="inline-flex min-h-11 items-center text-primary" href={`${base}/reviews`}>{t("All reviews")}</Link></section>
      <section className="space-y-5"><h2 className="font-headline-lg text-headline-lg">{t("Lists")}</h2>{lists.length ? lists.slice(0, 3).map(list => <Link key={list.id} href={`${publicBase ?? ""}/lists/${list.id}`} translate="no" className="block font-headline-md text-headline-md text-primary break-words">{list.name}</Link>) : <p className="text-on-surface-variant">{t("No curated lists yet.")}</p>}<Link href={`${publicBase ?? ""}/lists`} className="inline-flex min-h-11 items-center text-primary">{t("View lists")}</Link></section>
    </div>
  </section>;
}
