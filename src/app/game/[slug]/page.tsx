import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameScreen } from "@/components/screens/game-screen";
import { getPortfolio, getPublicGame } from "@/lib/portfolio";

export async function generateStaticParams() { return (await getPortfolio()).games.map((game) => ({ slug: game.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = await getPublicGame(slug);
  if (!game) return { title: "Game not found" };
  const description = `${game.title}${game.year ? ` (${game.year})` : ""} — sample game detail and ratings on Playlogg.`;
  return { title: game.title, description, openGraph: { title: game.title, description, images: [{ url: game.cover, alt: game.title }] } };
}
export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await getPublicGame(slug);
  if (!game) notFound();
  return <GameScreen game={game} />;
}
