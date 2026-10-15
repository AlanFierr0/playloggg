"use client";
import Link from "next/link";
import { CompletionMonthTrack } from "@/components/completion-month-track";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProfileNavigation } from "@/components/profile-navigation";
import { usePortfolio } from "@/components/portfolio-provider";
import { useMessages, useSitePreferences } from "@/components/site-preferences";
import { completionChart, completionTimeline, completionYears } from "@/lib/completion-timeline";

export function ProfileTimelineScreen() {
  const { games } = usePortfolio(), t = useMessages(), { locale } = useSitePreferences();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [year, setYear] = useState(""), [activeYear, setActiveYear] = useState("");
  const rail = useRef<HTMLDivElement>(null), history = useRef<HTMLElement>(null);
  const timeline = useMemo(() => completionTimeline(games), [games]);
  const years = [...new Set(timeline.months.map(group => group.month.slice(0, 4)))];
  const months = timeline.months.filter(group => !year || group.month.startsWith(year));
  const points = completionChart(months);
  const annual = completionYears(months);
  const shownYears = annual;
  const activeIndex = Math.max(0, shownYears.findIndex(group => group.year === activeYear));
  const activeGroup = shownYears[activeIndex];
  const yearMonths = completionChart(timeline.months.filter(group => group.month.startsWith(activeGroup?.year ?? "")));
  const visibleGames = activeGroup?.games.filter(game => !selectedMonth || game.completedOn!.slice(5, 7) === selectedMonth) ?? [];
  useEffect(() => {
    const element = rail.current;
    const choice = element?.querySelector<HTMLButtonElement>(`[data-year-choice="${activeGroup?.year}"]`);
    if (element && choice) element.scrollTo({left:choice.offsetLeft-(element.clientWidth-choice.offsetWidth)/2,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  }, [activeGroup?.year, year, selectedMonth]);
  const peak = Math.max(1, ...points.map(point => point.count));
  const dated = months.flatMap(group => group.games);
  const recorded = dated.filter(game => game.hoursPlayed != null);
  const number = (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 2 });
  const orbitMonthFormat = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" });
  const shortMonthFormat = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  const dayFormat = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" });
  const date = (value: string, format: Intl.DateTimeFormat) => format.format(new Date(`${value}T00:00:00Z`));
  function chooseYear(value: string) { setYear(value); setSelectedMonth(""); setActiveYear(""); }
  function chooseTimelineYear(index:number,focus=false){
    const group=shownYears[index];if(!group)return;
    setActiveYear(group.year);setSelectedMonth("");
    if(focus)rail.current?.querySelector<HTMLButtonElement>(`[data-year-choice="${group.year}"]`)?.focus({preventScroll:true});
  }
  function chooseOrbitMonth(value:string){
    setSelectedMonth(value);
    if(value&&!activeGroup?.games.some(game=>game.completedOn!.slice(5,7)===value)){
      const match=annual.find(group=>group.games.some(game=>game.completedOn!.slice(5,7)===value));
      if(match)setActiveYear(match.year);
    }
    history.current?.focus({preventScroll:true});
    history.current?.scrollIntoView({block:"start",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  }
  return <section className="site-container mx-auto w-full min-w-0 space-y-8 px-4 py-8 sm:px-6 lg:px-12">
    <ProfileNavigation />
    <header className="space-y-5 border-b border-outline-variant/30 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-2"><h1 className="font-headline-xl text-headline-xl">{t("Completion timeline")}</h1><p className="text-body-md text-on-surface-variant">{t("Your finished games, year by year.")}</p></div>
        {years.length > 0 && <label className="space-y-1 text-body-sm"><span className="block text-on-surface-variant">{t("Year")}</span><select aria-label={t("Year")} value={year} onChange={event => chooseYear(event.target.value)} className="min-h-11 rounded-xl border border-outline-variant/40 bg-surface-container px-3"><option value="">{t("All years")}</option>{years.map(value => <option key={value} value={value}>{value}</option>)}</select></label>}
      </div>
      <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        <div><dt className="text-body-sm text-on-surface-variant">{t("Dated completions")}</dt><dd className="mt-1 text-headline-xl font-semibold tabular-nums text-primary">{dated.length}</dd></div>
        <div><dt className="text-body-sm text-on-surface-variant">{t("Recorded playtime")}</dt><dd className="mt-1 text-headline-xl font-semibold tabular-nums">{recorded.length ? number(recorded.reduce((sum, game) => sum + game.hoursPlayed!, 0)) : "—"}<span className="ml-1 text-body-sm font-normal text-on-surface-variant">{t("hrs")}</span><span className="block text-body-sm font-normal text-on-surface-variant">{recorded.length} / {dated.length} {t("Games with recorded hours")}</span></dd></div>
        <div><dt className="text-body-sm text-on-surface-variant">{t("Completion years")}</dt><dd className="mt-1 text-headline-xl font-semibold tabular-nums">{annual.length}</dd></div>
      </dl>
      <p className="max-w-3xl text-body-sm text-on-surface-variant">{t("Playtime and scores are current values for games completed in each year, not a history of changes.")}</p>
    </header>
    {activeGroup ? <section ref={history} tabIndex={-1} aria-label={t("Timeline")} className="min-w-0 scroll-mt-24 space-y-5 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1"><h2 className="font-headline-lg text-headline-lg">{t("Timeline")}</h2><p className="text-body-sm text-on-surface-variant">{t("Select a year, then explore its monthly pins.")}</p></div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedMonth && <button type="button" onClick={()=>setSelectedMonth("")} className="min-h-11 rounded-xl px-3 text-body-sm text-primary hover:bg-surface-container">{t("Clear month filter")}</button>}
          {shownYears.length>1&&<><button type="button" disabled={activeIndex===0} aria-label={t("Newer year")} onClick={()=>chooseTimelineYear(activeIndex-1)} className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-outline-variant/40 px-3 text-body-sm hover:bg-surface-container disabled:opacity-30"><span aria-hidden="true" className="material-symbols-outlined text-[20px]">chevron_left</span><span className="hidden sm:inline">{t("Newer")}</span></button>
          <button type="button" disabled={activeIndex===shownYears.length-1} aria-label={t("Older year")} onClick={()=>chooseTimelineYear(activeIndex+1)} className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-outline-variant/40 px-3 text-body-sm hover:bg-surface-container disabled:opacity-30"><span className="hidden sm:inline">{t("Older")}</span><span aria-hidden="true" className="material-symbols-outlined text-[20px]">chevron_right</span></button></>}
        </div>
      </div>
      <div ref={rail} role="tablist" aria-label={t("Completion years")} aria-orientation="horizontal" className="relative flex min-w-0 overflow-x-auto overscroll-x-contain gap-2 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onKeyDown={event=>{
        const index=event.key==="ArrowRight"?Math.min(activeIndex+1,shownYears.length-1):event.key==="ArrowLeft"?Math.max(activeIndex-1,0):event.key==="Home"?0:event.key==="End"?shownYears.length-1:null;
        if(index!==null){event.preventDefault();chooseTimelineYear(index,true);}
      }}>
        {shownYears.map((group,index)=><button key={group.year} type="button" role="tab" id={`completion-tab-${group.year}`} data-year-choice={group.year} aria-label={group.year} aria-selected={index===activeIndex} aria-controls="completion-year-panel" tabIndex={index===activeIndex?0:-1} onClick={()=>chooseTimelineYear(index)} className={`inline-flex min-h-11 shrink-0 items-center gap-3 rounded-lg border px-4 py-3 text-body-md motion-safe:transition-colors ${index===activeIndex?"border-primary/60 bg-primary/10 font-semibold text-primary":"border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"}`}>
          <span>{group.year}</span><span aria-hidden="true" title={`${group.games.length} ${t("Completed games")}`} className="rounded bg-surface-container px-2 py-0.5 text-label-sm font-normal tabular-nums text-on-surface-variant">{group.games.length}</span>
        </button>)}
      </div>
      <section id="completion-year-panel" role="tabpanel" aria-labelledby={`completion-tab-${activeGroup.year}`} data-timeline-year={activeGroup.year} tabIndex={0} className="min-w-0 space-y-5 border-t border-outline-variant/30 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2"><h3 aria-live="polite" aria-atomic="true" className="font-headline-lg text-headline-lg"><time dateTime={activeGroup.year}>{activeGroup.year}</time></h3><div className="flex flex-wrap gap-2">{activeGroup.genres.map(genre=><span key={genre} translate="no" className="rounded-lg bg-surface-container px-2.5 py-1 text-body-sm text-on-surface-variant">{genre}</span>)}</div></div>
          <dl className="flex flex-wrap gap-x-5 gap-y-2 text-body-sm"><div><dt className="text-on-surface-variant">{t("Completed games")}</dt><dd className="font-semibold tabular-nums">{activeGroup.games.length}</dd></div><div><dt className="text-on-surface-variant">{t("Average score")}</dt><dd className="font-semibold tabular-nums text-primary">{activeGroup.average??"—"}</dd></div><div><dt className="text-on-surface-variant">{t("Recorded playtime")}</dt><dd className="font-semibold tabular-nums">{activeGroup.hours===null?"—":number(activeGroup.hours)} {t("hrs")}</dd></div></dl>
        </div>
        <CompletionMonthTrack year={activeGroup.year} months={yearMonths} selectedMonth={selectedMonth} onSelect={setSelectedMonth}/>
        <p role="status" className="text-body-sm text-on-surface-variant">{selectedMonth?`${date(`2000-${selectedMonth}-01`,orbitMonthFormat)} · ${visibleGames.length} ${t(visibleGames.length===1?"Completed game":"Completed games")}`:t("Showing the whole year")}</p>
        <div id="completion-year-games" className={`grid gap-3 ${visibleGames.length>1?"sm:grid-cols-2":""} ${visibleGames.length>2?"xl:grid-cols-3":""}`}>{visibleGames.map(game=><Link key={game.slug} href={`/game/${game.slug}`} className="group flex min-w-0 items-start gap-3 rounded-xl border border-outline-variant/20 bg-surface-container p-3 transition-colors hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
          <img src={game.cover} alt="" loading="lazy" className="h-24 w-16 shrink-0 rounded-lg object-cover bg-surface-container-high"/>
          <div className="min-w-0 space-y-2"><h4 translate="no" className="line-clamp-2 text-body-md font-semibold group-hover:text-primary">{game.title}</h4><time dateTime={game.completedOn!} className="block text-body-sm text-on-surface-variant">{date(game.completedOn!,dayFormat)}</time><p className="text-body-sm"><span className="font-semibold tabular-nums text-primary">{game.score===null?t("Unrated"):`${game.score} / 100`}</span>{game.hoursPlayed!=null&&<span className="text-on-surface-variant"> · {number(game.hoursPlayed)} {t("hrs")}</span>}</p></div>
        </Link>)}</div>
      </section>
    </section> : <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6 sm:p-8 space-y-3"><h2 className="font-headline-lg text-headline-lg">{t("Your timeline starts with a completion date.")}</h2><p className="text-body-md text-on-surface-variant">{t("Mark a game completed and add its completion date to see it here.")}</p><Link href="/log" className="ui-action bg-primary text-on-primary">{t("Log a game")}</Link></div>}
    {months.length > 0 && <figure className="space-y-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 sm:p-6">
      <figcaption className="space-y-1"><h2 className="font-headline-lg text-headline-lg">{t("Your gaming orbit")}</h2><p className="text-body-sm text-on-surface-variant">{t("Larger circles mean more completed games. Select a month to explore it.")}</p></figcaption>
      <div role="region" aria-label={t("Completion chart")} className="relative mx-auto aspect-square w-full max-w-[520px] rounded-xl">
        <div aria-hidden="true" className="absolute inset-[15%] rounded-full border border-dashed border-outline-variant/60" />
        <div aria-hidden="true" className="absolute inset-[30%] rounded-full border border-outline-variant/20" />
        <div className="absolute inset-[32%] flex flex-col items-center justify-center text-center">
          {selectedMonth && <p className="text-body-sm text-on-surface-variant">{date(`2000-${selectedMonth}-01`, orbitMonthFormat)}</p>}
          <p className="text-body-sm text-on-surface-variant">{year || t("All years")}</p>
          <p className="text-[36px] font-semibold leading-tight tabular-nums text-primary sm:text-[52px]">{selectedMonth ? points.find(point => point.period === selectedMonth)!.count : dated.length}</p>
          <p className="text-label-sm text-on-surface-variant">{t("Completed games")}</p>
        </div>
        <ol>{points.map((point, index) => {
          const angle = index * Math.PI / 6;
          const label = date(`2000-${point.period}-01`, orbitMonthFormat);
          const diameter = point.count ? Math.max(24, Math.sqrt(point.count / peak) * 42) : 18;
          const selected = selectedMonth === point.period;
          return <li key={point.period} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${50 + 35 * Math.sin(angle)}%`, top: `${50 - 35 * Math.cos(angle)}%` }} data-completion-period={point.period} data-completion-count={point.count}>
            <button type="button" disabled={!point.count} aria-pressed={selected} aria-label={`${label}: ${point.count} ${t("Completed games")}`} onClick={() => chooseOrbitMonth(selected ? "" : point.period)} className="group relative flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-default">
              <span style={{ width: `${diameter}px`, height: `${diameter}px` }} className={`inline-flex shrink-0 items-center justify-center rounded-full text-label-sm font-semibold tabular-nums motion-safe:transition-[transform,background-color] motion-safe:duration-150 ${point.count ? "bg-primary text-on-primary group-hover:bg-primary-container group-hover:text-on-primary-container motion-safe:group-hover:scale-110" : "border border-outline-variant/60 text-on-surface-variant"} ${selected ? "ring-2 ring-primary ring-offset-4 ring-offset-surface-container-low" : ""}`}>{point.count || ""}</span>
              <span className={`absolute top-full mt-1 whitespace-nowrap text-label-sm ${selected ? "font-semibold text-primary" : "text-on-surface-variant"}`}>{date(`2000-${point.period}-01`, shortMonthFormat)}</span>
            </button>
          </li>;
        })}</ol>
      </div>
      <div className="flex justify-center"><button type="button" aria-pressed={!selectedMonth} onClick={() => chooseOrbitMonth("")} className={`min-h-11 rounded-xl px-4 text-body-sm ${!selectedMonth ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container"}`}>{t("All months")}</button></div>
    </figure>}
    {timeline.undated.length > 0 && <section className="space-y-4 border-t border-outline-variant/30 pt-6"><h2 className="font-headline-lg text-headline-lg">{t("Completed without a date")} <span className="text-on-surface-variant">({timeline.undated.length})</span></h2><p className="text-body-sm text-on-surface-variant">{t("Add a completion date to place these games on your timeline.")}</p><div className="flex flex-wrap gap-2">{timeline.undated.map(game => <Link key={game.slug} href={`/log?game=${encodeURIComponent(game.slug)}`} translate="no" className="inline-flex min-h-11 items-center rounded-xl border border-outline-variant/30 px-3 text-body-sm hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{game.title}</Link>)}</div></section>}
  </section>;
}
