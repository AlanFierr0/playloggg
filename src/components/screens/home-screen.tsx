import { getMessages } from "@/lib/locale/server";
import { getDiscover } from "@/lib/discover";
import {CommunityDiscovery} from "@/components/community-discovery";
import {HomeIntro} from "@/components/home-intro";
import Link from "next/link";
import { ProfilePreview } from "@/components/profile-preview";
import { getPortfolio } from "@/lib/portfolio";
export async function HomeScreen() {
 const [t,{games},portfolio]=await Promise.all([getMessages(),getDiscover(),getPortfolio()]);
 const recent=portfolio.access?.canEdit ? portfolio.games.filter(game=>game.logged).sort((a,b)=>(b.updatedAt??"").localeCompare(a.updatedAt??"")).slice(0,4).map(({slug,title,cover})=>({slug,title,cover})) : [];
 return <div className="w-full bg-surface"><div className="flex flex-col w-full">
  <HomeIntro recent={recent} preview={<ProfilePreview games={games} />} />
  <section className="w-full site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12"><div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"><div><h2 className="font-headline-xl text-headline-xl tracking-tight">{t("Games worth exploring")}</h2></div><Link href="/games" className="flex items-center gap-1.5 font-body-md text-body-md text-on-surface-variant hover:text-primary">{t("Explore All Games")}<span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_forward</span></Link></div>
   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">{games.map(game=><Link key={game.slug} href={`/game/${game.slug}`} className="group flex min-w-0 flex-col"><div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-surface-container-low transition-opacity group-hover:opacity-90"><img className="w-full h-full object-cover" src={game.cover} alt="" loading="lazy" /></div><div className="mt-3 flex flex-col"><h3 translate="no" className="font-headline-md text-headline-md group-hover:text-primary line-clamp-2 min-h-[3rem]">{game.title}</h3><span title={game.developers?.join(", ")} className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate">{game.year ?? t("Release date unknown")}{game.developers?.length ? ` · ${game.developers.join(", ")}` : ""}</span></div></Link>)}</div>
   {!games.length && <p className="text-on-surface-variant">{t("This curated selection is not available yet. Explore the catalog.")}</p>}
  </section>
  <CommunityDiscovery />
 </div></div>;
}
