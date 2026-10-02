import { getPortfolio } from "@/lib/portfolio";
import { gamesPage } from "@/lib/games-page";
import { parseGamesQuery } from "@/lib/games-query";
import { localizeMetadata } from "@/lib/locale/server";
import { GamesScreen } from "@/components/screens/games-screen";

import { getPortfolioShell } from "@/lib/portfolio";
import { siteUrl } from "@/lib/site-url";
export async function generateMetadata({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const [query,shell]=await Promise.all([searchParams,getPortfolioShell()]);
  const index=!shell.access?.signedIn && Object.keys(query).length===0;
  return localizeMetadata({ title:"Games", description:"Browse the saved game catalog by title, genre, platform and release year, or filter by your log entries.", robots:{index,follow:true},alternates:{canonical:siteUrl("/games")},openGraph:{title:"Games | Playlogg",description:"Browse games in the Playlogg catalog.",url:siteUrl("/games")} });
}
export default async function GamesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) if (value !== undefined) params.set(key, Array.isArray(value) ? value[0] : value);
  const { filters, page } = parseGamesQuery(params);
  const portfolio = await getPortfolio();
  return <GamesScreen data={gamesPage(portfolio.games, filters, page, 25)} profile={portfolio.profile} access={portfolio.access} />;
}
