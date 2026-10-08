import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPublicPortfolio } from "@/lib/public-portfolio";
import { ProfileHotTake } from "@/components/profile-hot-take";
import { ProfileOverviewScreen } from "@/components/screens/profile-overview-screen";
export default async function PublicProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const portfolio = await getPublicPortfolio((await params).handle);
  if (!portfolio) notFound();
  return <ProfileOverviewScreen hotTake={<Suspense fallback={null}><ProfileHotTake portfolio={portfolio} /></Suspense>} />;
}
