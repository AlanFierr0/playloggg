import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPortfolio } from "@/lib/portfolio";
import { localizeMetadata } from "@/lib/locale/server";
import { RankingsScreen } from "@/components/screens/rankings-screen";
export async function generateMetadata() { return localizeMetadata({ title: "My rankings", description: "Personal game rankings and ratings. Sample profile for the Playlogg prototype." }); }
export default async function ProfilePage() { return <PortfolioProvider portfolio={await getPortfolio()}><RankingsScreen /></PortfolioProvider>; }
