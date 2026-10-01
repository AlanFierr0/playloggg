import { siteUrl, noIndex } from "@/lib/site-url";
import { getMessages } from "@/lib/locale/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPortfolio } from "@/lib/public-portfolio";
import { PortfolioProvider } from "@/components/portfolio-provider";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const t = await getMessages();
  const portfolio = await getPublicPortfolio((await params).handle);
  if (!portfolio) return { title: t("Profile unavailable"), robots: { index: false, follow: false } };
  const title = `${t("Portfolio")} · ${portfolio.profile.displayName}`;
  return { robots:noIndex, alternates:{canonical:siteUrl(portfolio.publicBase!)}, title, description: t("Public game ratings, tiers, reviews and curated lists."), openGraph: { url:siteUrl(portfolio.publicBase!), title, description: t("Public gaming portfolio on Playlogg.") } };
}
export default async function PublicProfileLayout({ params, children }: { params: Promise<{ handle: string }>; children: React.ReactNode }) {
  const t = await getMessages();
  const portfolio = await getPublicPortfolio((await params).handle);
  if (!portfolio) notFound();
  const base = portfolio.publicBase!;
  return <PortfolioProvider portfolio={portfolio}>
    <nav aria-label={t("Public portfolio")} className="site-container mx-auto px-4 sm:px-6 lg:px-12 pt-6 flex flex-wrap gap-4 text-primary font-label-md text-label-md">
      <span className="max-w-full break-words text-on-surface-variant">@{portfolio.profile.handle}</span>
      <Link href={base}>{t("Rankings")}</Link><Link href={`${base}/tiers`}>{t("Tiers")}</Link><Link href={`${base}/lists`}>{t("Curated lists")}</Link>
    </nav>
    {children}
  </PortfolioProvider>;
}
