import Link from "next/link";
import { discoverProfiles } from "@/lib/profile-directory";
import { getMessages } from "@/lib/locale/server";
import { ProfileAvatar } from "@/components/profile-avatar";
export async function DiscoverProfiles({
  full = false,
  page = 1,
}: {
  full?: boolean;
  page?: number;
}) {
  const [profiles, t] = await Promise.all([
    discoverProfiles(full ? 25 : 6, full ? (page - 1) * 24 : 0),
    getMessages(),
  ]);
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
      {profiles.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.slice(0, full ? 24 : 6).map((profile) => (
            <Link
              href={`/u/${profile.handle}`}
              key={profile.id}
              className="flex items-start gap-4 rounded-xl bg-surface-container-low p-5"
            >
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
          ))}
        </div>
      ) : (
        <p className="text-on-surface-variant">
          {t("No profiles have opted into discovery yet.")}
        </p>
      )}
      {full && (
        <nav aria-label={t("Profile directory pages")} className="flex gap-6">
          {page > 1 && (
            <Link href={`/people?page=${page - 1}`} className="text-primary">
              {t("Previous")}
            </Link>
          )}
          {profiles.length > 24 && (
            <Link href={`/people?page=${page + 1}`} className="text-primary">
              {t("Next")}
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
