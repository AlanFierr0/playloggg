import { gamesQuery, parseGamesQuery } from "@/lib/games-query";
import { localizeMetadata } from "@/lib/locale/server";
import { SearchScreen } from "@/components/screens/search-screen";
import { getSearchPortfolio, getCatalogGame } from "@/lib/portfolio";
export async function generateMetadata() { return localizeMetadata({ title: "Search the archive", description: "Search games and profiles. Sign in to find and import missing games." }); }

async function safeReturnPath(value?: string): Promise<string> {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  const url = new URL(value, "https://playlogg.invalid"), path = url.pathname;
  if (url.origin !== "https://playlogg.invalid") return "/";
  const query = new URLSearchParams();
  if (path === "/games") {
    const state = parseGamesQuery(url.searchParams);
    const params = gamesQuery(state.filters, state.page);
    return `/games${params ? `?${params}` : ""}`;
  }
  if (path === "/compare") {
    for (const key of ["left", "right"]) {
      const handle = (url.searchParams.get(key) ?? "").trim().toLowerCase();
      if (/^[a-z0-9][a-z0-9_]{2,29}$/.test(handle)) query.set(key,handle);
    }
    const page = url.searchParams.get("page");
    if (page && /^[1-9]\d{0,6}$/.test(page)) query.set("page",page);
  } else if (path === "/people") {
    const text = (url.searchParams.get("q") ?? "").slice(0,80);
    if (text) query.set("q",text);
    const page = url.searchParams.get("page");
    if (page && /^[1-9]\d{0,5}$/.test(page)) query.set("page",page);
  } else if (path === "/log") {
    const slug = url.searchParams.get("game");
    if (slug && await getCatalogGame(slug)) query.set("game",slug);
  } else if (path.startsWith("/game/")) {
    return await getCatalogGame(path.slice(6)) ? path : "/";
  } else if (!/^\/u\/[a-z0-9][a-z0-9_]{2,29}(?:\/(?:ranking|tiers|reviews|stats|favorites)|\/game\/[a-z0-9]+(?:-[a-z0-9]+)*)?$/.test(path)
    && !["/", "/profile", "/profile/ranking", "/profile/reviews", "/profile/stats", "/profile/favorites", "/profile/social", "/profile/import/steam", "/settings", "/tiers"].includes(path)) return "/";
  return `${path}${query.size ? `?${query}` : ""}`;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; from?: string; mode?: string }> }) {
  const query = await searchParams;
  const initialQuery = query.q ?? (query.mode === "log" ? "" : "cyber");
  return <SearchScreen portfolio={getSearchPortfolio(initialQuery, 0, query.mode === "log")} key={`${query.q}-${query.mode}`} initialQuery={initialQuery} returnPath={await safeReturnPath(query.from)} mode={query.mode === "log" ? "log" : "browse"} />;
}
