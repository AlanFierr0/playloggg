import { localizeMetadata } from "@/lib/locale/server";
import { ReviewScreen } from "@/components/screens/review-screen";
import { getSearchPortfolio, getPortfolioShell, getPublicGame } from "@/lib/portfolio";
import { SearchScreen } from "@/components/screens/search-screen";
import { notFound } from "next/navigation";
export async function generateMetadata() { return localizeMetadata({ title: "Log a game", description: "Rate a game, choose an independent tier, and write a review." }); }
export default async function LogPage({ searchParams }: { searchParams: Promise<{ game?: string }> }) {
  const query = await searchParams;
  if (!query.game) {
    const portfolio = await getPortfolioShell();
    return <SearchScreen portfolio={getSearchPortfolio("", 0, true)} initialQuery="" returnPath={portfolio.access?.canEdit ? "/profile" : "/"} mode="log" />;
  }
  const game = await getPublicGame(query.game);
  if (!game) notFound();
  return <ReviewScreen key={game.slug} game={game} />;
}
