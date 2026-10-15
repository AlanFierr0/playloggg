import Link from "next/link";
import { getMessages } from "@/lib/locale/server";
import { getCommunityScores } from "@/lib/community";
import { getCatalogRows } from "@/lib/portfolio";
import { largestScoreGap } from "@/lib/portfolio-view";
import type { Portfolio } from "@/types/domain";

export async function ProfileHotTake({ portfolio }: { portfolio: Portfolio }) {
  let take;
  try {
    const rows=await getCatalogRows([],portfolio.games.filter(game=>game.score!==null).map(game=>game.slug));
    const scores=await getCommunityScores(rows.map(row=>row.id));
    const byId=new Map(scores.map(score=>[score.gameId,score]));
    take=largestScoreGap(portfolio.games,new Map(rows.flatMap(row=>{const score=byId.get(row.id);return score ? [[row.slug,{average:score.average,count:score.count}]] : [];})));
  }
  catch { return null; }
  if (!take) return null;
  const t = await getMessages();
  const { game, community, difference } = take;
  const href = portfolio.publicBase ? `${portfolio.publicBase}/game/${game.slug}` : `/game/${game.slug}`;
  return <section aria-label={t("Hot take")} className="min-w-0 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5 sm:p-6 space-y-5">
    <h2 className="font-headline-lg text-headline-lg">{t("Hot take")}</h2>
    <p className="text-body-sm text-on-surface-variant">{t("Largest score gap with the community")}</p>
    <div className="flex items-center gap-4 min-w-0">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="shrink-0"><img src={game.cover} alt="" loading="lazy" className="w-16 h-24 rounded-lg object-cover" /></Link>
      <div className="min-w-0 space-y-2"><Link href={href} translate="no" className="text-body-lg font-semibold break-words hover:text-primary">{game.title}</Link>
        <p className="text-primary font-semibold tabular-nums">{Math.abs(difference).toFixed(1)} {t(difference > 0 ? "points higher than the community" : "points lower than the community")}</p>
      </div>
    </div>
    <dl className="grid grid-cols-2 gap-4 border-t border-outline-variant/20 pt-4">
      <div className="min-w-0"><dt translate="no" className="text-body-sm text-on-surface-variant break-words">{portfolio.profile.displayName}</dt><dd className="text-headline-md font-semibold text-primary tabular-nums">{game.score}<span className="text-body-sm font-normal text-on-surface-variant"> / 100</span></dd></div>
      <div><dt className="text-body-sm text-on-surface-variant">{t("Community score")}</dt><dd className="text-headline-md font-semibold tabular-nums">{community.average.toFixed(1)}<span className="text-body-sm font-normal text-on-surface-variant"> / 100</span><span className="block text-label-sm font-normal text-on-surface-variant">{community.count} {t("ratings")}</span></dd></div>
    </dl>
  </section>;
}
