"use client";
import { useMessages } from "@/components/site-preferences";


import Link from "next/link";
import { ProfileAvatar } from "@/components/profile-avatar";
import { usePortfolio } from "@/components/portfolio-provider";
import { playbackLabels } from "@/lib/playback-status";
import type { Game } from "@/types/domain";

export function GameStandpoint({ game }: { game: Game }) {
  const t = useMessages();
  const { profile, access } = usePortfolio();
  return <section className="bg-surface-container-low rounded-xl p-5 shadow-sm relative overflow-hidden space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <ProfileAvatar name={profile.displayName} className="w-12 h-12 shrink-0 rounded-full object-cover" />
        <div className="min-w-0 space-y-2">
          <h2 className="font-headline-md text-headline-md font-semibold">{profile.isSample ? t("Sample profile entry") : t("Your log entry")}</h2>
          {game.logged ? <div className="flex flex-wrap gap-x-3 gap-y-1 text-body-sm text-on-surface-variant">
            <span>{game.score == null ? t("Unrated") : t(`${game.score} / 100`)}</span>
            <span>{game.tier ? t(`Tier ${game.tier}`) : t("Tier unassigned")}</span>
            {game.status && <span>{t(playbackLabels[game.status])}</span>}
            {game.hoursPlayed != null && <span>{game.hoursPlayed} {t("hrs")}</span>}
            {game.completedOn && <span>{t("Completed ")}{game.completedOn}</span>}
          </div> : <p className="text-body-sm text-on-surface-variant">{t("This profile has not logged this game.")}</p>}
        </div>
      </div>
      <Link href={access?.canEdit ? `/log?game=${encodeURIComponent(game.slug)}` : "/login"} className="px-3 py-2 rounded bg-surface-container text-primary font-label-sm text-label-sm">{access?.canEdit ? t("Edit log entry") : t("Sign in")}</Link>
    </div>
    {game.review && <p translate="no" className="whitespace-pre-wrap break-words rounded bg-surface-container-lowest/50 p-3.5 text-body-sm text-on-surface-variant">{game.review}</p>}
  </section>;
}
