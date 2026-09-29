import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/owner";
import { ProfileSetupForm } from "@/components/profile-setup-form";
export const metadata: Metadata = { title: "Create your profile", robots: { index: false, follow: false } };
export default async function SignupPage() {
  const account = await getAccount();
  if (!account) redirect("/login");
  if (account.profile) redirect("/profile");
  return <section className="mx-auto max-w-md px-4 sm:px-6 py-8 sm:py-16"><div className="space-y-6 rounded-xl bg-surface-container-low p-5 sm:p-8"><h1 className="font-headline-xl text-headline-xl">Create your profile</h1><p className="text-on-surface-variant">Choose a name for your gaming portfolio. Your profile starts private and empty; your ratings and lists belong to you.</p><ProfileSetupForm /></div></section>;
}
