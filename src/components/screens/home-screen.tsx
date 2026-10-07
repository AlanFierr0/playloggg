import { getMessages } from "@/lib/locale/server";
import { getDiscover } from "@/lib/discover";
import { CommunityDiscovery } from "@/components/community-discovery";
import { HomeIntro, type HomeEntry } from "@/components/home-intro";
import Link from "next/link";
import { ProfilePreview } from "@/components/profile-preview";
import { getPortfolio } from "@/lib/portfolio";
import { GameLogAction } from "@/components/game-actions";
import { GameTags } from "@/components/game-tags";
import { tasteStats } from "@/lib/taste";
import type { Game } from "@/types/domain";

export async function HomeScreen() {
  const [t, { games: sampled }, portfolio] = await Promise.all([getMessages(), getDiscover(9), getPortfolio()]);
  const personal = Boolean(portfolio.access?.canEdit);
  const entries = personal ? portfolio.games.filter(game => game.logged).sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "") || a.slug.localeCompare(b.slug)) : [];
  const loggedSlugs = new Set(entries.map(game => game.slug));
  const previewCount = personal ? 0 : Math.min(4, Math.floor(sampled.length / 2));
  const playing = entries.filter(game => (game.status === "playing" || game.status === "active")).slice(0, 4);
  const playingSlugs = new Set(playing.map(game => game.slug));
  const recent = entries.filter(game => !playingSlugs.has(game.slug)).slice(0, 4);
  // Only card fields cross into the client; reviews and other entry data stay on the server.
  const card = ({ slug, title, cover, score, tier, status, platform, hoursPlayed }: Game): HomeEntry => ({ slug, title, cover, score, tier, status, platform, hoursPlayed });
  const stats = tasteStats(entries);
  const preferred = stats.preferredGenres.slice(0, 3);
  const genres = preferred.length ? preferred.map(group => group.name) : [...new Set(entries.flatMap(game => game.genres ?? []))].slice(0, 3);
  const tags = [...new Map(entries.flatMap(game => game.tags ?? []).map(tag => [tag.toLowerCase(), tag])).values()].slice(0, 4);
  const suggestions = new Map<string, { game: Game; genre?: string }>();
  for (const group of preferred) {
    for (const game of portfolio.games) {
      if (!game.logged && game.genres?.includes(group.name) && suggestions.size < 5 && !suggestions.has(game.slug)) suggestions.set(game.slug, { game, genre: group.name });
    }
  }
  const personalized = suggestions.size > 0;
  if (!personalized) {
    const fallback = personal ? [...sampled, ...portfolio.games].filter(game => !loggedSlugs.has(game.slug)) : sampled.slice(previewCount);
    for (const game of fallback) if (suggestions.size < 5 && !suggestions.has(game.slug)) suggestions.set(game.slug, { game });
  }
  return <div className="w-full bg-surface">
    <HomeIntro recent={recent.map(card)} playing={playing.map(card)} preview={<ProfilePreview games={sampled.slice(0, previewCount)} />} />
    {personal && preferred.length > 0 && <section aria-label={t("Your taste")} className="site-container mx-auto px-4 sm:px-6 lg:px-12 pb-8">
      <div className="border-y border-outline-variant/30 py-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-headline-md text-headline-md font-semibold">{t("Your taste")}</h2><Link href="/profile/stats" className="inline-flex min-h-11 items-center gap-2 text-primary text-body-sm hover:underline">{t("View stats")}<span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_forward</span></Link></div>
        <p className="text-body-sm text-on-surface-variant">{t("Your highest-rated genres, based on at least 3 scored games in each genre.")}</p>
        <dl className="grid gap-5 sm:grid-cols-3">{preferred.map(group => <div key={group.name} className="min-w-0"><dt><Link href={`/games?genre=${encodeURIComponent(group.name)}`} translate="no" className="inline-flex min-h-11 items-center font-headline-md text-headline-md hover:text-primary">{group.name}</Link></dt><dd className="flex flex-wrap items-baseline gap-3"><span className="font-headline-xl text-headline-xl text-primary">{group.average}<span className="text-body-sm text-on-surface-variant"> / 100</span></span><span className="text-body-sm text-on-surface-variant">{group.count} {t("Games rated")}</span></dd></div>)}</dl>
      </div>
    </section>}
    <section aria-label={t(personalized ? "Explore your taste" : "Games worth exploring")} className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"><div className="space-y-2"><h2 className="font-headline-xl text-headline-xl tracking-tight">{t(personalized ? "Explore your taste" : "Games worth exploring")}</h2>{personalized && <p className="max-w-xl text-body-sm text-on-surface-variant">{t("Unlogged games in your highest-rated genres.")}</p>}</div><Link href="/games" className="inline-flex min-h-11 items-center gap-1.5 text-body-md text-on-surface-variant hover:text-primary">{t("Explore All Games")}<span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_forward</span></Link></div>
      {personal && (genres.length > 0 || tags.length > 0) && <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-6">
        {genres.length > 0 && <div className="space-y-2"><p className="text-body-sm text-on-surface-variant">{t("Your genres")}</p><div className="flex flex-wrap gap-2">{genres.map(genre => <Link key={genre} href={`/games?genre=${encodeURIComponent(genre)}`} translate="no" className="inline-flex min-h-11 items-center rounded-lg bg-surface-container-low px-3 text-body-sm hover:bg-surface-container-high hover:text-primary">{genre}</Link>)}</div></div>}
        {tags.length > 0 && <div className="space-y-2"><p className="text-body-sm text-on-surface-variant">{t("Your tags")}</p><GameTags tags={tags} /></div>}
      </div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">{[...suggestions.values()].map(({ game, genre }) => <article key={game.slug} className="group/game flex min-w-0 flex-col"><div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-surface-container-low"><Link href={`/game/${game.slug}`} aria-label={game.title} className="block h-full"><img className="w-full h-full object-cover transition-opacity group-hover/game:opacity-90" src={game.cover} alt="" loading="lazy" /></Link><GameLogAction slug={game.slug} logged={false} /></div><div className="mt-3 flex flex-col gap-1"><h3 translate="no" className="font-headline-md text-headline-md group-hover/game:text-primary line-clamp-2"><Link href={`/game/${game.slug}`}>{game.title}</Link></h3><span title={game.developers?.join(", ")} className="text-body-sm text-on-surface-variant truncate">{game.year ?? t("Release date unknown")}{game.developers?.length ? ` · ${game.developers.join(", ")}` : ""}</span>{genre && <p className="text-body-sm text-on-surface-variant">{t("From your genres")}: <Link href={`/games?genre=${encodeURIComponent(genre)}`} translate="no" className="text-primary underline underline-offset-4 hover:no-underline">{genre}</Link></p>}</div></article>)}</div>
      {!suggestions.size && <p className="text-on-surface-variant">{t(personal ? "No unlogged suggestions right now. Explore your collection in Games." : "This curated selection is not available yet. Explore the catalog.")}</p>}
    </section>
    <CommunityDiscovery loggedSlugs={loggedSlugs} />
  </div>;
}
