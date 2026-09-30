import Link from "next/link";
import { ShareGameButton } from "@/components/game-actions";
import type { Game, Profile } from "@/types/domain";
import { playbackLabels } from "@/lib/playback-status";

// Imported games use real catalog details and the selected profile's saved entry.
// The Stitch sample reviews/community statistics belong to the original samples.
export function CatalogGameScreen({ game, isSample, publicProfile }: { game: Game; isSample: boolean; publicProfile?: Profile }) {
  return <div className="relative overflow-hidden bg-surface-container-lowest">
    {game.artwork && <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[620px] bg-cover bg-top opacity-25" style={{ backgroundImage: `url(${game.artwork})` }} />}
    <div className="absolute inset-0 bg-gradient-to-b from-surface/70 via-surface/90 to-surface pointer-events-none" />
    <div className="relative site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 space-y-8">
      <nav aria-label="Game navigation"><Link href={publicProfile ? `/u/${publicProfile.handle}` : "/games"} className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-label-md text-label-md uppercase tracking-wider">{publicProfile ? `← ${publicProfile.displayName}'s portfolio` : "← Game catalog"}</Link></nav>
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
        <div className="sm:col-span-4 xl:col-span-3 w-full max-w-[240px] sm:max-w-none mx-auto"><img src={game.cover} alt={`${game.title} cover`} className="w-full aspect-[3/4] rounded-lg object-cover bg-surface-container-high shadow-2xl" /></div>
        <div className="sm:col-span-8 xl:col-span-9 min-w-0 space-y-5">
          {game.kind && <span className="inline-flex rounded bg-primary/10 px-2 py-1 text-primary font-label-sm text-label-sm uppercase tracking-wider">{game.kind}</span>}
          <h1 className="font-headline-xl text-headline-xl lg:text-[44px] lg:leading-[48px] tracking-tight font-bold break-words">{game.title}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-2 font-label-md text-label-md text-on-surface-variant"><span>{game.releasedOn ? `Released ${game.releasedOn}` : "Release date unknown"}</span><span>{game.genres?.join(" / ") || "Genres unknown"}</span></div>
          {Boolean(game.developers?.length) && <p className="break-words text-on-surface-variant font-body-md text-body-md">Developer · {game.developers!.join(", ")}</p>}
          {Boolean(game.publishers?.length) && <p className="break-words text-on-surface-variant font-body-md text-body-md">Publisher · {game.publishers!.join(", ")}</p>}
          <div className="flex flex-wrap gap-2">{game.platforms?.map((platform) => <span key={platform} className="break-words max-w-full px-2 py-1 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm">{platform}</span>)}</div>
          <ShareGameButton slug={game.slug} className="inline-flex items-center gap-2 rounded bg-surface-container px-4 py-2 text-on-surface"><span className="material-symbols-outlined" aria-hidden="true">share</span><span>Copy game link</span></ShareGameButton>
          <section className="rounded-lg bg-surface-container-low p-4 sm:p-5 space-y-4">
            <h2 className="font-headline-md text-headline-md font-bold">{publicProfile ? `${publicProfile.displayName}'s log entry` : isSample ? "Sample profile entry" : "Your log entry"}</h2>
            {game.logged ? <>
              <div className="flex flex-wrap items-center gap-3 font-label-md text-label-md"><span className="text-primary">{game.score === null ? "Unrated" : `${game.score} / 100`}</span><span>{game.tier ? `Tier ${game.tier}` : "Tier unassigned"}</span>{game.status && <span>{playbackLabels[game.status]}</span>}{game.hoursPlayed != null && <span>{game.hoursPlayed} hrs</span>}{game.completedOn && <span>Completed {game.completedOn}</span>}</div>
              {game.review && <p translate="no" className="whitespace-pre-wrap break-words text-on-surface-variant font-body-md text-body-md">{game.review}</p>}
              {Boolean(game.tags?.length) && <div className="flex flex-wrap gap-2">{game.tags!.map((tag) => <span key={tag} className="max-w-full break-words rounded bg-surface-container px-2 py-1 font-label-sm text-label-sm">{tag}</span>)}</div>}
            </> : <p className="text-on-surface-variant">{publicProfile || isSample ? "This profile has not logged this game." : "This game is in the catalog. Add a log entry to save your status, rating or review."}</p>}
            {!publicProfile && <>
            <Link href={isSample ? "/login" : `/log?game=${encodeURIComponent(game.slug)}`} className="inline-flex rounded px-5 py-2.5 bg-primary-container text-on-primary-container font-label-md text-label-md uppercase tracking-wider">{isSample ? "Sign in" : game.logged ? "Edit log entry" : "Log this game"}</Link>
            {!isSample && <Link href="/lists" className="inline-flex ml-3 py-2.5 text-primary font-label-md text-label-md">Curated lists →</Link>}
            </>}
          </section>
        </div>
      </div>
      <section className="space-y-4"><h2 className="font-headline-lg text-headline-lg font-bold">About this game</h2><p className="max-w-3xl whitespace-pre-wrap break-words text-on-surface-variant font-body-lg text-body-lg leading-relaxed">{game.summary || "No overview is available from IGDB yet."}</p>{game.sourceUrl && <a href={game.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex text-primary font-label-md text-label-md">View source on IGDB ↗</a>}</section>
      {Boolean(game.screenshots?.length) && <section className="space-y-4"><h2 className="font-headline-lg text-headline-lg font-bold">Screenshots</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{game.screenshots!.map((src, index) => <img key={src} src={src} alt={`${game.title} screenshot ${index + 1}`} loading="lazy" className="w-full aspect-video object-cover rounded-lg bg-surface-container" />)}</div></section>}
    </div>
  </div>;
}
