import { notFound } from "next/navigation";
import { CollectionsScreen } from "@/components/screens/collections-screen";
import { getList } from "@/lib/collections";
import { getCatalog, getPortfolio } from "@/lib/portfolio";
export const metadata = { title: "Curated list" };
export default async function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  const portfolio = await getPortfolio();
  const list = await getList(Number(portfolio.profile.id), Number(id));
  if (!list) notFound();
  const catalog = await getCatalog();
  const byId = new Map(catalog.map((game) => [game.id, game.slug]));
  const slugs = list.gameIds.map((gameId) => byId.get(gameId));
  if (slugs.some((slug) => slug === undefined)) throw new Error("Some list games could not be loaded.");
  return <CollectionsScreen key={list.id} initial={{ id: list.id, name: list.name, revision: list.revision, slugs: slugs as string[] }} />;
}
