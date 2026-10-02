"use client";
import Link from "next/link";
import { useMessages } from "@/components/site-preferences";
import { usePortfolio } from "@/components/portfolio-provider";
import {ShareCardControls} from "@/components/share-card-controls";
import { TasteSummary } from "@/components/taste-summary";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ProfileNavigation } from "@/components/profile-navigation";
import { averageScore, ratedGames, loggedGames } from "@/lib/portfolio-view";
import type { Game } from "@/types/domain";

export function ProfileOverviewScreen() {
  const t = useMessages();
  const { profile, games, favorites = [], access, publicBase } = usePortfolio();
  const base = publicBase ?? "/profile";
  const rated = ratedGames(games);
  const entries = loggedGames(games);
  const bySlug = new Map(games.map(game => [game.slug, game]));
  const featured = favorites.filter(f => f.featuredSlot !== null).sort((a, b) => a.featuredSlot! - b.featuredSlot!);
  const recent = entries.filter(g => g.updatedAt && Number.isFinite(Date.parse(g.updatedAt))).sort((a, b) => b.updatedAt!.localeCompare(a.updatedAt!) || a.slug.localeCompare(b.slug)).slice(0, 6);
  const gameHref = (game: Game) => publicBase && game.logged ? `${base}/game/${game.slug}` : `/game/${game.slug}`;
  const panel = "min-w-0 rounded-2xl bg-surface-container-low p-5 sm:p-7 space-y-5";
  const tools = [["Import from Steam", "/profile/import/steam"], ["Edit profile", "/settings"], ["Manage favorites", "/profile/favorites"], ["Year in Gaming", "/profile/wrapped"], ["Activity feed", "/profile/activity"], ["Following", "/profile/social"]];
  return <section className="site-container w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 space-y-6 sm:space-y-8">
    {!publicBase && <ProfileNavigation />}
    <header className="rounded-2xl bg-surface-container-low p-5 sm:p-8 space-y-8">
      <div className="grid xl:grid-cols-[minmax(0,1fr)_24rem] gap-8">
      <div className="min-w-0 space-y-5">
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
      </div>
      {!publicBase && access?.canEdit && <nav aria-label={t("Profile tools")} className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-3 self-start">{tools.map(([label, href]) => <Link key={href} className="flex min-h-12 items-center justify-center rounded-lg px-4 py-3 text-center text-body-sm font-medium bg-surface-container-high text-on-surface hover:bg-surface-container-highest" href={href}>{t(label)}</Link>)}{profile.isPublic && <Link className="flex min-h-12 items-center justify-center rounded-lg px-4 py-3 text-center text-primary bg-surface-container-high min-[400px]:col-span-2 sm:col-span-3 xl:col-span-2" href={`/u/${profile.handle}`}>{t("Open public profile")}</Link>}</nav>}
      </div>
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-5 border-t border-outline-variant/20 pt-6">{[[t("Games rated"), rated.length], [t("Completed games"), entries.filter(g => g.status === "completed").length], [t("Average score"), averageScore(rated)], [t("Favorites"), favorites.length]].map(([label, value]) => <div key={label} className="min-w-0 space-y-2"><dt className="text-body-sm text-on-surface-variant">{label}</dt><dd className="font-headline-xl text-headline-xl text-primary">{value}</dd></div>)}</dl>
    </header>
    <section className={panel}><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-headline-xl text-headline-xl">{t("Featured favorites")}</h2><Link className="inline-flex min-h-11 items-center text-primary" href={`${base}/favorites`}>{t("All favorites")}</Link></div>
      <p className="text-on-surface-variant text-body-sm">{t("Your favorites express what matters to you, independently of scores and tiers.")}</p>
      {featured.length ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">{featured.map(f => { const game = bySlug.get(f.slug); return game ? <Link key={f.slug} href={gameHref(game)} className="group min-w-0"><img src={game.cover} alt="" className="w-full aspect-[2/3] object-cover rounded-lg shadow-lg" /><p translate="no" className="mt-3 font-headline-md text-headline-md break-words group-hover:text-primary">{game.title}</p><p className="text-primary font-label-md">#{f.featuredSlot}</p></Link> : null; })}</div> : <p className="text-on-surface-variant">{t("No featured favorites yet.")}</p>}
    <div className="border-t border-outline-variant/20 pt-5">
    <ShareCardControls downloadOnRight endpoint={`/api/share/profile?kind=favorites${publicBase?`&handle=${profile.handle}`:""}`} />
    </div>
    </section>
    <div className="grid xl:grid-cols-2 gap-6 sm:gap-8 items-stretch">
    <div className={panel}>
    <TasteSummary games={games} href={`${base}/stats`} />
    </div>
    <section className={panel}><div className="flex min-h-11 items-center"><h2 className="font-headline-lg text-headline-lg">{t("Recently updated entries")}</h2></div><p className="text-body-sm text-on-surface-variant">{t("Latest saved entry updates, including rating, review or playback edits.")}</p>
      {recent.length ? <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{recent.map(game => <Link href={gameHref(game)} key={game.slug} className="min-w-0"><img loading="lazy" src={game.cover} alt="" className="w-full aspect-[2/3] object-cover rounded" /><h3 translate="no" className="mt-2 font-headline-md text-headline-md break-words">{game.title}</h3><p className="text-primary text-body-sm">{t("Score")}: {game.score ?? t("Unrated")}</p><time className="text-body-sm text-on-surface-variant" dateTime={game.updatedAt}>{game.updatedAt!.slice(0, 10)}</time></Link>)}</div> : <p className="text-on-surface-variant">{t("No dated entry updates yet.")}</p>}
    </section>
    </div>
  </section>;
}
