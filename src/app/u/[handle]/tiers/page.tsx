import { notFound } from "next/navigation";
import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPublicPortfolio } from "@/lib/public-portfolio";
import { publicPageMetadata } from "@/lib/public-page-metadata";
import { TiersScreen } from "@/components/screens/tiers-screen";
export default async function Page({params}: {params:Promise<{handle:string}>}) {
 const portfolio=await getPublicPortfolio((await params).handle,"tiers");
 if(!portfolio)notFound();
 return <PortfolioProvider portfolio={portfolio}><TiersScreen /></PortfolioProvider>;
}

export async function generateMetadata({params}:{params:Promise<{handle:string}>}) { return publicPageMetadata((await params).handle,"/tiers","Tiers"); }
