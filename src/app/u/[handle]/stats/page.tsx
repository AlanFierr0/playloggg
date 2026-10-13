import { notFound } from "next/navigation";
import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPublicPortfolio } from "@/lib/public-portfolio";
import { ProfileDetailsScreen } from "@/components/screens/profile-details-screen";
import { publicPageMetadata } from "@/lib/public-page-metadata";
export async function generateMetadata({params}: {params:Promise<{handle:string}>}) {return publicPageMetadata((await params).handle,"/stats","Stats");}
export default async function Page({params}: {params:Promise<{handle:string}>}) {
 const portfolio=await getPublicPortfolio((await params).handle,"stats");
 if(!portfolio)notFound();
 return <PortfolioProvider portfolio={portfolio}><ProfileDetailsScreen section="stats" /></PortfolioProvider>;
}
