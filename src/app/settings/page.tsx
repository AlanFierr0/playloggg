import { avatarSource } from "@/lib/avatar-input";
import { localizeMetadata } from "@/lib/locale/server";
import { getMessages } from "@/lib/locale/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/owner";
import { ProfileSettingsForm } from "@/components/profile-settings-form";

export async function generateMetadata() { return localizeMetadata({ title: "Profile settings", robots: { index: false, follow: false } }); }
export default async function SettingsPage() {
  const t = await getMessages();
  const account = await getAccount();
  if (!account) redirect("/login");
  if (!account.profile) redirect("/signup");
  const profile = account.profile;
  return <section className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12 space-y-6">
    <Link className="text-primary font-label-md text-label-md" href="/profile">{t("← My portfolio")}</Link>
    <h1 className="font-headline-xl text-headline-xl break-words">{t("Profile settings")}</h1>
    <ProfileSettingsForm profile={{ id: String(profile.id), handle: profile.handle, displayName: profile.display_name, isPublic: profile.is_public, isDiscoverable:profile.is_discoverable, isSample: false, avatarUrl: avatarSource(profile.id, profile.avatar_url), bio: profile.bio, location: profile.location, platformPreference: profile.platform_preference }} />
  </section>;
}
