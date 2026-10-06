import Link from "next/link";
import { redirect } from "next/navigation";
import { SteamLibraryImport } from "@/components/steam-library-import";
import { getMessages, localizeMetadata } from "@/lib/locale/server";
import { getAccount } from "@/lib/owner";
import { steamIdentity } from "@/lib/steam-library-input";

export async function generateMetadata() {return localizeMetadata({title:"Import from Steam",robots:{index:false,follow:false}});}
export default async function Page() {
  const [account,t] = await Promise.all([getAccount(),getMessages()]);
  if (!account) redirect("/login");
  if (!account.profile) redirect("/signup");
  const eligible = steamIdentity(account.user.app_metadata.playlogg_steam_id);
  return <section className="w-full site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 space-y-6">
    <Link href="/profile" className="inline-flex min-h-11 items-center text-primary">{t("← My portfolio")}</Link>
    <h1 className="font-headline-xl text-headline-xl">{t("Import from Steam")}</h1>
    <p className="text-on-surface-variant">{t("Choose games to import with Steam playtime, then rate all, some or none of them. Existing entries are kept unchanged.")}</p>
    {eligible ? <SteamLibraryImport key={account.profile.id} profileId={account.profile.id} configured={Boolean(process.env.STEAM_WEB_API_KEY)} /> : <p role="status" className="rounded-xl bg-surface-container-low p-6">{t("Sign in with Steam to import your library. Email accounts cannot connect Steam yet.")}</p>}
  </section>;
}
