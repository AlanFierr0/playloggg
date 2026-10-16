import { getMessages } from "@/lib/locale/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogGameScreen } from "@/components/screens/catalog-game-screen";
import { getCatalogGame, portfolioGames, getPortfolioShell, getPublicGame } from "@/lib/portfolio";

import { siteUrl, noIndex } from "@/lib/site-url";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = await getMessages();
  const { slug } = await params;
  const row = await getCatalogGame(slug);
  const game = row ? portfolioGames([row],[])[0] : undefined;
  if (!game) return { title: t("Game not found"), robots:noIndex, openGraph:{title:t("Game not found"),images:[]} };
  const description = `${game.title}${game.year ? ` (${game.year})` : ""} · ${t("Game details on Playlogg.")}`;
  const shell=await getPortfolioShell();
  const url=siteUrl(`/game/${game.slug}`);
  return { title: game.title, description, robots:{index:!shell.access?.signedIn,follow:true},alternates:{canonical:url},twitter:{card:"summary_large_image",title:game.title,description,images:[game.cover]},openGraph: { title: game.title, description, url, images: [{ url: game.cover, alt: game.title }] } };
}
export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await getPublicGame(slug);
  if (!game) notFound();
  const portfolio = await getPortfolioShell();
  return <CatalogGameScreen game={game} isSample={Boolean(portfolio.profile.isSample)} />;
}
