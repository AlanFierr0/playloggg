import { getMessages } from "@/lib/locale/server";
import { getDiscover } from "@/lib/discover";
import {CommunityDiscovery} from "@/components/community-discovery";
import {DiscoverIntro} from "@/components/discover-intro";
import Link from "next/link";
export async function HomeScreen() {
 const [t,{games}]=await Promise.all([getMessages(),getDiscover()]);
 return <div className="w-full bg-surface"><div className="flex flex-col w-full">
  <DiscoverIntro />
  <section className="w-full site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12"><div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"><div><span className="font-label-sm text-label-sm text-primary uppercase tracking-widest block mb-1">{t("From the catalog")}</span><h2 className="font-headline-xl text-headline-xl tracking-tight">{t("Games worth exploring")}</h2></div><Link href="/games" className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant hover:text-primary">{t("Explore All Games")}<span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_forward</span></Link></div>
   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">{games.map(game=><Link key={game.slug} href={`/game/${game.slug}`} className="group flex min-w-0 flex-col"><div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-surface-container-low shadow-md transition-transform group-hover:-translate-y-1.5"><img className="w-full h-full object-cover" src={game.cover} alt="" loading="lazy" /></div><div className="mt-3 flex flex-col"><h3 translate="no" className="font-headline-md text-headline-md group-hover:text-primary truncate">{game.title}</h3><span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{game.year ?? t("Release date unknown")}{game.developers?.length ? ` · ${game.developers.join(", ")}` : ""}</span></div></Link>)}</div>
   {!games.length && <p className="text-on-surface-variant">{t("This curated selection is not available yet. Explore the catalog.")}</p>}
  </section>
  <CommunityDiscovery />
 </div></div>;
}
