import { ReviewHelpfulness } from "@/components/review-helpfulness";
import { HomeCarousel } from "@/components/home-carousel";
import { getReviewHelpfulness } from "@/lib/review-helpfulness";
import Link from "next/link";
import { GameLogAction } from "@/components/game-actions";
import { getCommunity, getTasteDiscovery } from "@/lib/community";
import { getCatalog } from "@/lib/portfolio";
import { getMessages } from "@/lib/locale/server";
export async function CommunityDiscovery({ loggedSlugs }: { loggedSlugs: Set<string> }) {
  const [community, discovery, catalog, t] = await Promise.all([
    getCommunity(),
    getTasteDiscovery(),
    getCatalog(),
    getMessages(),
  ]);
  const { recommendations, neighbors } = discovery;
  const games = new Map(catalog.map((game) => [game.id, game]));
  if (
    !community.trending.length &&
    !community.controversial.length &&
    !recommendations.length &&
    !neighbors.length &&
    !community.reviews.length
  )
    return null;
  // ponytail: one aggregate request per reviewing profile; use a ranked database RPC if this becomes a measured bottleneck.
  const helpfulness = new Map(await Promise.all(
    [...new Set(community.reviews.map(review => review.profile_id))].map(async id => [id, await getReviewHelpfulness(id)] as const),
  ));
  const reviews = community.reviews.flatMap(review => {
    const game = games.get(review.game_id), data = helpfulness.get(review.profile_id);
    const counts = game && data?.reviews[game.slug];
    return game && data && counts ? [{ ...review, game, data, net: counts.upvotes - counts.downvotes }] : [];
  }).sort((a, b) => b.net - a.net || (b.updated_at ?? "").localeCompare(a.updated_at ?? "") || a.profile_id - b.profile_id || a.game_id - b.game_id).slice(0, 12);
  const sections = [
    {
      title: "Most controversial games",
      description:
        "Highest score spread, measured by population standard deviation. At least 5 ratings are required; a higher spread means more disagreement.",
      rows: community.controversial.slice(0, 5).map((row) => ({
        gameId: row.gameId,
        value: `${row.average} / 100 · ${row.count} ${t("ratings")} · σ ${row.deviation.toFixed(1)}`,
      })),
    },
    {
      title: "Games for your taste",
      description:
        "Games you have not logged, rated 90+ by people with at least 85% Taste Match across 5 shared scored games.",
      rows: recommendations.slice(0, 5).map((row) => ({
        gameId: row.gameId,
        value: `${row.average} / 100 · ${row.count} ${t("people")} · ${row.bestMatch}% ${t("Taste Match")}`,
      })),
    },
  ];
  return (
    <div className="w-full site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-12">
      {neighbors.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-headline-lg text-headline-lg">
            {t("Taste neighbors")}
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            {t(
              "Discoverable public profiles with at least 85% Taste Match across 5 shared scored games.",
            )}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {neighbors.slice(0, 6).map((neighbor) => (
              <Link
                key={neighbor.profileId}
                href={`/u/${neighbor.handle}`}
                className="rounded-lg bg-surface-container-low p-5 space-y-3"
              >
                <h3
                  translate="no"
                  className="font-headline-md text-headline-md break-words"
                >
                  {neighbor.displayName}
                </h3>
                <p className="text-primary">
                  {neighbor.match}% {t("Taste Match")}
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  {neighbor.shared} {t("Shared scored games")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
      {community.trending.length > 0 && <HomeCarousel kind="games">
        {community.trending.flatMap(row => {
          const game = games.get(row.gameId);
          return game ? [(
                <article key={game.id} className="group/game flex min-w-0 flex-col">
                  <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-surface-container-low">
                    <Link href={`/game/${game.slug}`} aria-label={game.title} className="block h-full">
                      <img src={game.cover_url} alt="" loading="lazy" className="w-full h-full object-cover transition-opacity group-hover/game:opacity-90" />
                    </Link>
                    <GameLogAction slug={game.slug} logged={loggedSlugs.has(game.slug)} />
                  </div>
                  <div className="mt-3 flex flex-col gap-1">
                    <h3 translate="no" className="font-headline-md text-headline-md group-hover/game:text-primary line-clamp-2"><Link href={`/game/${game.slug}`}>{game.title}</Link></h3>
                    <p className="text-body-sm text-primary break-words">{row.count} {t("people")}</p>
                  </div>
                </article>
          )] : [];
        })}
      </HomeCarousel>}
      {sections.filter(section => section.rows.length > 0).map((section) => (
        <section key={section.title} className="space-y-4">
          <h2 className="font-headline-lg text-headline-lg">
            {t(section.title)}
          </h2>
          <p className="max-w-3xl text-on-surface-variant text-body-sm">
            {t(section.description)}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {section.rows.map((row) => {
              const game = games.get(row.gameId);
              return (
                game && (
                  <Link
                    href={`/game/${game.slug}`}
                    key={game.id}
                    className="min-w-0 space-y-2"
                  >
                    <img
                      src={game.cover_url}
                      alt=""
                      loading="lazy"
                      className="w-full aspect-[3/4] object-cover rounded-lg"
                    />
                    <h3
                      translate="no"
                      className="font-headline-md text-headline-md break-words"
                    >
                      {game.title}
                    </h3>
                    <p className="text-body-sm text-primary break-words">
                      {row.value}
                    </p>
                  </Link>
                )
              );
            })}
          </div>
          {!section.rows.length && (
            <p className="text-on-surface-variant">
              {t(
                "Not enough data yet.",
              )}
            </p>
          )}
        </section>
      ))}
      {reviews.length > 0 && <HomeCarousel>
        {reviews.map(review => <article key={`${review.profile_id}-${review.game_id}`} className="flex h-full flex-col gap-5 rounded-xl border border-outline-variant/30 bg-surface-container-low p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <Link href={`/game/${review.game.slug}`} className="shrink-0"><img src={review.game.cover_url} alt={review.game.title} loading="lazy" className="h-24 w-16 rounded-md object-cover" /></Link>
            <div className="min-w-0 space-y-2">
              <h3 translate="no" className="font-headline-md text-headline-md line-clamp-2"><Link href={`/u/${review.profiles.handle}/game/${review.game.slug}`} className="hover:text-primary">{review.game.title}</Link></h3>
              <Link translate="no" href={`/u/${review.profiles.handle}`} className="text-body-sm text-primary hover:underline">{review.profiles.display_name}</Link>
            </div>
          </div>
          <p translate="no" className="line-clamp-5 whitespace-pre-wrap break-words text-body-md text-on-surface-variant">{review.review}</p>
          <Link href={`/u/${review.profiles.handle}/game/${review.game.slug}`} className="mt-auto inline-flex min-h-11 items-center gap-2 text-primary text-body-sm hover:underline">{t("Read review")}<span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
          <ReviewHelpfulness profileId={String(review.profile_id)} slug={review.game.slug} data={{ ...review.data, reviews: { [review.game.slug]: review.data.reviews[review.game.slug] } }} />
        </article>)}
      </HomeCarousel>}

    </div>
  );
}
