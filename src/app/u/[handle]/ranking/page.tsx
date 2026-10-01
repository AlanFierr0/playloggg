import { RankingsScreen } from "@/components/screens/rankings-screen";
import { publicPageMetadata } from "@/lib/public-page-metadata";
export async function generateMetadata({params}: {params:Promise<{handle:string}>}) {return publicPageMetadata((await params).handle,"/ranking","Score ranking");}
export default function Page() {return <RankingsScreen />;}
