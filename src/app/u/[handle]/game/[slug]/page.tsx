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
