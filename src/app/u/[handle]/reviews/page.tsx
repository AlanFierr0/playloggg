import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPublicPortfolio } from "@/lib/public-portfolio";
import { getReviewHelpfulness } from "@/lib/review-helpfulness";
import { notFound } from "next/navigation";
import { ProfileDetailsScreen } from "@/components/screens/profile-details-screen";
import { publicPageMetadata } from "@/lib/public-page-metadata";
export async function generateMetadata({params}: {params:Promise<{handle:string}>}) {return publicPageMetadata((await params).handle,"/reviews","Reviews");}
export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const portfolio = await getPublicPortfolio((await params).handle);
  if (!portfolio) notFound();
  const reviewHelpfulness = await getReviewHelpfulness(Number(portfolio.profile.id));
  return <PortfolioProvider portfolio={{ ...portfolio, reviewHelpfulness }}><ProfileDetailsScreen section="reviews" /></PortfolioProvider>;
}
