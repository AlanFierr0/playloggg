import { getPortfolio } from "@/lib/portfolio";
import { gamesPage } from "@/lib/games-page";
import { parseGamesQuery } from "@/lib/games-query";
import { localizeMetadata } from "@/lib/locale/server";
import { GamesScreen } from "@/components/screens/games-screen";

export async function generateMetadata() { return localizeMetadata({ title: "Games", description: "Browse the saved game catalog by title, genre, platform and release year, or filter by your log entries." }); }
export default async function GamesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) if (value !== undefined) params.set(key, Array.isArray(value) ? value[0] : value);
  const { filters, page } = parseGamesQuery(params);
  const portfolio = await getPortfolio();
  return <GamesScreen data={gamesPage(portfolio.games, filters, page)} profile={portfolio.profile} access={portfolio.access} />;
}
