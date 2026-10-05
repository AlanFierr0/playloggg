import Link from "next/link";
import { discoverProfiles, profileSearch } from "@/lib/profile-directory";
import { getMessages } from "@/lib/locale/server";
import { ProfileAvatar } from "@/components/profile-avatar";
import { getAccount } from "@/lib/owner";
import { SocialControls } from "@/components/social-controls";
export async function DiscoverProfiles({
  full = false,
  page = 1,
  query = "",
}: {
  full?: boolean;
  page?: number;
  query?: string;
}) {
  const [account, t] = await Promise.all([full ? getAccount() : Promise.resolve(null), getMessages()]);
  const followed = new Set<number>();
  const excluded = new Set<number>();
  if (account?.profile) {
    const [follows, blocks] = await Promise.all([
      account.supabase.from("profile_follows").select("followed_id").eq("follower_id", account.profile.id),
      account.supabase.from("profile_blocks").select("blocker_id,blocked_id"),
    ]);
    if (follows.error || blocks.error) throw new Error("Connections could not be loaded.");
    follows.data.forEach(row => followed.add(row.followed_id));
    blocks.data.forEach(row => excluded.add(row.blocker_id === account.profile!.id ? row.blocked_id : row.blocker_id));
  }
  const search = profileSearch(query);
  const profiles = await discoverProfiles(full ? 25 : 6, full ? (page - 1) * 24 : 0, search, [...excluded]);
  const pageHref = (next: number) => `/people?${new URLSearchParams({ ...(search ? { q: search } : {}), page: String(next) })}`;
  return (
    <section className="w-full site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h2 className="font-headline-xl text-headline-xl">
          {t(full ? "Explore profiles" : "Gaming identities")}
        </h2>
        {!full && (
          <Link
            href="/people"
            className="text-primary min-h-11 inline-flex items-center"
          >
            {t("Explore profiles")}
          </Link>
        )}
      </div>
      {full && <div className="space-y-5">
        <p className="text-on-surface-variant">{t("Find a friend, follow their updates and compare your games.")}</p>
        <nav aria-label={t("Friends navigation")} className="flex flex-wrap gap-3">
          {account?.profile ? <><Link href="/profile/social" className="rounded bg-primary/10 text-primary px-4 py-3">{t("Following")}</Link><Link href="/profile/activity" className="rounded bg-surface-container text-primary px-4 py-3">{t("Activity feed")}</Link></> : <Link href="/login" className="rounded bg-primary-container text-on-primary-container px-4 py-3">{t("Sign in to follow friends")}</Link>}
        </nav>
        <form action="/people" method="get" className="flex flex-col sm:flex-row gap-3 items-end">
          <label className="w-full min-w-0 space-y-2"><span className="block">{t("Find friends")}</span><input name="q" defaultValue={search} maxLength={80} placeholder={t("Search by name or handle")} className="catalog-control" /></label>
          <button className="shrink-0 rounded bg-primary-container text-on-primary-container px-5 py-3">{t("Search")}</button>
          {search && <Link href="/people" className="shrink-0 text-primary px-4 py-3">{t("Clear search")}</Link>}
        </form>
        <p className="text-body-sm text-on-surface-variant">{t("Friends need a public profile with discovery enabled to appear here.")}</p>
      </div>}
      {profiles.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.slice(0, full ? 24 : 6).map((profile) => (
            <article key={profile.id} className="min-w-0 rounded-xl bg-surface-container-low p-5 space-y-4">
            <Link href={`/u/${profile.handle}`} className="flex items-start gap-4">
              <ProfileAvatar
                src={profile.avatar_url}
                name={profile.display_name}
                className="w-16 h-16 rounded-xl shrink-0"
              />
              <div className="min-w-0 space-y-2">
                <h3
                  translate="no"
                  className="font-headline-md text-headline-md break-words"
                >
                  {profile.display_name}
                </h3>
                <p translate="no" className="text-primary break-all">
                  @{profile.handle}
                </p>
                {profile.bio && (
                  <p
                    translate="no"
                    className="text-body-sm text-on-surface-variant line-clamp-2 break-words"
                  >
                    {profile.bio}
                  </p>
                )}
              </div>
            </Link>
            {full && account?.profile && account.profile.id !== profile.id && <div className="space-y-3"><SocialControls target={profile.id} followed={followed.has(profile.id)} /><Link href={`/compare?right=${encodeURIComponent(profile.handle)}`} aria-label={`${t("Compare games")} ${profile.display_name}`} className="inline-flex min-h-11 items-center rounded bg-primary/10 text-primary px-4 py-2">{t("Compare games")}</Link></div>}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-outline-variant/40 p-6 sm:p-8 space-y-4">
          <h3 className="font-headline-lg text-headline-lg">{t(search ? "No friends match this search." : "No profiles have opted into discovery yet.")}</h3>
          <p className="max-w-[55ch] text-on-surface-variant">{t(search ? "Try another name or handle." : "Invite a friend to create a profile, publish it and enable discovery. Then search their handle here.")}</p>
          {!search && <Link href={account?.profile ? "/settings" : "/profile"} className="ui-action bg-surface-container text-primary">{t(account?.profile ? "Manage profile visibility" : "Create your profile")}</Link>}
        </div>
      )}
      {full && (
        <nav aria-label={t("Profile directory pages")} className="flex gap-6">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="text-primary">
              {t("Previous")}
            </Link>
          )}
          {profiles.length > 24 && (
            <Link href={pageHref(page + 1)} className="text-primary">
              {t("Next")}
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
