import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/owner";
import { ProfileSettingsForm } from "@/components/profile-settings-form";

export const metadata: Metadata = { title: "Profile settings", robots: { index: false, follow: false } };
export default async function SettingsPage() {
  const account = await getAccount();
  if (!account) redirect("/login");
  if (!account.profile) redirect("/signup");
  const profile = account.profile;
  return <section className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12 space-y-6">
    <Link className="text-primary font-label-md text-label-md" href="/profile">← My portfolio</Link>
    <h1 className="font-headline-xl text-headline-xl break-words">Profile settings</h1>
    <ProfileSettingsForm profile={{ id: String(profile.id), handle: profile.handle, displayName: profile.display_name, isPublic: profile.is_public, isSample: false }} />
  </section>;
}
