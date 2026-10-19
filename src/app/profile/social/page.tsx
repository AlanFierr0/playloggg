import { loginHref } from "@/lib/return-navigation";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/owner";
import { getMessages, localizeMetadata } from "@/lib/locale/server";
import { ProfileAvatar } from "@/components/profile-avatar";
import { avatarSource } from "@/lib/avatar-input";
import { SocialControls } from "@/components/social-controls";
export async function generateMetadata() {
  return localizeMetadata({
    title: "Following",
    robots: { index: false, follow: false },
  });
}
export default async function Page() {
  const account = await getAccount();
  if (!account) redirect(loginHref("/profile/social"));
  if (!account.profile) redirect("/signup?next=/profile/social");
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
    ]),
  ];
  const { data: profiles, error } = ids.length
    ? await account.supabase
        .from("profiles")
        .select("id,handle,display_name,is_public,is_discoverable,avatar_url")
        .in("id", ids)
    : { data: [], error: null };
  if (error) throw new Error("Connections could not be loaded.");
  return (
    <section className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-8">
      <h1 className="font-headline-xl text-headline-xl">
        {t("Following")}
      </h1>
      <nav aria-label={t("Profile navigation")} className="flex flex-wrap gap-3"><Link href="/people" className="rounded bg-primary/10 text-primary px-4 py-3">{t("Find profiles")}</Link></nav>
      {[
        { label: "Following", rows: follows.map((row) => row.followed_id) },
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
                    className="flex min-w-0 items-center gap-3 text-primary"
                  >
                    <ProfileAvatar src={avatarSource(profile.id, profile.avatar_url)} name={profile.display_name} className="w-12 h-12 rounded-xl shrink-0" />
                    <span className="min-w-0 break-words">{profile.display_name}<span className="block text-body-sm text-on-surface-variant break-all">@{profile.handle}</span></span>
                  </Link>
                ) : (
                  <span>{t("Profile unavailable")}</span>
                )}
                <div className="flex flex-wrap items-center gap-3">
                {label === "Following" && profile?.is_public && profile.is_discoverable && !blocks.some(row => row.blocked_id === id) && <Link href={`/compare?right=${encodeURIComponent(profile.handle)}`} aria-label={`${t("Compare games")} ${profile.display_name}`} className="inline-flex min-h-11 items-center rounded bg-primary/10 text-primary px-4 py-2">{t("Compare games")}</Link>}
                <SocialControls
                  target={id}
                  followed={follows.some((row) => row.followed_id === id)}
                  blocked={blocks.some((row) => row.blocked_id === id)}
                />
                </div>
              </div>
            );
          })}
          {!rows.length && (
            <p className="text-on-surface-variant">{t(label === "Following" ? "You are not following anyone yet. Find a friend to get started." : "No profiles yet.")}</p>
          )}
        </section>
      ))}
    </section>
  );
}
