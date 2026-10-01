import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPortfolio } from "@/lib/portfolio";
import { localizeMetadata } from "@/lib/locale/server";
import { ProfileDetailsScreen } from "@/components/screens/profile-details-screen";
export async function generateMetadata() { return localizeMetadata({title:"Reviews",robots:{index:false,follow:false}}); }
export default async function Page() { return <PortfolioProvider portfolio={await getPortfolio()}><ProfileDetailsScreen section="reviews" /></PortfolioProvider>; }
