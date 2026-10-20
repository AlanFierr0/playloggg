"use client";
import { StudioName } from "@/components/studio-name";
import { validateRating } from "@/lib/rating-input";
import { useMessages } from "@/components/site-preferences";

import Link from "next/link";
import { BackLink, useReturnNavigation } from "@/components/return-navigation";
import { ConsolePlatformSelector } from "@/components/console-platform-selector";
import { CompletionDate } from "@/components/completion-date";
import { TagEditor } from "@/components/tag-editor";
import { useEffect, useRef, useState, useTransition } from "react";
import { tierForScore } from "@/lib/tier-ranges";
import { usePortfolio } from "@/components/portfolio-provider";
import { RemoveLog } from "@/components/remove-log";
import { saveRating } from "@/app/actions/ratings";
import { normalizeTags } from "@/lib/collection-input";
import { maximumPlaytime, parseHours } from "@/lib/rating-input";
import { PlaybackStatusPicker } from "@/components/playback-status-picker";
import { playedPlatformLabels } from "@/lib/played-platforms";
import type { Game, PlaybackStatus, PlayedPlatform, Tier } from "@/types/domain";
import { TierBadge, ScoreStars } from "@/components/rating-controls";

export function ReviewScreen({ game }: { game: Game }) {
  const t = useMessages();
  const { goBack } = useReturnNavigation();
const { access, profile } = usePortfolio();
const canEdit = access?.canEdit ?? false;
const [pending, startTransition] = useTransition();
const [saveMessage, setSaveMessage] = useState("");
const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(game.updatedAt ?? null);
const [conflict, setConflict] = useState(false);
const [draftReady, setDraftReady] = useState(false);
const cleared = useRef(false);
const draftKey = `playlogg_draft:${profile.id}:${game.slug}`;
const [saved, setSaved] = useState({ score: game.score, tier: game.tier ?? null, status: game.status ?? null, playStyle:game.playStyle??null, review: game.review ?? "", platform: game.platform ?? null, hoursPlayed: game.hoursPlayed ?? null, completedOn: game.completedOn ?? null, tags: game.tags ?? [] });
const [score, setScore] = useState<number | null>(game.score);
const scoreInput = useRef<HTMLInputElement>(null);
const invalidScore = score !== null && (!Number.isInteger(score) || score < 0 || score > 100);
const scoreDescription = score === null || invalidScore ? null : score < 25 ? "Terrible" : score < 50 ? "Poor" : score < 75 ? "Average" : score < 100 ? "Great" : "Masterpiece";
const [tier, setTier] = useState<Tier | null>(game.tier ?? null);
const [tierManual,setTierManual] = useState(game.tierManual ?? Boolean(game.tier));
const [platform, setPlatform] = useState<PlayedPlatform | null>(game.platform ?? null);
const isPC = platform?.startsWith("pc") ?? false;
const [playStyle,setPlayStyle]=useState<Game["playStyle"]>(game.playStyle??null);
const [status, setStatus] = useState<PlaybackStatus | null>(game.status ?? null);
const [hours, setHours] = useState(game.hoursPlayed == null ? "" : String(game.hoursPlayed));
const [date, setDate] = useState(game.completedOn ?? "");
const dateInput = useRef<HTMLInputElement>(null);
const [tags, setTags] = useState<string[]>(game.tags ?? []);
const [tagVersion, setTagVersion] = useState(0);
const [review, setReview] = useState(game.review ?? "");
const dirty = playStyle !== saved.playStyle || score !== saved.score || tier !== saved.tier || status !== saved.status || review !== saved.review || platform !== saved.platform
  || hours !== (saved.hoursPlayed == null ? "" : String(saved.hoursPlayed)) || (date || null) !== saved.completedOn || JSON.stringify(tags) !== JSON.stringify(saved.tags)
  || tierManual !== (game.tierManual ?? Boolean(game.tier));
useEffect(() => {
  let cancelled = false;
  queueMicrotask(() => {
  if (cancelled) return;
  if (canEdit) try {
    const stored = sessionStorage.getItem(draftKey);
    const raw = stored ? JSON.parse(stored) : null;
    const draft = raw ? validateRating({...raw, hoursPlayed:null, completedOn:null}) : null;
    if (draft?.slug === game.slug) {
      setPlayStyle(draft.playStyle??game.playStyle??null); setScore(draft.score); setTier(draft.tier); setTierManual(draft.tierManual ?? false);
      setPlatform(draft.platform); setStatus(draft.status); setHours(typeof raw.rawHours === "string" && raw.rawHours.length <= 100 ? raw.rawHours : "");
      setDate(typeof raw.rawDate === "string" && raw.rawDate.length <= 10 ? raw.rawDate : ""); setReview(draft.review); setTags(draft.tags); setTagVersion(value => value + 1);
      setExpectedUpdatedAt(draft.expectedUpdatedAt ?? null);
      setSaveMessage("Your unfinished draft has been restored.");
    }
  } catch { setSaveMessage("Draft storage is unavailable. Save before leaving this page."); }
  setDraftReady(true);
  });
  return () => { cancelled = true; };
}, [canEdit, draftKey, game.slug, game.playStyle]);
useEffect(() => {
  if (!canEdit || !draftReady || cleared.current) return;
  try {
    if (!dirty) { sessionStorage.removeItem(draftKey); return; }
    sessionStorage.setItem(draftKey, JSON.stringify({slug: game.slug, score, tier, tierManual, status, playStyle, review, platform,
      hoursPlayed: parseHours(hours) ?? null, completedOn: date || null, rawHours:hours, rawDate:date, tags, expectedUpdatedAt}));
  } catch { queueMicrotask(() => setSaveMessage("Draft storage is unavailable. Save before leaving this page.")); }
}, [canEdit, draftReady, dirty, draftKey, game.slug, score, tier, tierManual, status, playStyle, review, platform, hours, date, tags, expectedUpdatedAt]);
function clearStoredDraft() { cleared.current = true; try { sessionStorage.removeItem(draftKey); } catch {} }
function resetDraft() { clearStoredDraft(); setPlayStyle(saved.playStyle); setScore(saved.score); setTier(saved.tier); setPlatform(saved.platform); setStatus(saved.status); setHours(saved.hoursPlayed == null ? "" : String(saved.hoursPlayed)); setDate(saved.completedOn ?? ""); setReview(saved.review); setTags(saved.tags); setTagVersion((value) => value + 1); setSaveMessage(""); goBack(); }
function commit() {
  if ((date || null) !== saved.completedOn && date && date > new Date().toISOString().slice(0, 10)) { setSaveMessage("Completion date cannot be in the future. Your draft has been kept."); return; }
  if (invalidScore || (scoreInput.current && !scoreInput.current.validity.valid)) { setSaveMessage("Use a whole-number score from 0 to 100."); scoreInput.current?.focus(); return; }
  if ((date || null) !== saved.completedOn && dateInput.current && !dateInput.current.validity.valid) { setSaveMessage("Complete a valid calendar date, or clear it. Your draft has been kept."); return; }
  const hoursPlayed = parseHours(hours);
  if (hoursPlayed === undefined) { setSaveMessage("Enter nonnegative decimal hours, or leave playtime blank. Your draft has been kept."); return; }
  const maxHours = maximumPlaytime(game.releasedOn);
  if (hoursPlayed !== saved.hoursPlayed && hoursPlayed !== null && maxHours !== null && hoursPlayed > maxHours) { setSaveMessage("Playtime cannot exceed the hours elapsed since the game’s release. Your draft has been kept."); return; }
  const completedOn = date || null;
  const draft = { slug: game.slug, score, tier, tierManual, status, playStyle, review, platform, hoursPlayed, completedOn, tags, expectedUpdatedAt };
  startTransition(async () => {
    try {
      const result = await saveRating(draft);
      setSaveMessage(result.message); setConflict(!result.ok && result.message.startsWith("This entry changed"));
      if (result.ok) { clearStoredDraft(); setExpectedUpdatedAt(result.updatedAt ?? null); setSaved({ score, tier, status, playStyle:playStyle??null, review: review.trim(), platform, hoursPlayed, completedOn, tags: normalizeTags(tags)! }); setReview(review.trim()); setHours(hoursPlayed == null ? "" : String(hoursPlayed)); goBack(); }
    } catch { setSaveMessage("Saving is unavailable right now. Your draft has been kept; please try again."); }
  });
}
return (<>{conflict && <div role="alert" className="site-container mx-auto p-4"><p>{t(saveMessage)}</p><button type="button" onClick={() => { clearStoredDraft(); window.location.reload(); }} className="mt-3 min-h-11 rounded-lg bg-surface-container px-4 text-primary">{t("Discard draft and reload latest entry")}</button></div>}<fieldset disabled={pending} className="contents">
<div className="w-full  bg-surface"><div className="flex flex-col w-full">
<div className="relative w-full min-h-[calc(100dvh-var(--site-header-height))] flex items-stretch p-4 sm:p-6 lg:p-8 overflow-clip">
<div className="absolute inset-0 pointer-events-none overflow-hidden">
<div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-primary/5 rounded-full blur-[140px]"></div>

<div className="absolute bottom-0 right-10 w-[420px] h-[280px] bg-surface-container-high/40 rounded-full blur-[100px]"></div>

<div className="absolute inset-0 bg-[radial-gradient(#292a2d_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>

</div>

<div className="relative w-full min-w-0 bg-surface-container-low rounded-xl shadow-2xl overflow-clip flex flex-col">
<div className="w-full bg-surface-container px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
<div className="flex items-center gap-3 min-w-0">
<span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>

<span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{t("Your game entry")}</span>

<span className="hidden sm:inline text-outline-variant font-label-sm">{"/"}</span>

<span className="hidden sm:inline font-label-sm text-label-sm text-on-surface-variant/80">{canEdit ? t("Draft · save to keep changes") : t("Preview · sign in to save")}</span>

</div>

<div className="flex items-center gap-3">
<Link className="group flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors" title={t("Change Title")} type="button" href={`/search?mode=log&from=${encodeURIComponent(`/log?game=${game.slug}`)}`}>
<span aria-hidden="true" className="material-symbols-outlined text-[15px]">{"swap_horiz"}</span>

<span className="font-label-sm text-label-sm uppercase tracking-wider">{t("Switch Game")}</span>

</Link>

<BackLink aria-label={t("Close modal")} className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" href="/profile">
<span aria-hidden="true" className="material-symbols-outlined text-[20px]">{"close"}</span>

</BackLink>

</div>

</div>

<div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-2 items-start gap-8">
{!canEdit && <p className="xl:col-span-2 font-body-sm text-body-sm text-on-surface-variant">{t("Sign in to save your entry. ")}<Link href={`/login?next=${encodeURIComponent(`/log?game=${game.slug}`)}`} className="text-primary underline">{t("Sign in")}</Link> {t("to save entries to your own profile.")}</p>}

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

<p translate="no" className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 font-body-md text-body-md text-on-surface-variant">{game.developers?.length ? game.developers.map(name => <StudioName key={name} name={name} compact />) : game.genres?.join(" / ")}</p>

</div>

<div className="flex flex-col gap-2.5 mt-5 pt-5 bg-surface-container/40 -mx-3 px-3 py-3 rounded-lg">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{t("Platform Played")}</span>

<div className="flex flex-wrap gap-2" id="platform-selector">
<button type="button" onClick={() => setPlatform(isPC ? null : "pc")} title={t("Select platform; click again to clear")} aria-pressed={isPC} aria-expanded={isPC} aria-controls="pc-store-selector" className={`platform-btn min-h-11 px-3 py-1 rounded font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1.5 ${isPC ? "bg-primary/15 text-primary shadow-sm" : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright hover:text-on-surface"}`}><span aria-hidden="true" className="material-symbols-outlined text-[14px]">desktop_windows</span>PC</button>
<ConsolePlatformSelector family="PlayStation" value={platform} onChange={setPlatform} />
<ConsolePlatformSelector family="Xbox" value={platform} onChange={setPlatform} />
<ConsolePlatformSelector family="Nintendo" value={platform} onChange={setPlatform} />
<ConsolePlatformSelector family="Other platforms" value={platform} onChange={setPlatform} />
<button type="button" onClick={() => setPlatform(platform === "steam_deck" ? null : "steam_deck")} aria-pressed={platform === "steam_deck"} title={t("Select platform; click again to clear")} className={`platform-btn min-h-11 flex items-center gap-1.5 rounded px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider ${platform === "steam_deck" ? "bg-primary/15 text-primary" : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright hover:text-on-surface"}`}><span aria-hidden="true" className="material-symbols-outlined text-[14px]">tablet</span>Steam Deck</button>
</div>
{platform && !platform.startsWith("pc") && platform !== "steam_deck" && <p className="font-body-sm text-body-sm text-primary">{t(platform.startsWith("ps") || platform.startsWith("xbox") ? "Console" : "Platform")}: {t(playedPlatformLabels[platform])}</p>}
<div id="pc-store-selector" hidden={!isPC}>
  {isPC && <div className="ml-3 border-l-2 border-primary/30 pl-3 space-y-2" role="group" aria-label={t("PC store")}>
    <span className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{t("PC store")}</span>
    <div className="flex flex-wrap gap-2">{(Object.entries(playedPlatformLabels) as [PlayedPlatform, string][]).filter(([value]) => value.startsWith("pc")).map(([value,label]) => <button key={value} type="button" aria-label={t(label)} aria-pressed={platform === value} onClick={() => setPlatform(platform === value ? null : value)} title={t("Select platform; click again to clear")} className={`platform-btn min-h-11 px-3 py-1 rounded font-label-sm text-label-sm uppercase tracking-wider ${platform === value ? "bg-primary/15 text-primary shadow-sm" : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright hover:text-on-surface"}`}>{t(label).replace(/^PC \/ /, "")}</button>)}</div>
  </div>}
</div>

</div>

</div>

</div>

<div className="min-w-0 bg-surface-container/60 rounded-xl p-4 sm:p-8 flex flex-col items-center gap-6 relative">
<div className="w-full flex flex-wrap gap-2 items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{t("Score")}</span>

<TierBadge value={tierManual ? tier : tierForScore(score, profile.tierRanges)} onChange={value=>{setTier(value);setTierManual(true);}} />
</div>

<div className="flex flex-col items-center justify-center gap-1 my-2">
<div className="flex items-baseline gap-2">
<input ref={scoreInput} id="score-display" type="text" inputMode="numeric" maxLength={3} pattern="[0-9]{0,3}" value={score ?? ""} placeholder="—" aria-label={t("Numerical score from 0 to 100")} aria-invalid={invalidScore} onFocus={event => event.currentTarget.select()} onChange={event => { const value = event.target.value; if (!/^[0-9]{0,3}$/.test(value) || Number(value) > 100) return; setScore(value === "" ? null : Number(value)); setSaveMessage(""); }} style={{ width: `${Math.max(1, String(score ?? "").length)}ch` }} className="min-h-11 min-w-[3ch] appearance-none rounded-none border-0 border-b border-transparent bg-transparent p-0 text-center font-display-lg text-display-lg font-bold tracking-tighter text-primary font-headline-xl placeholder:text-primary placeholder:opacity-100 focus:border-primary/50 focus:outline-none" />

<span className="font-headline-md text-headline-md text-on-surface-variant">{"/100"}</span>

</div>

{score === null ? <p className="font-body-sm text-body-sm text-on-surface-variant">{t("Unrated · a score is optional")}</p> : <ScoreStars score={score} />}
<button id="toggle-score" type="button" className="mt-2 rounded bg-surface-container px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant hover:text-primary" onClick={() => setScore(score === null ? 0 : null)}>{score === null ? t("Add score") : t("Remove score")}</button>
</div>

<div className="w-full max-w-xl flex flex-col gap-3">
<div className="relative w-full flex items-center">
<input className="score-slider w-full cursor-pointer disabled:opacity-30" id="score-slider" max="100" min="0" step="1" type="range" value={score ?? 0} onPointerDown={(event) => setScore(Number(event.currentTarget.value))} onKeyDown={(event) => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) setScore(Number(event.currentTarget.value)); }} onChange={(event) => setScore(Number(event.target.value))} aria-label={t("Numerical score from 0 to 100")} aria-valuetext={score === null ? t("Unrated · a score is optional") : `${score} / 100`} />

</div>

<div id="score-descriptions" className="relative mx-[11px] h-8 text-on-surface-variant font-label-sm text-label-sm">
{["Terrible", "Poor", "Average", "Great", "Masterpiece"].map((description, index) => <span key={description} style={{ left: `${index * 25}%` }} aria-current={scoreDescription === description ? "true" : undefined} className={`absolute w-1/4 -translate-x-1/2 text-center ${scoreDescription === description ? "text-primary font-bold" : ""}`}>{t(description)}</span>)}
</div>

<div className="flex items-center justify-center gap-2 mt-2">
<button className="min-h-11 min-w-11 px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright font-label-sm text-label-sm transition-colors" type="button" disabled={score === null} onClick={() => setScore((previous) => Math.max(0, Math.min(100, (previous ?? 0) + -5)))}>{"-5"}</button>

<button className="min-h-11 min-w-11 px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright font-label-sm text-label-sm transition-colors" type="button" disabled={score === null} onClick={() => setScore((previous) => Math.max(0, Math.min(100, (previous ?? 0) + -1)))}>{"-1"}</button>

<div className="w-px h-4 bg-surface-container-highest mx-1"></div>

<button className="min-h-11 min-w-11 px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright font-label-sm text-label-sm transition-colors" type="button" disabled={score === null} onClick={() => setScore((previous) => Math.max(0, Math.min(100, (previous ?? 0) + 1)))}>{"+1"}</button>

<button className="min-h-11 min-w-11 px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright font-label-sm text-label-sm transition-colors" type="button" disabled={score === null} onClick={() => setScore((previous) => Math.max(0, Math.min(100, (previous ?? 0) + 5)))}>{"+5"}</button>

</div>

</div>

</div>

<div className="min-w-0 grid grid-cols-1 md:grid-cols-12 gap-6">
<div className="md:col-span-12 flex flex-col gap-2.5">
{draftReady && <PlaybackStatusPicker key={game.slug} slug={game.slug} value={status} onChange={setStatus} initialStyle={playStyle} onStyleChange={setPlayStyle}/>}

</div>

<div className="md:col-span-6 flex flex-col gap-2">
<label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant" htmlFor="hours-input">{t("Hours played")}</label>

<div className="relative flex items-center">
<span aria-hidden="true" className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">{"schedule"}</span>

<input className="min-w-0 w-full bg-surface-container pl-10 pr-4 py-2.5 rounded text-on-surface font-label-md text-label-md focus:outline-none focus:bg-surface-container-high transition-colors" id="hours-input" placeholder={t("Hours, e.g. 45.5")} type="text" inputMode="decimal" value={hours} onChange={(event) => { const value = event.target.value; const maxHours = maximumPlaytime(game.releasedOn); if (!value.trimStart().startsWith("-") && (maxHours === null || !value.trim() || Number.isNaN(Number(value)) || Number(value) <= maxHours)) setHours(value); }} />

</div>

</div>

<div className="md:col-span-6 flex flex-col gap-2">
<label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant" htmlFor="date-input">{t("Completion date")}</label>

<CompletionDate minDate={game.releasedOn ?? undefined} value={date} onChange={setDate} inputRef={dateInput} />

</div>

<div className="md:col-span-12 flex flex-col gap-2">
<div className="flex flex-wrap gap-2 items-center justify-between">
<label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant" htmlFor="dispatch-textarea">{t("Review")}</label>

<span className="font-label-sm text-label-sm text-on-surface-variant">{t("Plain text · 20,000 characters max")}</span>

</div>

<textarea className="w-full bg-surface-container p-4 rounded text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-high transition-colors resize-none leading-relaxed" id="dispatch-textarea" placeholder={t("Write a review (optional)...")} rows={4} maxLength={20000} value={review} onChange={(event) => setReview(event.target.value)}></textarea>

</div>

<div className="md:col-span-12 flex flex-col gap-2.5"><TagEditor key={tagVersion} tags={tags} onChange={setTags} />
</div>

</div>

</div>

{canEdit && game.logged && <div className="px-4 py-3 sm:px-10"><RemoveLog slug={game.slug} title={game.title} updatedAt={expectedUpdatedAt} onRemoved={clearStoredDraft} /></div>}
<div data-editor-save-row className="sticky bottom-0 z-30 mt-auto w-full border-t border-outline-variant/30 bg-surface-container-lowest px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:px-10 sm:py-5 space-y-3">
<p role="status" hidden={!pending && !saveMessage} className="font-body-sm text-body-sm text-primary break-words">{pending ? t("Saving…") : t(saveMessage)}</p>

<div className="flex items-center gap-3 w-full justify-end">
<button id="discard-rating" className="min-h-11 flex-1 sm:flex-none sm:w-auto px-4 py-2 rounded bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md uppercase tracking-wider transition-colors" type="button" onClick={resetDraft}>{t("Discard draft")}</button>

<button id="commit-rating" className="min-h-11 flex-1 sm:flex-none sm:w-auto px-6 py-2 rounded bg-primary-container text-on-primary-container hover:bg-primary font-label-md text-label-md uppercase tracking-wider font-semibold shadow-lg shadow-primary-container/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50" type="button" disabled={!canEdit || pending} onClick={commit}>
<span aria-hidden="true" className="material-symbols-outlined text-[18px]">{"bookmark_added"}</span>
{pending ? t("Saving…") : t(game.logged ? "Save changes" : "Save game")}</button>

</div>

</div>

</div>

</div>

</div>

</div>
</fieldset></>);
}
