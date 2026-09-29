import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { getAccount } from "@/lib/owner";
import { signOut } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const owner = await getAccount();
  const { error } = await searchParams;
  return <section className="mx-auto max-w-md px-4 sm:px-6 py-8 sm:py-16">
    <div className="space-y-6 break-words rounded-xl bg-surface-container-low p-5 sm:p-8">
      <h1 className="font-headline-xl text-headline-xl text-on-surface">{owner ? "Your account" : "Sign in"}</h1>
      {owner ? <>
        <p className="text-on-surface-variant">{owner.profile ? `Signed in as ${owner.profile.display_name}.` : "You're signed in. Finish setting up your private profile."}</p>
        <Link href={owner.profile ? "/profile" : "/signup"} className="block text-primary">{owner.profile ? "Open profile" : "Create your profile"}</Link>
        {owner.profile && <Link href="/settings" className="block text-primary">Profile settings and visibility</Link>}
        <form action={signOut}><button className="rounded bg-surface-container px-4 py-2 text-on-surface">Sign out</button></form>
      </> : <>
        <p className="font-body-md text-body-md text-on-surface-variant">Sign in with Steam to create your own private gaming portfolio and save ratings, tiers, reviews and lists.</p>
        {error && <p role="alert" className="text-on-surface-variant">{error === "signout" ? "Sign-out failed. Please try again." : error === "steam-config" ? "Steam sign-in is not configured yet." : error === "steam" ? "Steam sign-in was cancelled or could not be verified. Please try again." : "That sign-in link is invalid or expired. Request a new one."}</p>}
        <form action="/auth/steam" method="post"><button type="submit" className="w-full rounded bg-primary-container px-5 py-3 font-label-md text-on-primary-container">Sign in with Steam</button></form>
        <div className="border-t border-outline-variant/20 pt-5 space-y-4"><p className="font-body-sm text-body-sm text-on-surface-variant">Existing site owner? You can still sign in with your email link.</p>
        <LoginForm />
        </div>
      </>}
    </div>
  </section>;
}
