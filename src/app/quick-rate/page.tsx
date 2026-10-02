import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPersonalPortfolio } from "@/lib/portfolio";
import { QuickRating } from "@/components/quick-rating";
import { localizeMetadata } from "@/lib/locale/server";
export async function generateMetadata() {
  return localizeMetadata({
    title: "Quick rating",
    robots: { index: false, follow: false },
  });
}
export default async function Page() {
  return (
    <PortfolioProvider portfolio={await getPersonalPortfolio()}>
      <QuickRating />
    </PortfolioProvider>
  );
}
