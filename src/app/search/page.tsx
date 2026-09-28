import type { Metadata } from "next";
import { SearchScreen } from "@/components/screens/search-screen";
import { getGame } from "@/data/prototype";
export const metadata: Metadata = { title: "Search the archive", description: "Search the sample game catalog, profiles and prototype commands." };

function safeReturnPath(value?: string): string {
  if (value && ["/", "/profile", "/tiers", "/compare", "/log"].includes(value)) return value;
  if (value?.startsWith("/game/") && getGame(value.slice(6))) return value;
  return "/";
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; from?: string; mode?: string }> }) {
  const query = await searchParams;
  return <SearchScreen key={`${query.q}-${query.mode}`} initialQuery={query.q ?? "cyber"} returnPath={safeReturnPath(query.from)} mode={query.mode === "log" ? "log" : "browse"} />;
}
