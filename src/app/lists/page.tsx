import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPersonalPortfolio } from "@/lib/portfolio";
import { localizeMetadata } from "@/lib/locale/server";
import { CollectionsScreen } from "@/components/screens/collections-screen";
export async function generateMetadata() { return localizeMetadata({ title: "Curated lists" }); }
export default async function ListsPage() { return <PortfolioProvider portfolio={await getPersonalPortfolio()}><CollectionsScreen /></PortfolioProvider>; }
