import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPersonalPortfolio } from "@/lib/portfolio";
import { localizeMetadata } from "@/lib/locale/server";
import { RankingsScreen } from "@/components/screens/rankings-screen";
export async function generateMetadata() { return localizeMetadata({title:"Score ranking",robots:{index:false,follow:false}}); }
export default async function Page() { return <PortfolioProvider portfolio={await getPersonalPortfolio(false)}><RankingsScreen /></PortfolioProvider>; }
