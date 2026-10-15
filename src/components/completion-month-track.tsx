"use client";
import { useEffect, useRef } from "react";
import { useMessages, useSitePreferences } from "@/components/site-preferences";

export function CompletionMonthTrack({ year, months, selectedMonth, onSelect }: { year: string; months: { period: string; count: number }[]; selectedMonth: string; onSelect: (month: string) => void }) {
  const t = useMessages(), { locale } = useSitePreferences();
  const rail = useRef<HTMLDivElement>(null);
  const shortMonth = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  const longMonth = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" });
  const monthName = (period: string, length: "short" | "long") => (length === "long" ? longMonth : shortMonth).format(new Date(`2000-${period}-01T00:00:00Z`));
  useEffect(() => {
    const element = rail.current;
    const choice = element?.querySelector<HTMLButtonElement>(selectedMonth ? `[data-month-pin="${selectedMonth}"]` : "[data-month-pin]:not(:disabled)");
    if (element && choice) element.scrollTo({left:choice.offsetLeft-(element.clientWidth-choice.offsetWidth)/2,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  }, [year, selectedMonth]);
  return <figure aria-label={`${t("Monthly completions")} · ${year}`} className="min-w-0 space-y-2 rounded-xl bg-surface-container-lowest/50 px-2 py-4 sm:px-4">
    <figcaption className="flex flex-wrap items-center justify-between gap-2 px-2">
      <div><p className="text-body-md font-semibold">{t("Monthly completions")}</p><p className="text-body-sm text-on-surface-variant">{t("Select a pin to explore a month.")}</p></div>
      <button type="button" aria-pressed={!selectedMonth} onClick={()=>onSelect("")} className={`min-h-11 rounded-lg px-3 text-body-sm ${!selectedMonth?"bg-primary/10 text-primary":"text-on-surface-variant hover:bg-surface-container"}`}>{t("Whole year")}</button>
    </figcaption>
    <div ref={rail} role="group" aria-label={`${t("Monthly completions")} · ${year}`} className="relative flex min-w-0 overflow-x-auto overscroll-x-contain px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onKeyDown={event=>{
      const choices=Array.from(rail.current?.querySelectorAll<HTMLButtonElement>("[data-month-pin]:not(:disabled)")??[]);
      const current=choices.indexOf(event.target as HTMLButtonElement);
      const next=event.key==="ArrowRight"?Math.min(current+1,choices.length-1):event.key==="ArrowLeft"?Math.max(current-1,0):event.key==="Home"?0:event.key==="End"?choices.length-1:null;
      if(next!==null){event.preventDefault();const button=choices[next];button?.focus({preventScroll:true});button?.scrollIntoView({block:"nearest",inline:"nearest",behavior:"instant"});}
    }}>
      {months.map(point=>{
        const selected=point.period===selectedMonth;
        return <button key={point.period} type="button" data-month-pin={point.period} data-month-count={point.count} disabled={!point.count} aria-pressed={selected} aria-controls="completion-year-games" aria-label={`${monthName(point.period,"long")} ${year}: ${point.count} ${t(point.count===1?"Completed game":"Completed games")}`} onClick={()=>onSelect(selected?"":point.period)} className="group relative flex min-h-32 min-w-[4.5rem] flex-1 flex-col items-center rounded-lg px-2 pb-2 pt-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary disabled:cursor-default">
          <span aria-hidden="true" className="absolute inset-x-0 top-20 h-px bg-outline-variant/60"/>
          <span aria-hidden="true" className={`relative z-10 flex h-10 w-10 shrink-0 -rotate-45 items-center justify-center rounded-[50%_50%_50%_0] border-2 motion-safe:transition-transform motion-safe:duration-150 ${point.count?"motion-safe:group-hover:-translate-y-1":""} ${selected?"border-primary bg-primary text-on-primary":point.count?"border-primary/70 bg-surface-container text-primary":"border-outline-variant/60 bg-surface-container-low text-on-surface-variant"}`}><span className="rotate-45 text-body-lg font-semibold tabular-nums">{point.count}</span></span>
          <span aria-hidden="true" className={`h-6 w-px ${point.count?"bg-primary/70":"bg-outline-variant/60"}`}/>
          <span aria-hidden="true" className={`relative h-2 w-2 rounded-full ring-4 ring-surface-container-low ${point.count?"bg-primary":"border border-outline-variant bg-surface-container-low"}`}/>
          <span className={`mt-3 text-body-sm ${selected?"font-semibold text-primary":"text-on-surface-variant"}`}>{monthName(point.period,"short")}</span>
        </button>;
      })}
    </div>
    <p className="px-2 text-label-sm text-on-surface-variant lg:hidden">{t("Scroll to explore all twelve months.")}</p>
  </figure>;
}
