import { loginHref } from "@/lib/return-navigation";
import { BackLink } from "@/components/return-navigation";
import { avatarSource } from "@/lib/avatar-input";
import { localizeMetadata } from "@/lib/locale/server";
import { getMessages } from "@/lib/locale/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/owner";
import { ProfileAccountControls } from "@/components/profile-account-controls";
import { ProfileSettingsForm } from "@/components/profile-settings-form";

export async function generateMetadata() { return localizeMetadata({ title: "Profile settings", robots: { index: false, follow: false } }); }
export default async function SettingsPage() {
  const t = await getMessages();
  const account = await getAccount();
  if (!account) redirect(loginHref("/settings"));
  if (!account.profile) redirect("/signup?next=/settings");
  const profile = account.profile;
  return <section className="site-container mx-auto w-full px-4 sm:px-6 lg:px-12 py-8 sm:py-12 space-y-6">
    <BackLink className="inline-flex min-h-11 items-center text-primary font-label-md text-label-md" href="/profile">← {t("Back")}</BackLink>
    <h1 className="font-headline-xl text-headline-xl break-words">{t("Profile settings")}</h1>
    <Link href="/profile/import/steam" className="inline-flex min-h-11 items-center rounded-xl bg-primary/10 text-primary px-5 py-3">{t("Import from Steam")}</Link>
    <ProfileSettingsForm profile={{ id: String(profile.id), handle: profile.handle, displayName: profile.display_name, isPublic: profile.is_public, isDiscoverable:profile.is_discoverable, isSample: false, avatarUrl: avatarSource(profile.id, profile.avatar_url), bio: profile.bio, location: profile.location, platformPreference: profile.platform_preference }} />
    <section aria-labelledby="export-title" className="rounded-xl bg-surface-container-low p-5 sm:p-8 space-y-4">
      <h2 id="export-title" className="font-headline-lg text-headline-lg">{t("Export your data")}</h2>
      <p className="text-on-surface-variant">{t("Download your game logs, personal ranking, score ranges and favorites.")}</p>
      <div className="flex flex-wrap gap-3">
        <a href="/api/profile/export?format=json" download className="inline-flex min-h-11 items-center rounded-lg bg-primary-container text-on-primary-container px-4 py-3">{t("Full copy (JSON)")}</a>
        <a href="/api/profile/export?format=csv" download className="inline-flex min-h-11 items-center rounded-lg bg-surface-container-high text-on-surface px-4 py-3">{t("Spreadsheet (CSV)")}</a>
      </div>
    </section>
    <section aria-labelledby="account-title" className="rounded-xl bg-surface-container-low p-5 sm:p-8 space-y-4">
      <h2 id="account-title" className="font-headline-lg text-headline-lg">{t("Account")}</h2>
      <p className="text-body-sm text-on-surface-variant">{t("Sign out of this device, or permanently delete your account and personal data.")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl"><ProfileAccountControls handle={profile.handle} /></div>
    </section>
  </section>;
}
