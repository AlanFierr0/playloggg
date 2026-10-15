import { getMessages } from "@/lib/locale/server";
import { siteUrl, noIndex } from "@/lib/site-url";
import { notFound } from "next/navigation";
import { getPublicEntry } from "@/lib/public-portfolio";
import { CatalogGameScreen } from "@/components/screens/catalog-game-screen";
export default async function PublicEntryPage({ params }: { params: Promise<{ handle: string; slug: string }> }) {
  const { handle, slug } = await params;
  const portfolio = await getPublicEntry(handle,slug);
  const game = portfolio?.games.find((game) => game.slug === slug);
  if (!portfolio || !game) notFound();
  return <CatalogGameScreen game={game} isSample={Boolean(portfolio.profile.isSample)} publicProfile={portfolio.profile} />;
}

export async function generateMetadata({params}:{params:Promise<{handle:string;slug:string}>}) {
 const {handle,slug}=await params;
 const [portfolio,t]=await Promise.all([getPublicEntry(handle,slug),getMessages()]);
 const game=portfolio?.games.find(game=>game.slug===slug);
 if(!portfolio || !game) return {title:t("Profile unavailable"),robots:noIndex,openGraph:{title:t("Profile unavailable"),images:[]}};
 const title=`${game.title} · ${portfolio.profile.displayName}`;
 const description=t("Public saved game entry on Playlogg.");
 const url=siteUrl(`${portfolio.publicBase}/game/${game.slug}`);
 return {title,description,robots:noIndex,alternates:{canonical:url},openGraph:{title,description,url,images:[{url:game.cover,alt:game.title}]},twitter:{card:"summary_large_image" as const,title,description,images:[game.cover]}};
}
