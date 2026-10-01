import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/owner";
import { getMessages, localizeMetadata } from "@/lib/locale/server";
import { NewPasswordForm } from "@/components/password-form";
export async function generateMetadata() { return localizeMetadata({title: "Reset your password", robots: {index: false, follow: false}}); }
export default async function Page() {
  const account = await getAccount();
  if (!account || account.user.email?.endsWith(".invalid")) redirect("/login");
  const t = await getMessages();
  return <section className="mx-auto max-w-md px-4 py-12 space-y-6"><h1 className="text-headline-xl font-headline-xl">{t("Reset your password")}</h1><NewPasswordForm /><Link href="/login" className="text-primary underline">{t("Back to sign in")}</Link></section>;
}
