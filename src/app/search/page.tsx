import { gamesQuery, parseGamesQuery } from "@/lib/games-query";
import { PortfolioProvider } from "@/components/portfolio-provider";
import { localizeMetadata } from "@/lib/locale/server";
import { SearchScreen } from "@/components/screens/search-screen";
import { getPortfolio, getPublicGame } from "@/lib/portfolio";
export async function generateMetadata() { return localizeMetadata({ title: "Search the archive", description: "Search the saved game catalog, profiles and lists. Owners can find and import games from IGDB." }); }

async function safeReturnPath(value?: string): Promise<string> {
  if (value && ["/", "/games", "/profile", "/tiers", "/compare", "/log"].includes(value)) return value;
  if (value?.startsWith("/games?")) {
    const state = parseGamesQuery(new URLSearchParams(value.slice(7)));
    const query = gamesQuery(state.filters, state.page);
    return `/games${query ? `?${query}` : ""}`;
  }
  if (value?.startsWith("/game/") && await getPublicGame(value.slice(6))) return value;
  return "/";
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; from?: string; mode?: string }> }) {
  const query = await searchParams;
  return <PortfolioProvider portfolio={await getPortfolio()}><SearchScreen key={`${query.q}-${query.mode}`} initialQuery={query.q ?? "cyber"} returnPath={await safeReturnPath(query.from)} mode={query.mode === "log" ? "log" : "browse"} /></PortfolioProvider>;
}
