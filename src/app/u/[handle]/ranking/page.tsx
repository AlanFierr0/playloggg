import { notFound } from "next/navigation";
import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPublicPortfolio } from "@/lib/public-portfolio";
import { RankingsScreen } from "@/components/screens/rankings-screen";
import { publicPageMetadata } from "@/lib/public-page-metadata";
export async function generateMetadata({params}: {params:Promise<{handle:string}>}) {return publicPageMetadata((await params).handle,"/ranking","Score ranking");}
export default async function Page({params}: {params:Promise<{handle:string}>}) {
 const portfolio=await getPublicPortfolio((await params).handle,"ranking");
 if(!portfolio)notFound();
 return <PortfolioProvider portfolio={portfolio}><RankingsScreen /></PortfolioProvider>;
}
