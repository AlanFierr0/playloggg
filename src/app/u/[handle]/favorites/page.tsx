import { FavoritesScreen } from "@/components/screens/favorites-screen";
import { publicPageMetadata } from "@/lib/public-page-metadata";
export async function generateMetadata({params}: {params:Promise<{handle:string}>}) {return publicPageMetadata((await params).handle,"/favorites","Favorites");}
export default function Page() {return <FavoritesScreen />;}
