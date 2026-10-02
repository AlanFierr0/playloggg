import { localizeMetadata } from "@/lib/locale/server";
import { ReviewScreen } from "@/components/screens/review-screen";
import { getPortfolio, getPublicGame } from "@/lib/portfolio";
import { PortfolioProvider } from "@/components/portfolio-provider";
import { SearchScreen } from "@/components/screens/search-screen";
import { notFound } from "next/navigation";
export async function generateMetadata() { return localizeMetadata({ title: "Log a game", description: "Rate a game, choose an independent tier, and write a review." }); }
export default async function LogPage({ searchParams }: { searchParams: Promise<{ game?: string }> }) {
  const query = await searchParams;
  if (!query.game) {
    const portfolio = await getPortfolio();
    return <PortfolioProvider portfolio={portfolio}><SearchScreen initialQuery="" returnPath={portfolio.access?.canEdit ? "/profile" : "/"} mode="log" /></PortfolioProvider>;
  }
  const game = await getPublicGame(query.game);
  if (!game) notFound();
  return <ReviewScreen key={game.slug} game={game} />;
}
