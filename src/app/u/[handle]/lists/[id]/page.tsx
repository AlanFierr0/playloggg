import { cache } from "react";
import { getMessages } from "@/lib/locale/server";
import { siteUrl, noIndex } from "@/lib/site-url";
import { notFound } from "next/navigation";
import { getPublicList } from "@/lib/public-portfolio";
import {ListLike} from "@/components/list-like";
import { CollectionsScreen } from "@/components/screens/collections-screen";
const readList=cache(getPublicList);
export async function generateMetadata({params}:{params:Promise<{handle:string;id:string}>}) {
 const {handle,id}=await params; const [list,t]=await Promise.all([readList(handle,id),getMessages()]);
 if(!list) return {title:t("Profile unavailable"),robots:noIndex,openGraph:{title:t("Profile unavailable")}};
 const url=siteUrl(`/u/${handle}/lists/${id}`);
 return {title:list.name,robots:noIndex,alternates:{canonical:url},openGraph:{title:list.name,url,description:t("Public curated game list on Playlogg.")}};
}
export default async function PublicListPage({ params }: { params: Promise<{ handle: string; id: string }> }) {
  const { handle, id } = await params;
  const list = await readList(handle, id);
  if (!list) notFound();
  return <><CollectionsScreen key={list.id} initial={list} /><ListLike id={list.id}/></>;
}
