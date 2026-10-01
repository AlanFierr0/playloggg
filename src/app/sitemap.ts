import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/portfolio";
import { siteUrl } from "@/lib/site-url";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const games = await getCatalog();
  return ["/", "/games", ...games.map(game => `/game/${game.slug}`)].map(path => ({url:siteUrl(path)}));
}
