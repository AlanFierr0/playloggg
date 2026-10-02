import { siteUrl, noIndex } from "@/lib/site-url";
import { getMessages } from "@/lib/locale/server";
import type { Metadata } from "next";
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
  return <PortfolioProvider portfolio={portfolio}>
    <div className="site-container mx-auto px-4 sm:px-6 lg:px-12 pt-6"><ProfileNavigation />{portfolio.profile.isDiscoverable&&<div className="pt-4"><ProfileSocial target={Number(portfolio.profile.id)}/></div>}</div>
    {children}
  </PortfolioProvider>;
}
