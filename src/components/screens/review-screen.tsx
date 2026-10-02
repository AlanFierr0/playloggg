"use client";
import { useMessages } from "@/components/site-preferences";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TagEditor } from "@/components/tag-editor";
import { useRef, useState, useTransition } from "react";
import { usePortfolio } from "@/components/portfolio-provider";
import { saveRating } from "@/app/actions/ratings";
import { normalizeTags } from "@/lib/collection-input";
import { parseHours } from "@/lib/rating-input";
import type { Game, PlaybackStatus, PlayedPlatform, Tier } from "@/types/domain";
import { TierBadge, ScoreStars } from "@/components/rating-controls";

export function ReviewScreen({ game }: { game: Game }) {
  const t = useMessages();
  const router = useRouter();
const { access } = usePortfolio();
const canEdit = access?.canEdit ?? false;
const [pending, startTransition] = useTransition();
const [saveMessage, setSaveMessage] = useState("");
const [saved, setSaved] = useState({ score: game.score, tier: game.tier ?? null, status: game.status ?? null, review: game.review ?? "", platform: game.platform ?? null, hoursPlayed: game.hoursPlayed ?? null, completedOn: game.completedOn ?? null, tags: game.tags ?? [] });
const [score, setScore] = useState<number | null>(game.score);
const scoreInput = useRef<HTMLInputElement>(null);
const invalidScore = score !== null && (!Number.isInteger(score) || score < 0 || score > 100);
const [tier, setTier] = useState<Tier | null>(game.tier ?? null);
const [platform, setPlatform] = useState<PlayedPlatform | null>(game.platform ?? null);
const [status, setStatus] = useState<PlaybackStatus | null>(game.status ?? null);
const [hours, setHours] = useState(game.hoursPlayed == null ? "" : String(game.hoursPlayed));
const [date, setDate] = useState(game.completedOn ?? "");
const dateInput = useRef<HTMLInputElement>(null);
const [tags, setTags] = useState<string[]>(game.tags ?? []);
const [tagVersion, setTagVersion] = useState(0);
const [review, setReview] = useState(game.review ?? "");
function resetDraft() { setScore(saved.score); setTier(saved.tier); setPlatform(saved.platform); setStatus(saved.status); setHours(saved.hoursPlayed == null ? "" : String(saved.hoursPlayed)); setDate(saved.completedOn ?? ""); setReview(saved.review); setTags(saved.tags); setTagVersion((value) => value + 1); setSaveMessage(""); router.push("/profile"); }
function commit() {
  if (invalidScore || (scoreInput.current && !scoreInput.current.validity.valid)) { setSaveMessage("Use a whole-number score from 0 to 100."); scoreInput.current?.focus(); return; }
  if (dateInput.current && !dateInput.current.validity.valid) { setSaveMessage("Complete a valid calendar date, or clear it. Your draft has been kept."); return; }
  const hoursPlayed = parseHours(hours);
  if (hoursPlayed === undefined) { setSaveMessage("Enter nonnegative decimal hours, or leave playtime blank. Your draft has been kept."); return; }
  const completedOn = date || null;
  const draft = { slug: game.slug, score, tier, status, review, platform, hoursPlayed, completedOn, tags };
  startTransition(async () => {
    try {
      const result = await saveRating(draft);
      setSaveMessage(result.message);
      if (result.ok) { setSaved({ score, tier, status, review: review.trim(), platform, hoursPlayed, completedOn, tags: normalizeTags(tags)! }); setReview(review.trim()); setHours(hoursPlayed == null ? "" : String(hoursPlayed)); router.push("/profile"); }
    } catch { setSaveMessage("Saving is unavailable right now. Your draft has been kept; please try again."); }
  });
}
return (<><fieldset disabled={pending} className="contents">
<div className="w-full  bg-surface"><div className="flex flex-col w-full">
<div className="relative w-full min-h-[calc(100dvh-var(--site-header-height))] flex items-stretch p-4 sm:p-6 lg:p-8 overflow-hidden">
<div className="absolute inset-0 pointer-events-none overflow-hidden">
<div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-primary/5 rounded-full blur-[140px]"></div>

<div className="absolute bottom-0 right-10 w-[420px] h-[280px] bg-surface-container-high/40 rounded-full blur-[100px]"></div>

<div className="absolute inset-0 bg-[radial-gradient(#292a2d_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>

</div>

<div className="relative w-full min-w-0 bg-surface-container-low rounded-xl shadow-2xl overflow-hidden flex flex-col">
<div className="w-full bg-surface-container px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
<div className="flex items-center gap-3 min-w-0">
<span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>

<span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{t("Your game entry")}</span>

<span className="hidden sm:inline text-outline-variant font-label-sm">{"/"}</span>

<span className="hidden sm:inline font-label-sm text-label-sm text-on-surface-variant/80">{canEdit ? t("Draft · save to keep changes") : t("Preview · sign in to save")}</span>

</div>

<div className="flex items-center gap-3">
<Link className="group flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors" title={t("Change Title")} type="button" href="/search?mode=log&from=/log">
<span aria-hidden="true" className="material-symbols-outlined text-[15px]">{"swap_horiz"}</span>

<span className="font-label-sm text-label-sm uppercase tracking-wider">{t("Switch Game")}</span>

</Link>

<Link aria-label={t("Close modal")} className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" href="/profile">
<span aria-hidden="true" className="material-symbols-outlined text-[20px]">{"close"}</span>

</Link>

</div>

</div>

<div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-2 items-start gap-8">
{!canEdit && <p className="xl:col-span-2 font-body-sm text-body-sm text-on-surface-variant">{t("Sign in to save your entry. ")}<Link href="/login" className="text-primary underline">{t("Sign in")}</Link> {t("to save entries to your own profile.")}</p>}
<p role="status" hidden={!pending && !saveMessage} className="xl:col-span-2 font-body-sm text-body-sm text-primary">{pending ? t("Saving…") : t(saveMessage)}</p>
<div className="xl:col-span-2 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
<div className="relative group flex-shrink-0 w-32 sm:w-40 aspect-[3/4] rounded-lg overflow-hidden bg-surface-container shadow-xl">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={game.title} src={game.cover} />

<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent opacity-90"></div>

<div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-on-surface">
<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-sm text-primary">{game.year ?? "—"}</span>

<span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-sm text-on-surface-variant">{game.genres?.[0] ?? t("Game")}</span>

</div>

</div>

<div className="flex flex-col flex-1 min-w-0 justify-between self-stretch">
<div className="flex flex-col gap-2">
<div className="flex flex-wrap items-center gap-2">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">{t("Selected game")}</span>



</div>

<h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight break-words">{game.title}</h1>

<p translate="no" className="font-body-md text-body-md text-on-surface-variant">{game.developers?.join(" / ") || game.genres?.join(" / ")}</p>

</div>

<div className="flex flex-col gap-2.5 mt-5 pt-5 bg-surface-container/40 -mx-3 px-3 py-3 rounded-lg">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{t("Platform Played")}</span>

<div className="flex flex-wrap gap-2" id="platform-selector">
<button type="button" onClick={() => setPlatform(platform === "pc" ? null : "pc")} title={t("Select platform; click again to clear")} aria-pressed={platform === "pc"} className={platform === "pc" ? "platform-btn px-3 py-1 rounded font-label-sm text-label-sm uppercase tracking-wider bg-primary/15 text-primary shadow-sm flex items-center gap-1.5" : "platform-btn px-3 py-1 rounded font-label-sm text-label-sm uppercase tracking-wider bg-surface-container-highest text-on-surface-variant transition-all hover:bg-surface-bright hover:text-on-surface flex items-center gap-1.5"}>
<span aria-hidden="true" className="material-symbols-outlined text-[14px]">{"desktop_windows"}</span>
{t(" PC / Steam\n                ")}</button>

<button type="button" onClick={() => setPlatform(platform === "ps5" ? null : "ps5")} title={t("Select platform; click again to clear")} aria-pressed={platform === "ps5"} className={platform === "ps5" ? "platform-btn px-3 py-1 rounded font-label-sm text-label-sm uppercase tracking-wider bg-primary/15 text-primary shadow-sm flex items-center gap-1.5" : "platform-btn px-3 py-1 rounded font-label-sm text-label-sm uppercase tracking-wider bg-surface-container-highest text-on-surface-variant transition-all hover:bg-surface-bright hover:text-on-surface flex items-center gap-1.5"}>
<span aria-hidden="true" className="material-symbols-outlined text-[14px]">{"sports_esports"}</span>
{t(" PlayStation 5\n                ")}</button>

<button type="button" onClick={() => setPlatform(platform === "xbox_series_x" ? null : "xbox_series_x")} title={t("Select platform; click again to clear")} aria-pressed={platform === "xbox_series_x"} className={platform === "xbox_series_x" ? "platform-btn px-3 py-1 rounded font-label-sm text-label-sm uppercase tracking-wider bg-primary/15 text-primary shadow-sm flex items-center gap-1.5" : "platform-btn px-3 py-1 rounded font-label-sm text-label-sm uppercase tracking-wider bg-surface-container-highest text-on-surface-variant transition-all hover:bg-surface-bright hover:text-on-surface flex items-center gap-1.5"}>
<span aria-hidden="true" className="material-symbols-outlined text-[14px]">{"stadia_controller"}</span>
{t(" Xbox Series X\n                ")}</button>

<button type="button" onClick={() => setPlatform(platform === "steam_deck" ? null : "steam_deck")} title={t("Select platform; click again to clear")} aria-pressed={platform === "steam_deck"} className={platform === "steam_deck" ? "platform-btn px-3 py-1 rounded font-label-sm text-label-sm uppercase tracking-wider bg-primary/15 text-primary shadow-sm flex items-center gap-1.5" : "platform-btn px-3 py-1 rounded font-label-sm text-label-sm uppercase tracking-wider bg-surface-container-highest text-on-surface-variant transition-all hover:bg-surface-bright hover:text-on-surface flex items-center gap-1.5"}>
<span aria-hidden="true" className="material-symbols-outlined text-[14px]">{"tablet"}</span>
{t(" Steam Deck\n                ")}</button>

</div>

</div>

</div>

</div>

<div className="min-w-0 bg-surface-container/60 rounded-xl p-4 sm:p-8 flex flex-col items-center gap-6 relative">
<div className="w-full flex flex-wrap gap-2 items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{t("Score")}</span>

<TierBadge value={tier} onChange={setTier} />
</div>

<div className="flex flex-col items-center justify-center gap-1 my-2">
<div className="flex items-baseline gap-2">
<span className="font-display-lg text-display-lg font-bold tracking-tighter text-primary font-headline-xl" id="score-display">{score ?? "—"}</span>

<span className="font-headline-md text-headline-md text-on-surface-variant">{"/100"}</span>

</div>

{score === null ? <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Unrated · a score is optional")}</p> : <ScoreStars score={score} />}
<label className="mt-3 flex flex-wrap items-center justify-center gap-3 text-body-sm text-on-surface-variant">
  <span>{t("Score")}</span>
  <input ref={scoreInput} id="score-input" type="number" inputMode="numeric" min={0} max={100} step={1} value={score ?? ""} placeholder="0–100" aria-label={t("Numerical score from 0 to 100")} aria-invalid={invalidScore} aria-describedby={invalidScore ? "score-error" : undefined} onChange={event => { setScore(event.target.value === "" ? null : event.target.valueAsNumber); setSaveMessage(""); }} className="w-28 min-h-11 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-center font-headline-md text-headline-md text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
</label>
{invalidScore && <p id="score-error" className="text-body-sm text-error">{t("Use a whole-number score from 0 to 100.")}</p>}
<button id="toggle-score" type="button" className="mt-2 rounded bg-surface-container px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant hover:text-primary" onClick={() => setScore(score === null ? 0 : null)}>{score === null ? t("Add score") : t("Remove score")}</button>
</div>

<div className="w-full max-w-xl flex flex-col gap-3">
<div className="relative w-full flex items-center">
<input className="score-slider w-full cursor-pointer disabled:opacity-30" id="score-slider" max="100" min="0" step="1" type="range" value={score ?? 0} onPointerDown={(event) => setScore(Number(event.currentTarget.value))} onKeyDown={(event) => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) setScore(Number(event.currentTarget.value)); }} onChange={(event) => setScore(Number(event.target.value))} aria-label={t("Numerical score from 0 to 100")} aria-valuetext={score === null ? t("Unrated · a score is optional") : `${score} / 100`} />

</div>

<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-on-surface-variant font-label-sm text-label-sm px-1">
<span>{t("0 (Deficient)")}</span>

<span>{t("50 (Median)")}</span>

<span>{t("75 (Essential)")}</span>

<span className="text-primary font-bold">{t("100 (Flawless)")}</span>

</div>

<div className="flex items-center justify-center gap-2 mt-2">
<button className="px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright font-label-sm text-label-sm transition-colors" type="button" disabled={score === null} onClick={() => setScore((previous) => Math.max(0, Math.min(100, (previous ?? 0) + -5)))}>{"-5"}</button>

<button className="px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright font-label-sm text-label-sm transition-colors" type="button" disabled={score === null} onClick={() => setScore((previous) => Math.max(0, Math.min(100, (previous ?? 0) + -1)))}>{"-1"}</button>

<div className="w-px h-4 bg-surface-container-highest mx-1"></div>

<button className="px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright font-label-sm text-label-sm transition-colors" type="button" disabled={score === null} onClick={() => setScore((previous) => Math.max(0, Math.min(100, (previous ?? 0) + 1)))}>{"+1"}</button>

<button className="px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright font-label-sm text-label-sm transition-colors" type="button" disabled={score === null} onClick={() => setScore((previous) => Math.max(0, Math.min(100, (previous ?? 0) + 5)))}>{"+5"}</button>

</div>

</div>

</div>

<div className="min-w-0 grid grid-cols-1 md:grid-cols-12 gap-6">
<div className="md:col-span-12 flex flex-col gap-2.5">
<div className="flex flex-wrap items-center justify-between gap-2"><span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{t("Playback status")}</span><button id="clear-status" type="button" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary" onClick={() => setStatus(null)}>{status === null ? t("Not set") : t("Clear status")}</button></div>

<div className="grid grid-cols-2 sm:grid-cols-4 gap-2" id="status-group" role="group" aria-label={t("Playback status")}>
<button type="button" onClick={() => setStatus("completed")} aria-pressed={status === "completed"} className={status === "completed" ? "status-btn px-4 py-2.5 rounded bg-primary-container text-on-primary-container font-label-md text-label-md uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-sm transition-all" : "status-btn px-4 py-2.5 rounded bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md uppercase tracking-wider transition-all flex items-center justify-center gap-2"}>
<span aria-hidden="true" className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"check_circle"}</span>
{t(" Completed\n              ")}</button>

<button type="button" onClick={() => setStatus("playing")} aria-pressed={status === "playing"} className={status === "playing" ? "status-btn px-4 py-2.5 rounded bg-primary-container text-on-primary-container font-label-md text-label-md uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-sm transition-all" : "status-btn px-4 py-2.5 rounded bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md uppercase tracking-wider transition-all flex items-center justify-center gap-2"}>
<span aria-hidden="true" className="material-symbols-outlined text-[16px]">{"hourglass_top"}</span>
{t(" In Progress\n              ")}</button>

<button type="button" onClick={() => setStatus("backlog")} aria-pressed={status === "backlog"} className={status === "backlog" ? "status-btn px-4 py-2.5 rounded bg-primary-container text-on-primary-container font-label-md text-label-md uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-sm transition-all" : "status-btn px-4 py-2.5 rounded bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md uppercase tracking-wider transition-all flex items-center justify-center gap-2"}>
<span aria-hidden="true" className="material-symbols-outlined text-[16px]">{"bookmark"}</span>
{t(" Backlog\n              ")}</button>

<button type="button" onClick={() => setStatus("shelved")} aria-pressed={status === "shelved"} className={status === "shelved" ? "status-btn px-4 py-2.5 rounded bg-primary-container text-on-primary-container font-label-md text-label-md uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-sm transition-all" : "status-btn px-4 py-2.5 rounded bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md uppercase tracking-wider transition-all flex items-center justify-center gap-2"}>
<span aria-hidden="true" className="material-symbols-outlined text-[16px]">{"cancel"}</span>
{t(" Shelved\n              ")}</button>

</div>

</div>

<div className="md:col-span-6 flex flex-col gap-2">
<label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant" htmlFor="hours-input">{t("Hours played")}</label>

<div className="relative flex items-center">
<span aria-hidden="true" className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">{"schedule"}</span>

<input className="min-w-0 w-full bg-surface-container pl-10 pr-4 py-2.5 rounded text-on-surface font-label-md text-label-md focus:outline-none focus:bg-surface-container-high transition-colors" id="hours-input" placeholder={t("Hours, e.g. 45.5")} type="text" inputMode="decimal" value={hours} onChange={(event) => setHours(event.target.value)} />

</div>

</div>

<div className="md:col-span-6 flex flex-col gap-2">
<label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant" htmlFor="date-input">{t("Completion date")}</label>

<div className="relative flex items-center">
<span aria-hidden="true" className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">{"calendar_today"}</span>

<input key={tagVersion} className="min-w-0 w-full bg-surface-container pl-10 pr-4 py-2.5 rounded text-on-surface font-label-md text-label-md focus:outline-none focus:bg-surface-container-high transition-colors" id="date-input" ref={dateInput} type="date" min="0001-01-01" max="9999-12-31" value={date} onChange={(event) => setDate(event.target.value)} />

</div>

</div>

<div className="md:col-span-12 flex flex-col gap-2">
<div className="flex flex-wrap gap-2 items-center justify-between">
<label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant" htmlFor="dispatch-textarea">{t("Critical Dispatch / Review")}</label>

<span className="font-label-sm text-label-sm text-on-surface-variant">{t("Plain text · 20,000 characters max")}</span>

</div>

<textarea className="w-full bg-surface-container p-4 rounded text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-high transition-colors resize-none leading-relaxed" id="dispatch-textarea" placeholder={t("Write a dispatch or critical thoughts (optional)...")} rows={4} maxLength={20000} value={review} onChange={(event) => setReview(event.target.value)}></textarea>

</div>

<div className="md:col-span-12 flex flex-col gap-2.5"><TagEditor key={tagVersion} tags={tags} onChange={setTags} />
</div>

</div>

</div>

<div className="w-full bg-surface-container-lowest px-4 py-4 sm:px-10 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
<div className="min-w-0 space-y-2"><p className="font-label-sm text-label-sm text-on-surface-variant">{t("Updates appear in feeds only while your profile is public and discoverable.")}</p></div>

<div className="flex flex-col min-[360px]:flex-row items-center gap-3 w-full sm:w-auto justify-end">
<button id="discard-rating" className="w-full sm:w-auto px-4 py-2 rounded bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md uppercase tracking-wider transition-colors" type="button" onClick={resetDraft}>{t("\n            Discard Draft\n          ")}</button>

<button id="commit-rating" className="w-full sm:w-auto px-6 py-2 rounded bg-primary-container text-on-primary-container hover:bg-primary font-label-md text-label-md uppercase tracking-wider font-semibold shadow-lg shadow-primary-container/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50" type="button" disabled={!canEdit || pending} onClick={commit}>
<span aria-hidden="true" className="material-symbols-outlined text-[18px]">{"bookmark_added"}</span>
{pending ? t("Saving…") : t("Commit to Log")}</button>

</div>

</div>

</div>

</div>

</div>

</div>
</fieldset></>);
}
