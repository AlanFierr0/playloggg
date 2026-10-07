import { GameGenres } from "@/components/game-genres";
import {GameTags} from "@/components/game-tags";
import {GameFavorite} from "@/components/game-favorite";
import {getCommunityGameScore} from "@/lib/community";
import {getCatalogGame} from "@/lib/portfolio";
import { getMessages } from "@/lib/locale/server";
import Link from "next/link";
import type { Game, Profile } from "@/types/domain";
import { playbackLabels } from "@/lib/playback-status";

// Imported games use real catalog details and the selected profile's saved entry.
// The Stitch sample reviews/community statistics belong to the original samples.
export async function CatalogGameScreen({ game, isSample, publicProfile }: { game: Game; isSample: boolean; publicProfile?: Profile }) {
  const [t,row] = await Promise.all([getMessages(),getCatalogGame(game.slug)]);
  const communityScore=row ? await getCommunityGameScore(row.id) : undefined;
  return <div className="relative overflow-hidden bg-surface-container-lowest">
    {game.artwork && <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[620px] bg-cover bg-top opacity-25" style={{ backgroundImage: `url(${game.artwork})`, maskImage: "linear-gradient(to bottom, black 0%, black 45%, transparent 100%)" }} />}
    <div className="absolute inset-0 bg-gradient-to-b from-surface/70 via-surface/90 to-surface pointer-events-none" />
    <div className="relative site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 space-y-8">
      <nav aria-label={t("Game navigation")}><Link href={publicProfile ? `/u/${publicProfile.handle}` : "/games"} className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-body-md text-body-md">{publicProfile ? t(`← ${publicProfile.displayName}'s portfolio`) : t("← Game catalog")}</Link></nav>
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
        <div className="sm:col-span-4 xl:col-span-3 w-full max-w-[240px] sm:max-w-none mx-auto"><img src={game.cover} alt={t(`${game.title} cover`)} className="w-full aspect-[3/4] rounded-lg object-cover bg-surface-container-high shadow-2xl" /></div>
        <div className="sm:col-span-8 xl:col-span-9 min-w-0 space-y-5">
          <header className="flex flex-wrap items-start gap-5 lg:gap-8">
            <div className="min-w-[min(100%,20rem)] flex-1 space-y-3">
              {game.kind && <span className="inline-flex rounded bg-primary/10 px-2 py-1 text-on-surface-variant font-body-sm text-body-sm">{game.kind}</span>}
              <h1 className="font-headline-xl text-headline-xl lg:text-[44px] lg:leading-[48px] tracking-tight font-bold break-words">{game.title}</h1>
            </div>

          </header>
          <div className="flex flex-wrap gap-x-4 gap-y-2 font-label-md text-label-md text-on-surface-variant"><span>{game.releasedOn ? t(`Released ${game.releasedOn}`) : t("Release date unknown")}</span><GameGenres genres={game.genres} fallback={t("Genres unknown")} /></div>
          {Boolean(game.developers?.length) && <p className="break-words text-on-surface-variant font-body-md text-body-md">{t("Developer · ")}{game.developers!.join(", ")}</p>}
          {!publicProfile&&<GameFavorite slug={game.slug}/>}
          {Boolean(game.publishers?.length) && <p className="break-words text-on-surface-variant font-body-md text-body-md">{game.publishers!.join(", ")}</p>}
          <div className="flex flex-wrap gap-2">{game.platforms?.map((platform) => <span key={platform} className="break-words max-w-full px-2 py-1 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm">{platform === "PC (Microsoft Windows)" ? "PC" : platform}</span>)}</div>
          <section className="rounded-xl bg-surface-container-low p-5 sm:p-6 space-y-4">
            <h2 className="font-headline-md text-headline-md font-bold">{publicProfile ? t(`${publicProfile.displayName}'s log entry`) : isSample ? t("Sample profile entry") : t("Your log entry")}</h2>
            {game.logged ? <>
              <div className="flex flex-wrap items-center gap-3 font-label-md text-label-md"><span className="text-primary">{game.score === null ? t("Unrated") : t(`${game.score} / 100`)}</span><span>{game.tier ? t(`Tier ${game.tier}`) : t("Tier unassigned")}</span>{game.status && <span>{t(playbackLabels[game.status])}</span>}{game.hoursPlayed != null && <span>{game.hoursPlayed} {t("hrs")}</span>}{game.completedOn && <span>{t("Completed ")}{game.completedOn}</span>}</div>
              {game.review && <p translate="no" className="whitespace-pre-wrap break-words text-on-surface-variant font-body-md text-body-md">{game.review}</p>}
              <GameTags tags={game.tags} />
            </> : <p className="text-on-surface-variant">{publicProfile || isSample ? t("This profile has not logged this game.") : t("This game is in the catalog. Add a log entry to save your status, rating or review.")}</p>}
            {!publicProfile && <>
            <Link href={isSample ? "/login" : `/log?game=${encodeURIComponent(game.slug)}`} className="inline-flex rounded px-5 py-2.5 bg-primary-container text-on-primary-container font-body-md text-body-md">{isSample ? t("Sign in") : game.logged ? t("Edit log entry") : t("Log this game")}</Link>
            </>}
          </section>
          <div className="text-body-sm text-on-surface-variant flex flex-wrap gap-x-3 gap-y-1">
            <span>{t("Community score")}</span>
            <span>{communityScore ? `${communityScore.average} / 100` : t("No ratings yet")}</span>
            {communityScore && <span>{communityScore.count} {t("ratings")}</span>}
          </div>
        </div>
      </div>
      <section className="space-y-4"><h2 className="font-headline-lg text-headline-lg font-bold">{t("About this game")}</h2><p className="max-w-3xl whitespace-pre-wrap break-words text-on-surface-variant font-body-lg text-body-lg leading-relaxed">{game.summary || t("No overview is available from IGDB yet.")}</p></section>
      {Boolean(game.screenshots?.length) && <section className="space-y-4"><h2 className="font-headline-lg text-headline-lg font-bold">{t("Screenshots")}</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{game.screenshots!.map((src, index) => <img key={src} src={src} alt={t(`${game.title} screenshot ${index + 1}`)} loading="lazy" className="w-full aspect-video object-cover rounded-lg bg-surface-container" />)}</div></section>}
    </div>
  </div>;
}
