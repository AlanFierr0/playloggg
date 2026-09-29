import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { getOwner } from "@/lib/owner";
import { signOut } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Owner sign-in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const owner = await getOwner();
  const { error } = await searchParams;
  return <section className="mx-auto max-w-md px-6 py-16">
    <div className="space-y-6 rounded-xl bg-surface-container-low p-6 sm:p-8">
      <h1 className="font-headline-xl text-headline-xl text-on-surface">Owner sign-in</h1>
      {owner ? <>
        <p className="text-on-surface-variant">{owner.profile ? `Signed in as ${owner.profile.display_name}.` : "You're signed in. Your personal profile still needs to be linked to this account."}</p>
        <Link href="/profile" className="block text-primary">Open profile</Link>
        <form action={signOut}><button className="rounded bg-surface-container px-4 py-2 text-on-surface">Sign out</button></form>
      </> : <>
        <p className="font-body-md text-body-md text-on-surface-variant">Sign in with an email link to save your ratings, tiers, and reviews. Access is currently limited to the owner.</p>
        {error && <p role="alert" className="text-on-surface-variant">{error === "signout" ? "Sign-out failed. Please try again." : "That sign-in link is invalid or expired. Request a new one."}</p>}
        <LoginForm />
      </>}
    </div>
  </section>;
}
