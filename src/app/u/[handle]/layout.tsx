import { siteUrl, noIndex } from "@/lib/site-url";
import { getMessages } from "@/lib/locale/server";
import type { Metadata } from "next";
import Link from "next/link";
import { ProfileAvatar } from "@/components/profile-avatar";
import {ProfileSocial} from "@/components/profile-social";
import { ProfileNavigation } from "@/components/profile-navigation";
import { notFound } from "next/navigation";
import { getPublicPortfolio } from "@/lib/public-portfolio";
import { PortfolioProvider } from "@/components/portfolio-provider";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const t = await getMessages();
  const portfolio = await getPublicPortfolio((await params).handle);
  if (!portfolio) return { title: t("Profile unavailable"), robots: { index: false, follow: false } };
  const title = `${t("Portfolio")} · ${portfolio.profile.displayName}`;
  return { robots:noIndex, alternates:{canonical:siteUrl(portfolio.publicBase!)}, title, description: t("Public game ratings, tiers and reviews."), openGraph: { url:siteUrl(portfolio.publicBase!), title, description: t("Public gaming portfolio on Playlogg.") } };
}
export default async function PublicProfileLayout({ params, children }: { params: Promise<{ handle: string }>; children: React.ReactNode }) {
  const portfolio = await getPublicPortfolio((await params).handle);
  if (!portfolio) notFound();
  const t = await getMessages();
  return <PortfolioProvider portfolio={portfolio}>
    <div className="site-container mx-auto px-4 sm:px-6 lg:px-12 pt-6">
      <ProfileNavigation />
      <div className="flex justify-end pt-4">
        <Link href={portfolio.publicBase!} aria-label={`${t("Viewing profile")} ${portfolio.profile.displayName}`} className="flex min-w-0 max-w-full items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3">
          <div className="min-w-0 text-right">
            <p className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">{t("Viewing profile")}</p>
            <p translate="no" className="text-headline-md font-headline-md font-semibold break-words">{portfolio.profile.displayName}</p>
            <p translate="no" className="text-body-sm text-primary break-all">@{portfolio.profile.handle}</p>
          </div>
          <ProfileAvatar name={portfolio.profile.displayName} src={portfolio.profile.avatarUrl} className="h-11 w-11 rounded-xl" />
        </Link>
      </div>
      {portfolio.profile.isDiscoverable&&<div className="pt-4"><ProfileSocial target={Number(portfolio.profile.id)}/></div>}</div>
    {children}
  </PortfolioProvider>;
}
