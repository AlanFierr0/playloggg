import { HomeScreen } from "@/components/screens/home-screen";
import { localizeMetadata } from "@/lib/locale/server";
import { siteUrl } from "@/lib/site-url";
export async function generateMetadata() { return localizeMetadata({title:"Discover | Playlogg", description:"A selection from the Playlogg game catalog. Track your games in a private portfolio and publish when you choose.",robots:{index:true,follow:true},alternates:{canonical:siteUrl("/")},openGraph:{url:siteUrl("/"),title:"Discover | Playlogg",description:"Explore a selection of games on Playlogg."}}); }
export default function HomePage() { return <HomeScreen />; }
