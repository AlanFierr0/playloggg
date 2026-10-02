import { localizeMetadata } from "@/lib/locale/server";
import { getMessages } from "@/lib/locale/server";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/owner";
import { ProfileAccountControls } from "@/components/profile-account-controls";
import { ProfileSetupForm } from "@/components/profile-setup-form";
export async function generateMetadata() { return localizeMetadata({ title: "Create your profile", robots: { index: false, follow: false } }); }
export default async function SignupPage() {
  const t = await getMessages();
  const account = await getAccount();
  if (!account) redirect("/login");
  if (account.profile) redirect("/profile");
  return <section className="mx-auto max-w-md px-4 sm:px-6 py-8 sm:py-16"><div className="space-y-6 rounded-xl bg-surface-container-low p-5 sm:p-8"><h1 className="font-headline-xl text-headline-xl">{t("Create your profile")}</h1><p className="text-on-surface-variant">{t("Choose a name for your gaming portfolio.")}</p><ProfileSetupForm /></div><section className="mt-8 space-y-4 rounded-xl border border-error/25 bg-surface-container-low p-5 sm:p-8"><h2 className="font-headline-lg text-headline-lg text-error">{t("Danger zone")}</h2><ProfileAccountControls /></section></section>;
}
