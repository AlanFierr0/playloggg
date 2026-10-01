import { getMessages } from "@/lib/locale/server";
import { getDiscover } from "@/lib/discover";
import Link from "next/link";
import { ShelfLink, ShareGameButton } from "@/components/game-actions";
export async function HomeScreen() {
 const [t,{hero,games}]=await Promise.all([getMessages(),getDiscover()]);
 const colon=hero?.title.indexOf(":") ?? -1;
 return <div className="w-full bg-surface"><div className="flex flex-col w-full">
  <section className="site-container mx-auto px-4 sm:px-6 lg:px-12 pt-6 sm:pt-8 pb-8 sm:pb-20">
   <p className="mb-4 rounded bg-surface-container-low px-4 py-3 text-body-sm text-on-surface-variant">{t("Curated editorial selection from the catalog. These picks are not community rankings or your personal ratings.")}</p>
   {hero ? <div className="home-spotlight relative flex min-h-[560px] sm:min-h-[600px] flex-col justify-end rounded-xl overflow-hidden bg-surface-container-lowest shadow-2xl group">
    <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.015]" style={{backgroundImage:`url(${hero.artwork ?? hero.cover})`}} />
    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" /><div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/40 to-transparent" />
    <div className="relative z-10 mx-5 mt-5 sm:mx-12 sm:mt-8 flex flex-wrap items-center gap-3"><span className="px-2.5 py-1 rounded bg-surface-container-high/80 backdrop-blur-md font-label-sm text-label-sm text-primary uppercase tracking-widest">{t("Editor's Spotlight")}</span><span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t("Curated feature")}</span></div>
    <div className="relative z-10 mt-auto p-5 sm:p-12 max-w-3xl flex flex-col gap-5">
     <div className="flex flex-wrap items-center gap-3 text-on-surface-variant font-label-md text-label-md"><span translate="no">{hero.developers?.join(" / ")}</span><span>{hero.year ?? t("Release date unknown")}</span><span translate="no">{hero.genres?.join(" / ")}</span></div>
     <h1 className="font-display-lg text-display-lg sm:text-[64px] sm:leading-[68px] text-on-surface tracking-tight break-words" translate="no">{colon<0 ? hero.title : <>{hero.title.slice(0,colon+1)}<br /><span className="text-primary-fixed-dim font-light italic">{hero.title.slice(colon+1).trim()}</span></>}</h1>
     <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl font-light leading-relaxed">{t("A curated pick from the catalog. Save your own rating, tier and review in your portfolio.")}</p>
     <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-2"><Link href={`/game/${hero.slug}`} className="inline-flex items-center gap-2 px-6 py-3 rounded bg-primary text-on-primary hover:bg-primary-fixed-dim font-label-md text-label-md uppercase tracking-wider font-semibold shadow-lg">{t("View Title")}<span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_forward</span></Link><ShelfLink slug={hero.slug} className="inline-flex items-center gap-2 px-5 py-3 rounded bg-surface-container-high/70 hover:bg-surface-container-highest font-label-md text-label-md uppercase tracking-wider"><span aria-hidden="true" className="material-symbols-outlined text-[16px]">bookmark_border</span>{t("Shelf")}</ShelfLink><ShareGameButton slug={hero.slug} className="inline-flex items-center justify-center w-11 h-11 rounded bg-surface-container-high/70 hover:bg-surface-container-highest"><span aria-hidden="true" className="material-symbols-outlined text-[18px]">share</span></ShareGameButton></div>
    </div>
   </div> : <h1 className="font-headline-xl text-headline-xl">{t("Discover")}</h1>}
  </section>
  <section className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12"><div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"><div><span className="font-label-sm text-label-sm text-primary uppercase tracking-widest block mb-1">{t("Archival Selection")}</span><h2 className="font-headline-xl text-headline-xl tracking-tight">{t("The Essential Canon")}</h2></div><Link href="/games" className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant hover:text-primary">{t("Explore All Games")}<span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_forward</span></Link></div>
   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">{games.map(game=><Link key={game.slug} href={`/game/${game.slug}`} className="group flex min-w-0 flex-col"><div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-surface-container-low shadow-md transition-transform group-hover:-translate-y-1.5"><img className="w-full h-full object-cover" src={game.cover} alt="" loading="lazy" /></div><div className="mt-3 flex flex-col"><h3 translate="no" className="font-headline-md text-headline-md group-hover:text-primary truncate">{game.title}</h3><span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{game.year ?? t("Release date unknown")}{game.developers?.length ? ` · ${game.developers.join(", ")}` : ""}</span></div></Link>)}</div>
   {!games.length && <p className="text-on-surface-variant">{t("This curated selection is not available yet. Explore the catalog.")}</p>}
  </section>
 </div></div>;
}
