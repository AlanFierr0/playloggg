import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/owner";
import { getMessages, localizeMetadata } from "@/lib/locale/server";
import { SocialControls } from "@/components/social-controls";
export async function generateMetadata() {
  return localizeMetadata({
    title: "Following and blocks",
    robots: { index: false, follow: false },
  });
}
export default async function Page() {
  const account = await getAccount();
  if (!account) redirect("/login");
  if (!account.profile) redirect("/signup");
  const [
    { data: follows, error: followsError },
    { data: blocks, error: blocksError },
    t,
  ] = await Promise.all([
    account.supabase
      .from("profile_follows")
      .select("followed_id")
      .eq("follower_id", account.profile.id),
    account.supabase
      .from("profile_blocks")
      .select("blocked_id")
      .eq("blocker_id", account.profile.id),
    getMessages(),
  ]);
  if (followsError || blocksError)
    throw new Error("Connections could not be loaded.");
  const ids = [
    ...new Set([
      ...follows.map((row) => row.followed_id),
      ...blocks.map((row) => row.blocked_id),
    ]),
  ];
  const { data: profiles, error } = ids.length
    ? await account.supabase
        .from("profiles")
        .select("id,handle,display_name,is_public,is_discoverable")
        .in("id", ids)
    : { data: [], error: null };
  if (error) throw new Error("Connections could not be loaded.");
  return (
    <section className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-8">
      <h1 className="font-headline-xl text-headline-xl">
        {t("Following and blocks")}
      </h1>
      <Link href="/profile/activity" className="text-primary">
        {t("Activity feed")}
      </Link>
      {[
        { label: "Following", rows: follows.map((row) => row.followed_id) },
        {
          label: "Blocked profiles",
          rows: blocks.map((row) => row.blocked_id),
        },
      ].map(({ label, rows }) => (
        <section key={label} className="space-y-5">
          <h2 className="font-headline-lg text-headline-lg">{t(label)}</h2>
          {rows.map((id) => {
            const profile = profiles.find((profile) => profile.id === id);
            return (
              <div
                key={id}
                className="flex flex-wrap gap-4 justify-between items-center rounded bg-surface-container-low p-4"
              >
                {profile ? (
                  <Link
                    href={`/u/${profile.handle}`}
                    translate="no"
                    className="text-primary"
                  >
                    {profile.display_name}
                  </Link>
                ) : (
                  <span>{t("Profile unavailable")}</span>
                )}
                <SocialControls
                  target={id}
                  followed={follows.some((row) => row.followed_id === id)}
                  blocked={blocks.some((row) => row.blocked_id === id)}
                />
              </div>
            );
          })}
          {!rows.length && (
            <p className="text-on-surface-variant">{t("No profiles yet.")}</p>
          )}
        </section>
      ))}
    </section>
  );
}
