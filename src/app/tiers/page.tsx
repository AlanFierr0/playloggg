import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPersonalPortfolio } from "@/lib/portfolio";
import { localizeMetadata } from "@/lib/locale/server";
import { TiersScreen } from "@/components/screens/tiers-screen";
export async function generateMetadata() { return localizeMetadata({ title: "Personal tier board", description: "A personal S, A, B, C, D and F game tier board." }); }
export default async function TiersPage() { return <PortfolioProvider portfolio={await getPersonalPortfolio()}><TiersScreen /></PortfolioProvider>; }
