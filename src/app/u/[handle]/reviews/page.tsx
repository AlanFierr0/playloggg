import { ProfileDetailsScreen } from "@/components/screens/profile-details-screen";
import { publicPageMetadata } from "@/lib/public-page-metadata";
export async function generateMetadata({params}: {params:Promise<{handle:string}>}) {return publicPageMetadata((await params).handle,"/reviews","Reviews");}
export default function Page() {return <ProfileDetailsScreen section="reviews" />;}
