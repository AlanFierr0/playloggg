import { DiscoverProfiles } from "@/components/discover-profiles";
import { localizeMetadata } from "@/lib/locale/server";
export async function generateMetadata() {
  return localizeMetadata({
    title: "Explore profiles",
    robots: { index: false, follow: false },
  });
}
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const query = await searchParams;
  const page = /^[1-9]\d{0,5}$/.test(query.page ?? "") ? Number(query.page) : 1;
  return <DiscoverProfiles full page={page} />;
}
