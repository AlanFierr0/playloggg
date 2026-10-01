import { publicPageMetadata } from "@/lib/public-page-metadata";
import { CollectionsScreen } from "@/components/screens/collections-screen";
export default function PublicListsPage() { return <CollectionsScreen />; }

export async function generateMetadata({params}:{params:Promise<{handle:string}>}) { return publicPageMetadata((await params).handle,"/lists","Curated lists"); }
