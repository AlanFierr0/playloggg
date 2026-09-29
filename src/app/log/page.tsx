import type { Metadata } from "next";
import { ReviewScreen } from "@/components/screens/review-screen";
import { getPublicGame } from "@/lib/portfolio";
import { notFound } from "next/navigation";
export const metadata: Metadata = { title: "Log a game", description: "Rate a game, choose an independent tier, and write a review." };
export default async function LogPage({ searchParams }: { searchParams: Promise<{ game?: string }> }) {
  const query = await searchParams;
  const game = await getPublicGame(query.game ?? "metaphor-refantazio");
  if (!game) notFound();
  return <ReviewScreen key={game.slug} game={game} />;
}
