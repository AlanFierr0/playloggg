import {ReviewText} from "@/components/review-text";
import { ReviewHelpfulness } from "@/components/review-helpfulness";
import { ProfileAvatar } from "@/components/profile-avatar";
import { HomeCarousel } from "@/components/home-carousel";
import Link from "next/link";
import { GameLogAction } from "@/components/game-actions";
import { getCommunity, getTasteDiscovery } from "@/lib/community";
import { getCatalogRows } from "@/lib/portfolio";
import { getMessages } from "@/lib/locale/server";
export async function CommunityDiscovery({ loggedSlugs }: { loggedSlugs: Set<string> }) {
  const [community, discovery, t] = await Promise.all([
    getCommunity().catch(()=>({controversial:[],trending:[],reviews:[],viewerId:null,unavailable:true})),
    getTasteDiscovery().catch(()=>({recommendations:[],neighbors:[],unavailable:true})),
    getMessages(),
  ]);
  const { recommendations, neighbors } = discovery;
  const catalog = await getCatalogRows([...community.reviews.map(row => row.game_id), ...community.trending.map(row => row.gameId), ...community.controversial.map(row => row.gameId), ...discovery.recommendations.map(row => row.gameId)]).catch(()=>null);
  if(!catalog)return <section className="site-container mx-auto px-4 py-8"><p role="status">{t("Community suggestions are temporarily unavailable. Try refreshing the page.")}</p></section>;
  const games = new Map(catalog.map((game) => [game.id, game]));
  if (
    !community.trending.length &&
    !community.controversial.length &&
    !recommendations.length &&
    !neighbors.length &&
    !community.reviews.length && !community.unavailable && !("unavailable" in discovery)
  )
    return null;
  const reviews=community.reviews.flatMap(review=>{
    const game=games.get(review.game_id);
    return game ? [{...review,game,profiles:{handle:review.handle,display_name:review.display_name},
      data:{signedIn:community.viewerId!==null,canVote:community.viewerId!==null&&community.viewerId!==review.profile_id,
        reviews:{[game.slug]:{upvotes:review.upvotes,downvotes:review.downvotes,vote:review.viewer_vote as -1|0|1}}}}] : [];
  });
  const sections = [
    {
      title: "Most controversial games",
      description:
        "Games that divide the community.",
      rows: community.controversial.slice(0, 5).map((row) => ({
        gameId: row.gameId,
        value: `${row.average} / 100 · ${row.count} ${t("ratings")} · σ ${row.deviation.toFixed(1)}`,
      })),
    },
    {
      title: "Games for your taste",
      description:
        "Unlogged games recommended by people with similar taste.",
      rows: recommendations.slice(0, 5).map((row) => ({
        gameId: row.gameId,
        value: `${row.average} / 100 · ${row.count} ${t("people")} · ${row.bestMatch}% ${t("Taste Match")}`,
      })),
    },
  ];
  return (
    <div className="w-full site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-12">
      {(community.unavailable || "unavailable" in discovery) && <p role="status" className="text-body-sm text-on-surface-variant">{t("Some community suggestions are unavailable. Try refreshing the page.")}</p>}
      {neighbors.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-headline-lg text-headline-lg">
            {t("Taste neighbors")}
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            {t(
              "Players who share your taste in games.",
            )}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {neighbors.slice(0, 6).map((neighbor) => (
              <Link prefetch={false}
                key={neighbor.profileId}
                href={`/u/${neighbor.handle}`}
                className="min-w-0 flex items-start gap-4 rounded-lg bg-surface-container-low p-5"
              >
                <ProfileAvatar src={neighbor.avatarUrl} name={neighbor.displayName} className="h-12 w-12 rounded-xl" />
                <div className="min-w-0 space-y-3">
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
                </div>
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
                    <Link prefetch={false} href={`/game/${game.slug}`} aria-label={game.title} className="block h-full">
                      <img src={game.cover_url} alt="" loading="lazy" className="w-full h-full object-cover transition-opacity group-hover/game:opacity-90" />
                    </Link>
                    <GameLogAction slug={game.slug} logged={loggedSlugs.has(game.slug)} />
                  </div>
                  <div className="mt-3 flex flex-col gap-1">
                    <h3 translate="no" className="font-headline-md text-headline-md group-hover/game:text-primary line-clamp-2"><Link prefetch={false} href={`/game/${game.slug}`}>{game.title}</Link></h3>
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
                  <article key={game.id} className="group/game min-w-0 space-y-2">
                    <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-low">
                      <Link prefetch={false} href={`/game/${game.slug}`} aria-label={game.title} className="block h-full">
                        <img src={game.cover_url} alt="" loading="lazy" className="w-full h-full object-cover transition-opacity group-hover/game:opacity-90" />
                      </Link>
                      <GameLogAction slug={game.slug} logged={loggedSlugs.has(game.slug)} />
                    </div>
                    <h3 translate="no" className="font-headline-md text-headline-md break-words group-hover/game:text-primary">
                      <Link prefetch={false} href={`/game/${game.slug}`}>{game.title}</Link>
                    </h3>
                    <p className="text-body-sm text-primary break-words">{row.value}</p>
                  </article>
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
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-2">
            <Link prefetch={false} href={`/game/${review.game.slug}`} className="row-start-2 shrink-0"><img src={review.game.cover_url} alt={review.game.title} loading="lazy" className="h-[72px] w-12 rounded-md object-cover sm:h-24 sm:w-16" /></Link>
            <Link prefetch={false} href={`/u/${review.profiles.handle}`} aria-label={review.profiles.display_name} className="col-span-2 row-start-1 inline-flex min-h-11 max-w-full items-center justify-self-end gap-2 rounded-lg text-body-sm text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
              <span translate="no" className="min-w-0 break-words text-right">{review.profiles.display_name}</span>
              <ProfileAvatar src={`/avatars/${review.profile_id}`} name={review.profiles.display_name} className="h-10 w-10 rounded-xl" />
            </Link>
            <h3 translate="no" className="row-start-2 min-w-0 font-headline-md text-headline-md line-clamp-2"><Link prefetch={false} href={`/u/${review.profiles.handle}/game/${review.game.slug}`} className="hover:text-primary">{review.game.title}</Link></h3>
          </div>
          <ReviewText text={review.review} slug={review.game.slug} profileId={String(review.profile_id)} className="line-clamp-5 text-body-md"/>
          <Link prefetch={false} href={`/u/${review.profiles.handle}/game/${review.game.slug}`} className="mt-auto inline-flex min-h-11 items-center gap-2 text-primary text-body-sm hover:underline">{t("Read review")}<span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
          <ReviewHelpfulness profileId={String(review.profile_id)} slug={review.game.slug} data={{ ...review.data, reviews: { [review.game.slug]: review.data.reviews[review.game.slug] } }} />
        </article>)}
      </HomeCarousel>}

    </div>
  );
}
