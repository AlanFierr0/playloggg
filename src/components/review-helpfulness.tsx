"use client";
import type { ReviewHelpfulnessData } from "@/types/domain";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { loginHref } from "@/lib/return-navigation";
import { useActionState } from "react";
import { reviewVote } from "@/app/actions/review-vote";
import { usePortfolio } from "@/components/portfolio-provider";
import { useMessages } from "@/components/site-preferences";

export function ReviewHelpfulness({ slug, profileId, data: suppliedData }: { slug: string; profileId?: string; data?: ReviewHelpfulnessData }) {
  const { profile, reviewHelpfulness } = usePortfolio();
  const data = suppliedData ?? reviewHelpfulness;
  const t = useMessages();
  const pathname = usePathname(), params = useSearchParams();
  const [state, action, pending] = useActionState(reviewVote, { message: "" });
  const counts = state.counts ?? data?.reviews[slug];
  if (!counts || !data) return null;
  return <div className="space-y-2">
    <form action={action} aria-label={t("Review helpfulness")} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="profile" value={profileId ?? profile.id} />
      <input type="hidden" name="slug" value={slug} />
      {[{ value: 1, label: "Helpful", icon: "thumb_up", count: counts.upvotes }, { value: -1, label: "Not helpful", icon: "thumb_down", count: counts.downvotes }].map(item => <button key={item.value} type="submit" name="vote" value={counts.vote === item.value ? 0 : item.value} aria-pressed={counts.vote === item.value} disabled={pending || !data.canVote} title={data.signedIn && !data.canVote ? t("You cannot vote on your own review.") : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-body-sm transition-colors disabled:cursor-default disabled:opacity-60 ${counts.vote === item.value ? "border-primary/40 bg-primary/10 text-primary" : "border-outline-variant/30 bg-surface-container text-on-surface-variant hover:text-primary"}`}><span aria-hidden="true" className="material-symbols-outlined text-[18px]">{item.icon}</span>{t(item.label)}<span className="tabular-nums">{item.count}</span></button>)}
      {!data.signedIn && <Link href={loginHref(`${pathname}${params.size ? `?${params}` : ""}`)} className="px-2 text-body-sm text-primary">{t("Sign in to vote on reviews.")}</Link>}
    </form>
    <p role="status" className="text-body-sm text-on-surface-variant">{t(state.message)}</p>
  </div>;
}
