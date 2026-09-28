import type { Metadata } from "next";
import { ReviewScreen } from "@/components/screens/review-screen";
import { getGame } from "@/data/prototype";
import { notFound } from "next/navigation";
export const metadata: Metadata = { title: "Log a game", description: "Preview a rating and independently selected tier. Drafts reset on refresh." };
export default async function LogPage({ searchParams }: { searchParams: Promise<{ game?: string }> }) {
  const query = await searchParams;
  const game = getGame(query.game ?? "metaphor-refantazio");
  if (!game) notFound();
  return <ReviewScreen key={game.slug} game={game} />;
}
