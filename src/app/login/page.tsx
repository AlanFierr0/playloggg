import { localizeMetadata } from "@/lib/locale/server";
import { getMessages } from "@/lib/locale/server";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { getAccount } from "@/lib/owner";
import { signOut } from "@/app/actions/auth";

export async function generateMetadata() { return localizeMetadata({ title: "Sign in", robots: { index: false, follow: false } }); }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const t = await getMessages();
  const owner = await getAccount();
  const { error } = await searchParams;
  return <section className="mx-auto max-w-md px-4 sm:px-6 py-8 sm:py-16">
    <div className="space-y-6 break-words rounded-xl bg-surface-container-low p-5 sm:p-8">
      <h1 className="font-headline-xl text-headline-xl text-on-surface">{owner ? t("Your account") : t("Sign in")}</h1>
      {owner ? <>
        <p className="text-on-surface-variant">{owner.profile ? t(`Signed in as ${owner.profile.display_name}.`) : t("You're signed in. Finish setting up your private profile.")}</p>
        <Link href={owner.profile ? "/profile" : "/signup"} className="block text-primary">{owner.profile ? t("Open profile") : t("Create your profile")}</Link>
        {owner.profile && <Link href="/settings" className="block text-primary">{t("Profile settings and visibility")}</Link>}
        <form action={signOut}><button className="rounded bg-surface-container px-4 py-2 text-on-surface">{t("Sign out")}</button></form>
      </> : <>
        <p className="font-body-md text-body-md text-on-surface-variant">{t("Sign in with Steam to create your own private gaming portfolio and save ratings, tiers, reviews and lists.")}</p>
        {error && <p role="alert" className="text-on-surface-variant">{error === "signout" ? t("Sign-out failed. Please try again.") : error === "steam-config" ? t("Steam sign-in is not configured yet.") : error === "steam" ? t("Steam sign-in was cancelled or could not be verified. Please try again.") : t("That sign-in link is invalid or expired. Request a new one.")}</p>}
        <form action="/auth/steam" method="post"><button type="submit" className="w-full rounded bg-primary-container px-5 py-3 font-label-md text-on-primary-container">{t("Sign in with Steam")}</button></form>
        <div className="border-t border-outline-variant/20 pt-5 space-y-4"><p className="font-body-sm text-body-sm text-on-surface-variant">{t("Existing site owner? You can still sign in with your email link.")}</p>
        <LoginForm />
        </div>
      </>}
    </div>
  </section>;
}
