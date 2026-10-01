import { publicPageMetadata } from "@/lib/public-page-metadata";
import { TiersScreen } from "@/components/screens/tiers-screen";
export default function PublicTiersPage() { return <TiersScreen />; }

export async function generateMetadata({params}:{params:Promise<{handle:string}>}) { return publicPageMetadata((await params).handle,"/tiers","Tiers"); }
