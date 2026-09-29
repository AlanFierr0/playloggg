import { notFound } from "next/navigation";
import { getPublicPortfolio } from "@/lib/public-portfolio";
import { CatalogGameScreen } from "@/components/screens/catalog-game-screen";
export default async function PublicEntryPage({ params }: { params: Promise<{ handle: string; slug: string }> }) {
  const { handle, slug } = await params;
  const portfolio = await getPublicPortfolio(handle);
  const game = portfolio?.games.find((game) => game.slug === slug);
  if (!portfolio || !game) notFound();
  return <CatalogGameScreen game={game} isSample={Boolean(portfolio.profile.isSample)} publicProfile={portfolio.profile} />;
}
