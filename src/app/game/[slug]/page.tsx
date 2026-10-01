import { getMessages } from "@/lib/locale/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameScreen } from "@/components/screens/game-screen";
import { getCatalog, getPortfolioShell, getPublicGame } from "@/lib/portfolio";

export async function generateStaticParams() { return (await getCatalog()).map((game) => ({ slug: game.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = await getMessages();
  const { slug } = await params;
  const game = await getPublicGame(slug);
  if (!game) return { title: t("Game not found") };
  const description = `${game.title}${game.year ? ` (${game.year})` : ""} · ${t("Game details on Playlogg.")}`;
  return { title: game.title, description, openGraph: { title: game.title, description, images: [{ url: game.cover, alt: game.title }] } };
}
export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await getPublicGame(slug);
  if (!game) notFound();
  const portfolio = await getPortfolioShell();
  return <GameScreen game={game} isSample={portfolio.profile.isSample} />;
}
