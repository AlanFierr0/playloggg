import Link from "next/link";
import { getCommunity, getTasteDiscovery } from "@/lib/community";
import { getCatalog } from "@/lib/portfolio";
import { getMessages } from "@/lib/locale/server";
export async function CommunityDiscovery() {
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
    return (
      <section className="w-full site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-4">
        <h2 className="font-headline-lg text-headline-lg">
          {t("Community discovery")}
        </h2>
        <p className="max-w-3xl text-on-surface-variant">
          {t(
            "Community discovery grows with profiles that choose to participate. Publish your profile and opt into discovery to join.",
          )}
        </p>
        <details className="text-body-sm text-on-surface-variant space-y-3">
          <summary className="cursor-pointer text-primary">
            {t("How community results work")}
          </summary>
          <p className="pt-3">
            {t(
              "Trending uses distinct rating activity over 30 days. Scores and controversy require at least 5 ratings. Recommendations need 85% Taste Match across 5 shared scored games.",
            )}
          </p>
        </details>
      </section>
    );
  const sections = [
    {
      title: "Trending games",
      description:
        "Distinct people who changed a score in the last 30 days. Only discoverable public profiles are included.",
      rows: community.trending.slice(0, 5).map((row) => ({
        gameId: row.gameId,
        value: `${row.count} ${t("people")}`,
      })),
    },
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
      {sections.map((section) => (
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
      <section className="space-y-4">
        <h2 className="font-headline-lg text-headline-lg">
          {t("Recent reviews")}
        </h2>
        {community.reviews.map((review) => {
          const game = games.get(review.game_id);
          return (
            game && (
              <article
                key={`${review.profile_id}-${review.game_id}`}
                className="space-y-2 py-3"
              >
                <Link
                  translate="no"
                  className="text-primary"
                  href={`/u/${review.profiles.handle}/game/${game.slug}`}
                >
                  {review.profiles.display_name} · {game.title}
                </Link>
                <p
                  translate="no"
                  className="whitespace-pre-wrap break-words text-on-surface-variant line-clamp-4"
                >
                  {review.review}
                </p>
              </article>
            )
          );
        })}
        {!community.reviews.length && (
          <p className="text-on-surface-variant">
            {t("No discoverable public reviews yet.")}
          </p>
        )}
      </section>
    </div>
  );
}
