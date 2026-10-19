import { getReviewHelpfulness } from "@/lib/review-helpfulness";
import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPersonalPortfolio } from "@/lib/portfolio";
import { localizeMetadata } from "@/lib/locale/server";
import { ProfileDetailsScreen } from "@/components/screens/profile-details-screen";
export async function generateMetadata() { return localizeMetadata({title:"Reviews",robots:{index:false,follow:false}}); }
export default async function Page() { const portfolio = await getPersonalPortfolio(true, "/profile/reviews");
  const reviewHelpfulness = await getReviewHelpfulness(Number(portfolio.profile.id));
  return <PortfolioProvider portfolio={{ ...portfolio, reviewHelpfulness }}><ProfileDetailsScreen section="reviews" /></PortfolioProvider>; }
