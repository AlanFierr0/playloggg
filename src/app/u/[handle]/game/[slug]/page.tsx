import { getMessages } from "@/lib/locale/server";
import { siteUrl, noIndex } from "@/lib/site-url";
import { getCatalogGame, portfolioGames } from "@/lib/portfolio";
import { notFound } from "next/navigation";
import { getPublicPortfolio } from "@/lib/public-portfolio";
import { CatalogGameScreen } from "@/components/screens/catalog-game-screen";
export default async function PublicEntryPage({ params }: { params: Promise<{ handle: string; slug: string }> }) {
  const { handle, slug } = await params;
  const portfolio = await getPublicPortfolio(handle);
  const game = portfolio?.games.find((game) => game.slug === slug);
  if (!portfolio || !game) notFound();
  const row = await getCatalogGame(slug);
  if (!row) notFound();
  const metadata = portfolioGames([row], [])[0];
  const detail = { ...metadata, score: game.score, tier: game.tier, review: game.review, status: game.status, logged: game.logged, platform: game.platform, hoursPlayed: game.hoursPlayed, completedOn: game.completedOn, tags: game.tags };
  return <CatalogGameScreen game={detail} isSample={Boolean(portfolio.profile.isSample)} publicProfile={portfolio.profile} />;
}

export async function generateMetadata({params}:{params:Promise<{handle:string;slug:string}>}) {
 const {handle,slug}=await params;
 const [portfolio,t]=await Promise.all([getPublicPortfolio(handle),getMessages()]);
 const game=portfolio?.games.find(game=>game.slug===slug);
 if(!portfolio || !game) return {title:t("Profile unavailable"),robots:noIndex,openGraph:{title:t("Profile unavailable"),images:[]}};
 const title=`${game.title} · ${portfolio.profile.displayName}`;
 const description=t("Public saved game entry on Playlogg.");
 const url=siteUrl(`${portfolio.publicBase}/game/${game.slug}`);
 return {title,description,robots:noIndex,alternates:{canonical:url},openGraph:{title,description,url,images:[{url:game.cover,alt:game.title}]},twitter:{card:"summary_large_image" as const,title,description,images:[game.cover]}};
}
