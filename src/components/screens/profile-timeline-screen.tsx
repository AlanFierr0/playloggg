"use client";
import Link from "next/link";
import { CompletionMonthSections } from "@/components/completion-month-sections";
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
  const annual = completionYears(months);
  const shownYears = annual;
  const activeIndex = Math.max(0, shownYears.findIndex(group => group.year === activeYear));
  const activeGroup = shownYears[activeIndex];
  const yearMonths = completionChart(timeline.months.filter(group => group.month.startsWith(activeGroup?.year ?? "")));
  const points = yearMonths;
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
        <div className="space-y-1"><h2 className="font-headline-lg text-headline-lg">{t("Timeline")}</h2><p className="text-body-sm text-on-surface-variant">{t("Select a year pin, then choose a month.")}</p></div>
        {selectedMonth && <button type="button" onClick={()=>setSelectedMonth("")} className="min-h-11 rounded-xl px-3 text-body-sm text-primary hover:bg-surface-container">{t("Clear month filter")}</button>}
      </div>
      <div ref={rail} role="tablist" aria-label={t("Completion years")} aria-orientation="horizontal" className="relative flex min-w-0 overflow-x-auto overscroll-x-contain p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onKeyDown={event=>{
        const index=event.key==="ArrowRight"?Math.min(activeIndex+1,shownYears.length-1):event.key==="ArrowLeft"?Math.max(activeIndex-1,0):event.key==="Home"?0:event.key==="End"?shownYears.length-1:null;
        if(index!==null){event.preventDefault();chooseTimelineYear(index,true);}
      }}>
        {shownYears.map((group,index)=><button key={group.year} type="button" role="tab" id={`completion-tab-${group.year}`} data-year-choice={group.year} data-year-pin={group.year} data-year-count={group.games.length} aria-label={group.year} aria-describedby={`completion-count-${group.year}`} aria-selected={index===activeIndex} aria-controls="completion-year-panel" tabIndex={index===activeIndex?0:-1} onClick={()=>chooseTimelineYear(index)} className="group relative flex min-h-40 w-32 shrink-0 flex-col items-center rounded-xl px-3 pb-3 pt-4 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary">
          <span id={`completion-count-${group.year}`} className="sr-only">{group.games.length} {t(group.games.length===1?"Completed game":"Completed games")}</span>
          <span aria-hidden="true" className="absolute inset-x-0 top-[5.5rem] h-px bg-outline-variant/60"/>
          <span aria-hidden="true" className={`relative z-10 flex h-12 w-12 -rotate-45 items-center justify-center rounded-[50%_50%_50%_0] border-2 motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:-translate-y-1 ${index===activeIndex?"border-primary bg-primary text-on-primary":"border-primary/70 bg-surface-container text-primary"}`}><span className="rotate-45 text-body-lg font-semibold tabular-nums">{group.games.length}</span></span>
          <span aria-hidden="true" className="h-5 w-px bg-primary/70"/>
          <span aria-hidden="true" className="relative h-2 w-2 rounded-full bg-primary ring-4 ring-surface-container-low"/>
          <span className={`mt-3 text-body-lg font-semibold ${index===activeIndex?"text-primary":"text-on-surface"}`}>{group.year}</span>
          <span aria-hidden="true" className="mt-1 text-label-sm text-on-surface-variant">{t(group.games.length===1?"Completed game":"Completed games")}</span>
        </button>)}
      </div>
      <section id="completion-year-panel" role="tabpanel" aria-labelledby={`completion-tab-${activeGroup.year}`} data-timeline-year={activeGroup.year} tabIndex={0} className="min-w-0 space-y-5 border-t border-outline-variant/30 pt-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-center">
          <div className="space-y-2"><h3 aria-live="polite" aria-atomic="true" className="text-headline-xl font-semibold tabular-nums"><time dateTime={activeGroup.year}>{activeGroup.year}</time></h3><div className="flex flex-wrap gap-2">{activeGroup.genres.map(genre=><span key={genre} translate="no" className="rounded-lg bg-surface-container px-2.5 py-1 text-body-sm text-on-surface-variant">{genre}</span>)}</div></div>
          <dl className="grid grid-cols-2 gap-4 rounded-xl border border-outline-variant/30 bg-surface-container p-4 text-body-sm sm:grid-cols-3"><div><dt className="text-on-surface-variant">{t("Completed games")}</dt><dd className="mt-1 text-headline-lg font-semibold tabular-nums">{activeGroup.games.length}</dd></div><div><dt className="text-on-surface-variant">{t("Average score")}</dt><dd className="mt-1 text-headline-lg font-semibold tabular-nums text-primary">{activeGroup.average??"—"}</dd></div><div><dt className="text-on-surface-variant">{t("Recorded playtime")}</dt><dd className="mt-1 text-headline-lg font-semibold tabular-nums">{activeGroup.hours===null?"—":number(activeGroup.hours)} {t("hrs")}</dd></div></dl>
        </div>
        <CompletionMonthSections year={activeGroup.year} months={yearMonths} selectedMonth={selectedMonth} onSelect={setSelectedMonth}/>
        <p role="status" className="text-body-sm text-on-surface-variant">{selectedMonth?`${date(`2000-${selectedMonth}-01`,orbitMonthFormat)} · ${visibleGames.length} ${t(visibleGames.length===1?"Completed game":"Completed games")}`:t("Showing the whole year")}</p>
        {!visibleGames.length && <p className="rounded-xl border border-outline-variant/30 bg-surface-container p-4 text-body-sm text-on-surface-variant">{t("No games were completed in this month.")}</p>}
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
          <p className="text-body-sm text-on-surface-variant">{activeGroup?.year}</p>
          <p className="text-[36px] font-semibold leading-tight tabular-nums text-primary sm:text-[52px]">{selectedMonth ? points.find(point => point.period === selectedMonth)!.count : activeGroup?.games.length}</p>
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
