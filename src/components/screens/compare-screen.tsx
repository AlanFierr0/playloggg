import Link from "next/link";
import { getMessages } from "@/lib/locale/server";
import { ProfileAvatar } from "@/components/profile-avatar";
import { compareGames } from "@/lib/comparison";
import type { getPublicComparison } from "@/lib/public-comparison";
import type { Profile } from "@/types/domain";

type Comparison = NonNullable<Awaited<ReturnType<typeof getPublicComparison>>>;
const panel="rounded-xl bg-surface-container-low p-5 sm:p-8 shadow-lg";
const control="w-full min-w-0 rounded bg-surface-container px-3 py-2.5 text-on-surface";
export async function CompareScreen({left,right,comparison,requestedPage}:{left:string;right:string;comparison:Comparison|null;requestedPage:number}) {
  const t=await getMessages();
  const result=comparison ? compareGames(comparison.left.games,comparison.right.games) : null;
  const pageCount=Math.max(1,Math.ceil((result?.shared.length ?? 0)/20));
  const page=Math.min(requestedPage,pageCount), offset=(page-1)*20;
  const href=(page:number) => `/compare?${new URLSearchParams({left,right,page:String(page)})}`;
  function identity(profile:Profile,count:number) {
    return <div className="flex items-center gap-4 min-w-0"><ProfileAvatar src={profile.avatarUrl} name={profile.displayName} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full shrink-0" /><div className="min-w-0"><Link href={`/u/${profile.handle}`} className="font-headline-xl text-headline-xl font-semibold break-words hover:text-primary">{profile.displayName}</Link><p className="text-on-surface-variant break-all">@{profile.handle}</p><p className="font-label-sm text-label-sm text-outline">{count} {t("Logged games")}</p>{profile.isSample && <p className="text-primary text-body-sm">{t("Sample profile")}</p>}</div></div>;
  }
  function card(entry:NonNullable<typeof result>["shared"][number]) {
    return <article key={entry.game.slug} className={panel}><div className="flex gap-4 items-start"><img src={entry.game.cover} alt="" className="w-20 sm:w-28 aspect-[3/4] object-cover rounded shrink-0" /><div className="min-w-0"><Link href={`/game/${entry.game.slug}`} className="font-headline-md text-headline-md font-semibold hover:text-primary">{entry.game.title}</Link><p className="text-on-surface-variant mt-2">{t("Score difference")}: {entry.difference}</p></div></div><div className="mt-6 grid grid-cols-2 gap-4 border-t border-outline-variant/20 pt-4">{[entry.game,entry.other].map((game,index) => <div key={index} className="min-w-0"><p className="text-body-sm text-on-surface-variant break-words">{index===0 ? comparison!.left.profile.displayName : comparison!.right.profile.displayName}</p><p className="text-[32px] font-semibold text-primary">{game.score}</p><p className="text-body-sm">{t("Tier")}: {game.tier ?? t("Unassigned")}</p></div>)}</div></article>;
  }
  return <div className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-10 md:py-16 space-y-10">
    <header className="space-y-4"><p className="font-label-sm text-label-sm uppercase tracking-widest text-outline">{t("Archival Concordance Analysis")}</p><h1 className="font-headline-xl text-headline-xl font-semibold">{t("Compare gaming taste")}</h1><p className="text-on-surface-variant">{t("Enter two published profile handles. Private and unknown profiles are unavailable.")}</p></header>
    <form action="/compare" method="get" className={`${panel} grid sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-4 items-end`}>
      <label className="space-y-2 min-w-0"><span className="block">{t("First profile handle")}</span><input className={control} name="left" defaultValue={left} required maxLength={30} autoCapitalize="none" autoCorrect="off" spellCheck={false} /></label>
      <label className="space-y-2 min-w-0"><span className="block">{t("Second profile handle")}</span><input className={control} name="right" defaultValue={right} required maxLength={30} autoCapitalize="none" autoCorrect="off" spellCheck={false} /></label>
      <button className="rounded bg-primary-container text-on-primary-container px-6 py-3 font-label-md text-label-md">{t("Compare profiles")}</button>
    </form>
    {!comparison && <p role="status" className={panel}>{t(left && right ? left===right ? "Choose two different published profiles." : "Comparison unavailable. Check both handles and make sure both profiles are published." : "Choose two published profiles to see their shared games and scores.")}</p>}
    {comparison && result && <>
      <section aria-label={t("Profile comparison")} className={`${panel} grid xl:grid-cols-[1fr_auto_1fr] gap-8 items-center`}>
        {identity(comparison.left.profile,comparison.left.games.length)}
        <div className="text-center rounded-xl bg-surface-container p-6"><p className="font-label-md text-label-md uppercase text-on-surface-variant">{t("Taste Affinity")}</p><p data-affinity className="font-display-lg text-display-lg font-bold text-primary">{result.affinity===null ? "—" : `${result.affinity}%`}</p><p>{result.scored} {t("Shared scored games")}</p><p>{result.unrated} {t("Shared games without two scores")}</p></div>
        {identity(comparison.right.profile,comparison.right.games.length)}
      </section>
      <div className="text-body-sm text-on-surface-variant space-y-2"><p>{t("Affinity is 100 minus the average absolute score difference across games both profiles scored, rounded to one decimal. Tiers are independent and do not affect affinity.")}</p>{result.affinity===null && <p role="status">{t("At least 5 shared scored games are needed to show affinity.")}</p>}</div>
      {result.divergences.length>0 && <section className="space-y-6"><h2 className="font-headline-lg text-headline-lg font-semibold">{t("Key Divergences")}</h2><p className="text-on-surface-variant">{t("The largest absolute differences between saved scores.")}</p><div className="grid lg:grid-cols-2 gap-6">{result.divergences.map(card)}</div></section>}
      {result.masterpieces.length>0 && <section className="space-y-6"><h2 className="font-headline-lg text-headline-lg font-semibold">{t("Unanimous Masterpieces")}</h2><p className="text-on-surface-variant">{t("Shared games scored at least 90 by both profiles, regardless of tier.")}</p><div className="grid lg:grid-cols-3 gap-6">{result.masterpieces.map(card)}</div></section>}
      <section className="space-y-6"><h2 className="font-headline-lg text-headline-lg font-semibold">{t("Shared games")}</h2>{!result.shared.length ? <p role="status" className={panel}>{t("These profiles have no shared logged games yet.")}</p> : <>
        <div className="max-w-full overflow-x-auto rounded-xl bg-surface-container-low"><table className="w-full text-left text-body-sm"><caption className="sr-only">{t("Shared games, scores and independent tiers")}</caption><thead className="bg-surface-container"><tr>{[t("Game"),comparison.left.profile.displayName,comparison.right.profile.displayName,t("Score difference")].map((label,index)=><th key={index} scope="col" className="p-4">{label}</th>)}</tr></thead><tbody>{result.shared.slice(offset,offset+20).map(entry => <tr key={entry.game.slug} className="border-t border-outline-variant/20"><th scope="row" className="p-4"><Link href={`/game/${entry.game.slug}`} className="text-primary">{entry.game.title}</Link></th>{[entry.game,entry.other].map((game,index)=><td key={index} className="p-4"><Link href={`/u/${index===0 ? left : right}/game/${game.slug}`} className="hover:text-primary"><span>{t("Score")}: {game.score===null ? t("Unrated") : game.score}</span><br /><span>{t("Tier")}: {game.tier ?? t("Unassigned")}</span></Link></td>)}<td className="p-4">{entry.difference ?? "—"}</td></tr>)}</tbody></table></div>
        <nav aria-label={t("Comparison pagination")} className="flex flex-wrap items-center justify-between gap-4 text-body-sm"><span>{t("Page")} {page} / {pageCount} · {result.shared.length} {t("Shared games")}</span>{page>1 && <Link href={href(page-1)} className="text-primary">{t("Previous")}</Link>}{page<pageCount && <Link href={href(page+1)} className="text-primary">{t("Next")}</Link>}</nav>
      </>}</section>
    </>}
  </div>;
}
