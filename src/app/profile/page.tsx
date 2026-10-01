import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPersonalPortfolio } from "@/lib/portfolio";
import { localizeMetadata } from "@/lib/locale/server";
import { ProfileOverviewScreen } from "@/components/screens/profile-overview-screen";
export async function generateMetadata() { return localizeMetadata({ title: "My gaming identity", description: "Your gaming profile, independent favorites and saved entries.", robots: {index:false,follow:false} }); }
export default async function ProfilePage() { return <PortfolioProvider portfolio={await getPersonalPortfolio()}><ProfileOverviewScreen /></PortfolioProvider>; }
