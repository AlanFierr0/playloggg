import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPersonalPortfolio } from "@/lib/portfolio";
import { localizeMetadata } from "@/lib/locale/server";
import { ProfileTimelineScreen } from "@/components/screens/profile-timeline-screen";
export async function generateMetadata() { return localizeMetadata({ title: "Completion timeline", robots: { index: false, follow: false } }); }
export default async function Page() { return <PortfolioProvider portfolio={await getPersonalPortfolio(false)}><ProfileTimelineScreen /></PortfolioProvider>; }
