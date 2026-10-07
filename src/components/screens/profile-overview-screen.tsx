"use client";
import Link from "next/link";
import { useMessages } from "@/components/site-preferences";
import { usePortfolio } from "@/components/portfolio-provider";
import { TasteSummary } from "@/components/taste-summary";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ProfileAccountControls } from "@/components/profile-account-controls";
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
  const panel = "min-w-0 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5 sm:p-6 space-y-5";
  const tools = [["Edit profile", "/settings", "edit"], ["Import from Steam", "/profile/import/steam", "download"], ["Manage favorites", "/profile/favorites", "favorite"], ["Following", "/profile/social", "group"]];
  return (
    <section className="site-container w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10 space-y-8">
      {!publicBase && <ProfileNavigation />}
      <header className="space-y-7">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem] items-start gap-6 lg:gap-10">
          <div className="min-w-0 space-y-4">
            <div className="flex items-center gap-4 sm:gap-5">
              <ProfileAvatar src={profile.avatarUrl} name={profile.displayName} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl text-headline-xl" />
              <div className="min-w-0 space-y-1.5">
                <p className="text-label-sm font-label-sm uppercase tracking-wider text-primary">{t(profile.isSample ? "Sample profile" : profile.isPublic ? "Public profile" : "Private profile")}</p>
                <h1 translate="no" className="font-headline-xl text-[32px] sm:text-[42px] font-semibold leading-tight tracking-tight break-words">{profile.displayName}</h1>
                <p translate="no" className="text-body-md text-on-surface-variant break-all">@{profile.handle}</p>
              </div>
            </div>
            {profile.bio && <p translate="no" className="max-w-2xl text-body-md leading-relaxed text-on-surface-variant whitespace-pre-wrap break-words">{profile.bio}</p>}
            {(profile.location || profile.platformPreference) && <div className="flex flex-wrap gap-x-6 gap-y-2 text-body-sm text-on-surface-variant">
              {profile.location && <p>{t("Location")}: <span translate="no">{profile.location}</span></p>}
              {profile.platformPreference && <p>{t("Platform preference")}: <span translate="no">{profile.platformPreference}</span></p>}
            </div>}
          </div>
          {!publicBase && access?.canEdit && <nav aria-label={t("Profile tools")} className="grid grid-cols-2 gap-2">
            {tools.map(([label, href, icon]) => <Link key={href} href={href} className={`flex min-h-12 items-center gap-2 rounded-xl px-3 py-3 text-body-sm font-medium transition-colors ${href === "/settings" ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"}`}><span aria-hidden="true" className="material-symbols-outlined text-[18px] shrink-0">{icon}</span><span>{t(label)}</span></Link>)}
            {profile.isPublic && <Link href={`/u/${profile.handle}`} className="col-span-2 flex min-h-11 items-center justify-end gap-2 px-3 text-body-sm text-primary hover:underline">{t("Open public profile")}<span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_outward</span></Link>}
          </nav>}
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 border-y border-outline-variant/20 py-6">
          {[[t("Games rated"), rated.length], [t("Completed games"), entries.filter(g => g.status === "completed").length], [t("Average score"), averageScore(rated)], [t("Favorites"), favorites.length]].map(([label, value]) => <div key={label} className="min-w-0 space-y-1"><dt className="text-body-sm text-on-surface-variant">{label}</dt><dd className="font-headline-xl text-headline-xl text-primary tabular-nums">{value}</dd></div>)}
        </dl>
      </header>
      <div className="grid lg:grid-cols-3 items-start gap-6">
        <div className="min-w-0 space-y-6 lg:col-span-2">
        <section className={panel}>
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-headline-lg text-headline-lg">{t("Featured favorites")}</h2><Link className="inline-flex min-h-11 items-center gap-2 text-body-sm text-primary hover:underline" href={`${base}/favorites`}>{t("All favorites")}<span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span></Link></div>
          <p className="text-on-surface-variant text-body-sm">{t("Your favorites express what matters to you, independently of scores and tiers.")}</p>
          {featured.length ? <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">{featured.map(f => {
            const game = bySlug.get(f.slug);
            return game ? <Link key={f.slug} href={gameHref(game)} className="group min-w-0 space-y-3">
              <img src={game.cover} alt="" className="w-full max-w-44 aspect-[2/3] object-cover rounded-xl shadow-md" />
              <div className="flex items-start gap-2"><span className="text-primary text-label-sm font-label-sm pt-0.5">{f.featuredSlot}</span><p translate="no" className="text-body-md font-semibold break-words group-hover:text-primary">{game.title}</p></div>
            </Link> : null;
          })}</div> : <p className="rounded-xl bg-surface-container/50 px-4 py-6 text-body-sm text-on-surface-variant">{t("No featured favorites yet.")}</p>}
        </section>
        <div className={panel}><TasteSummary games={games} href={`${base}/stats`} /></div>
        </div>
        <section className={panel}>
          <h2 className="font-headline-lg text-headline-lg">{t("Recently updated entries")}</h2>
          <p className="text-body-sm text-on-surface-variant">{t("Latest saved entry updates, including rating, review or playback edits.")}</p>
          {recent.length ? <div className="space-y-1">{recent.map(game => <Link href={gameHref(game)} key={game.slug} className="group flex min-w-0 items-center gap-3 rounded-xl p-2 -mx-2 hover:bg-surface-container transition-colors">
            <img loading="lazy" src={game.cover} alt="" className="w-12 h-[72px] shrink-0 object-cover rounded-lg bg-surface-container" />
            <div className="min-w-0 flex-1 space-y-1"><h3 translate="no" className="text-body-md font-semibold break-words group-hover:text-primary">{game.title}</h3><p className="text-primary text-body-sm">{t("Score")}: {game.score ?? t("Unrated")}</p><time className="block text-label-sm text-on-surface-variant" dateTime={game.updatedAt}>{game.updatedAt!.slice(0, 10)}</time></div>
          </Link>)}</div> : <p className="text-body-sm text-on-surface-variant">{t("No dated entry updates yet.")}</p>}
        </section>
      </div>
      {!publicBase && access?.canEdit && <section aria-label={t("Danger zone")} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-outline-variant/20 pt-6">
        <h2 className="font-headline-md text-headline-md text-on-surface-variant">{t("Danger zone")}</h2>
        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:min-w-[20rem]"><ProfileAccountControls handle={profile.handle} /></div>
      </section>}
    </section>
  );
}
