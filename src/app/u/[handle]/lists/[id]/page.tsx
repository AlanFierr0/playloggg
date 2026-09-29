import { notFound } from "next/navigation";
import { getPublicList } from "@/lib/public-portfolio";
import { CollectionsScreen } from "@/components/screens/collections-screen";
export default async function PublicListPage({ params }: { params: Promise<{ handle: string; id: string }> }) {
  const { handle, id } = await params;
  const list = await getPublicList(handle, id);
  if (!list) notFound();
  return <CollectionsScreen key={list.id} initial={list} />;
}
