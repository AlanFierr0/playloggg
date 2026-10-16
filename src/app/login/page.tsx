import { navigationPath } from "@/lib/return-navigation";
import { localizeMetadata } from "@/lib/locale/server";
import { getMessages } from "@/lib/locale/server";
import Link from "next/link";
import { PasswordForm } from "@/components/password-form";
import { getAccount } from "@/lib/owner";
import { signOut } from "@/app/actions/auth";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ mode?: string; deleted?: string }> }) {
  const { mode, deleted } = await searchParams;
  return localizeMetadata({ title: mode === "register" || deleted === "1" ? "Create account" : "Sign in", robots: { index: false, follow: false } });
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; deleted?: string; mode?: string; next?: string }> }) {
  const t = await getMessages();
  const owner = await getAccount();
  const { error, deleted, mode, next: rawNext } = await searchParams;
  const next = navigationPath(rawNext) ?? "";
  const registering = deleted === "1" || mode === "register";
  return <section className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-16">
    <div className="grid md:grid-cols-2 overflow-hidden rounded-2xl bg-surface-container-low"><aside className="hidden md:flex bg-gradient-to-br from-primary/10 via-surface-container-high to-surface-container-low p-6 sm:p-10 flex-col justify-center gap-6"><span aria-hidden="true" className="material-symbols-outlined text-primary text-[48px]">sports_esports</span><p className="font-display-lg text-display-lg tracking-tight">{t("Your games. Your taste. Your identity.")}</p><p className="text-on-surface-variant text-body-lg">{t("Rate what you play, feature your favorites and compare your gaming taste.")}</p></aside><div className="space-y-6 break-words p-5 sm:p-10">
      <h1 className="font-headline-xl text-headline-xl text-on-surface">{t(owner ? "Your account" : registering ? "Create account" : "Sign in")}</h1>
      {owner ? <>
        <p className="text-on-surface-variant">{owner.profile ? t(`Signed in as ${owner.profile.display_name}.`) : t("You're signed in. Finish setting up your public profile.")}</p>
        <Link href={owner.profile ? next || "/profile" : `/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="block text-primary">{owner.profile ? t("Open profile") : t("Create your profile")}</Link>
        {owner.profile && <Link href="/settings" className="block text-primary">{t("Profile settings and visibility")}</Link>}
        <form action={signOut}><button className="rounded bg-surface-container px-4 py-2 text-on-surface">{t("Sign out")}</button></form>
      </> : <>
        <p className="font-body-md text-body-md text-on-surface-variant">{t(registering ? "Start with Steam or email. Your profile starts empty and public." : "Choose how you want to sign in.")}</p>
        {error && <p role="alert" className="text-on-surface-variant">{error === "signout" ? t("Sign-out failed. Please try again.") : error === "steam-config" ? t("Steam sign-in is not configured yet.") : error === "steam" ? t("Steam sign-in was cancelled or could not be verified. Please try again.") : t("That email link is invalid or expired. Request a new one.")}</p>}
        <form action="/auth/steam" method="post"><input type="hidden" name="next" value={next} /><button type="submit" className="w-full rounded bg-primary-container px-5 py-3 font-label-md text-on-primary-container">{t("Sign in with Steam")}</button></form>
        <div className="flex items-center gap-4 text-on-surface-variant text-body-sm"><span className="h-px flex-1 bg-outline-variant/30" />{t("or use email")}<span className="h-px flex-1 bg-outline-variant/30" /></div>{deleted === "1" && <p role="status" className="text-primary">{t("Your account has been deleted. Create a new account to start again.")}</p>}<PasswordForm key={registering ? "register" : "signin"} initialMode={registering ? "register" : "signin"} next={next} />
      </>}
    </div></div>
  </section>;
}
