import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPersonalPortfolio } from "@/lib/portfolio";
import { localizeMetadata } from "@/lib/locale/server";
import { FavoritesScreen } from "@/components/screens/favorites-screen";
export async function generateMetadata() { return localizeMetadata({title:"Favorites",robots:{index:false,follow:false}}); }
export default async function Page() { return <PortfolioProvider portfolio={await getPersonalPortfolio(false)}><FavoritesScreen /></PortfolioProvider>; }
