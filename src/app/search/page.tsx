import { gamesQuery, parseGamesQuery } from "@/lib/games-query";
import { localizeMetadata } from "@/lib/locale/server";
import { SearchScreen } from "@/components/screens/search-screen";
import { getSearchPortfolio, getCatalogGame } from "@/lib/portfolio";
export async function generateMetadata() { return localizeMetadata({ title: "Search the archive", description: "Search games and profiles. Sign in to find and import missing games." }); }

async function safeReturnPath(value?: string): Promise<string> {
  if (value && ["/", "/games", "/profile", "/tiers", "/compare", "/log"].includes(value)) return value;
  if (value?.startsWith("/games?")) {
    const state = parseGamesQuery(new URLSearchParams(value.slice(7)));
    const query = gamesQuery(state.filters, state.page);
    return `/games${query ? `?${query}` : ""}`;
  }
  if (value?.startsWith("/game/") && await getCatalogGame(value.slice(6))) return value;
  return "/";
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; from?: string; mode?: string }> }) {
  const query = await searchParams;
  const initialQuery = query.q ?? (query.mode === "log" ? "" : "cyber");
  return <SearchScreen portfolio={getSearchPortfolio(initialQuery, 0, query.mode === "log")} key={`${query.q}-${query.mode}`} initialQuery={initialQuery} returnPath={await safeReturnPath(query.from)} mode={query.mode === "log" ? "log" : "browse"} />;
}
