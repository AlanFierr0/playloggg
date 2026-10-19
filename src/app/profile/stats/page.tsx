import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPersonalPortfolio } from "@/lib/portfolio";
import { localizeMetadata } from "@/lib/locale/server";
import { ProfileDetailsScreen } from "@/components/screens/profile-details-screen";
export async function generateMetadata() { return localizeMetadata({title:"Stats",robots:{index:false,follow:false}}); }
export default async function Page() { return <PortfolioProvider portfolio={await getPersonalPortfolio(false, "/profile/stats")}><ProfileDetailsScreen section="stats" /></PortfolioProvider>; }
