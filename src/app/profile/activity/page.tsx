import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/owner";
import { getMessages, localizeMetadata } from "@/lib/locale/server";
export async function generateMetadata() {
  return localizeMetadata({
    title: "Activity feed",
    robots: { index: false, follow: false },
  });
}
export default async function Page() {
  const account = await getAccount();
  if (!account) redirect("/login");
  if (!account.profile) redirect("/signup");
  const [follows, blocks, t] = await Promise.all([
    account.supabase
      .from("profile_follows")
      .select("followed_id")
      .eq("follower_id", account.profile.id),
    account.supabase.from("profile_blocks").select("blocker_id,blocked_id"),
    getMessages(),
  ]);
  if (follows.error || blocks.error)
    throw new Error("Activity could not be loaded.");
  const blocked = new Set(
    blocks.data.map((row) =>
      row.blocker_id === account.profile!.id ? row.blocked_id : row.blocker_id,
    ),
  );
  const ids = follows.data
    .map((row) => row.followed_id)
    .filter((id) => !blocked.has(id));
  const { data: profiles, error } = ids.length
    ? await account.supabase
        .from("profiles")
        .select("id,handle,display_name")
        .in("id", ids)
        .eq("is_public", true)
        .eq("is_discoverable", true)
    : { data: [], error: null };
  if (error) throw new Error("Activity could not be loaded.");
  const activeIds = profiles.map((profile) => profile.id);
  const { data: events, error: eventError } = activeIds.length
    ? await account.supabase
        .from("profile_activity")
        .select(
          "id,profile_id,game_id,kind,score,status,tier,occurred_at,games(title,slug)",
        )
        .in("profile_id", activeIds)
        .order("occurred_at", { ascending: false })
        .limit(50)
    : { data: [], error: null };
  if (eventError) throw new Error("Activity could not be loaded.");
  const { data: freshProfiles, error: freshError } = activeIds.length
    ? await account.supabase
        .from("profiles")
        .select("id,handle,display_name")
        .in("id", activeIds)
        .eq("is_public", true)
        .eq("is_discoverable", true)
    : { data: [], error: null };
  const { data: freshBlocks, error: blockError } = await account.supabase
    .from("profile_blocks")
    .select("blocker_id,blocked_id");
  if (freshError || blockError)
    throw new Error("Activity visibility could not be checked.");
  const excluded = new Set(
    freshBlocks.map((row) =>
      row.blocker_id === account.profile!.id ? row.blocked_id : row.blocker_id,
    ),
  );
  const visibleEvents = events.filter(
    (event) =>
      freshProfiles.some((profile) => profile.id === event.profile_id) &&
      !excluded.has(event.profile_id),
  );
  return (
    <section className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-6">
      <h1 className="font-headline-xl text-headline-xl">
        {t("Activity feed")}
      </h1>
      <p className="text-on-surface-variant">
        {t(
          "Recent updates from discoverable public profiles you follow. Unpublishing, leaving discovery or blocking removes their activity from your feed.",
        )}
      </p>
      <Link href="/profile/social" className="text-primary">
        {t("Following")}
      </Link>
      {visibleEvents.map((event) => {
        const profile = freshProfiles.find(
          (profile) => profile.id === event.profile_id,
        )!;
        return (
          <article
            key={event.id}
            className="rounded bg-surface-container-low p-5 space-y-2"
          >
            <p>
              <Link
                translate="no"
                href={`/u/${profile.handle}`}
                className="text-primary"
              >
                {profile.display_name}
              </Link>{" "}
              ·{" "}
              {t(
                event.kind === "favorite"
                  ? "Added a favorite"
                  : "Updated an entry",
              )}
            </p>
            {event.games && (
              <Link
                translate="no"
                href={`/game/${event.games.slug}`}
                className="font-headline-md text-headline-md"
              >
                {event.games.title}
              </Link>
            )}
            {event.score !== null && (
              <p>
                {t("Score")}: {event.score}
              </p>
            )}
            <time
              dateTime={event.occurred_at}
              className="text-body-sm text-on-surface-variant"
            >
              {event.occurred_at.slice(0, 10)}
            </time>
          </article>
        );
      })}
      {!visibleEvents.length && (
        <p className="text-on-surface-variant">
          {t("No activity from followed profiles yet.")}
        </p>
      )}
    </section>
  );
}
