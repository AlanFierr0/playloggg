import { notFound } from "next/navigation";
import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPublicPortfolio } from "@/lib/public-portfolio";
import { FavoritesScreen } from "@/components/screens/favorites-screen";
import { publicPageMetadata } from "@/lib/public-page-metadata";
export async function generateMetadata({params}: {params:Promise<{handle:string}>}) {return publicPageMetadata((await params).handle,"/favorites","Favorites");}
export default async function Page({params}: {params:Promise<{handle:string}>}) {
 const portfolio=await getPublicPortfolio((await params).handle,"favorites");
 if(!portfolio)notFound();
 return <PortfolioProvider portfolio={portfolio}><FavoritesScreen /></PortfolioProvider>;
}
