import { HomeScreen } from "@/components/screens/home-screen";
import { localizeMetadata } from "@/lib/locale/server";
import { siteUrl } from "@/lib/site-url";
export async function generateMetadata() { return localizeMetadata({title:"Home | Playlogg", description:"Your home for logging games, arranging tiers and sharing your gaming taste.",robots:{index:true,follow:true},alternates:{canonical:siteUrl("/")},openGraph:{url:siteUrl("/"),title:"Home | Playlogg",description:"Your home for logging games, arranging tiers and sharing your gaming taste."}}); }
export default function HomePage() { return <HomeScreen />; }
