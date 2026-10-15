"use client";
import { useRef } from "react";
import { useMessages, useSitePreferences } from "@/components/site-preferences";

export function CompletionMonthSections({ year, months, selectedMonth, onSelect }: { year: string; months: { period: string; count: number }[]; selectedMonth: string; onSelect: (month: string) => void }) {
  const t = useMessages(), { locale } = useSitePreferences();
  const sections = useRef<HTMLDivElement>(null);
  const shortMonth = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  const longMonth = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" });
  const monthName = (period: string, length: "short" | "long") => (length === "long" ? longMonth : shortMonth).format(new Date(`2000-${period}-01T00:00:00Z`));
  return <figure aria-label={`${t("Monthly completions")} · ${year}`} className="min-w-0 space-y-2 rounded-xl bg-surface-container-lowest/50 px-2 py-4 sm:px-4">
    <figcaption className="flex flex-wrap items-center justify-between gap-2 px-2">
      <div><p className="text-body-md font-semibold">{t("Monthly completions")}</p><p className="text-body-sm text-on-surface-variant">{t("Choose a month to see its completed games.")}</p></div>
      <button type="button" aria-pressed={!selectedMonth} onClick={()=>onSelect("")} className={`min-h-11 rounded-lg px-3 text-body-sm ${!selectedMonth?"bg-primary/10 text-primary":"text-on-surface-variant hover:bg-surface-container"}`}>{t("Whole year")}</button>
    </figcaption>
    <div ref={sections} role="group" aria-label={`${t("Monthly completions")} · ${year}`} className="grid min-w-0 grid-cols-3 gap-2 px-2 py-2 sm:grid-cols-4 xl:grid-cols-6" onKeyDown={event=>{
      const choices=Array.from(sections.current?.querySelectorAll<HTMLButtonElement>("[data-month-section]")??[]);
      const current=choices.indexOf(event.target as HTMLButtonElement);
      const next=event.key==="ArrowRight"?Math.min(current+1,choices.length-1):event.key==="ArrowLeft"?Math.max(current-1,0):event.key==="Home"?0:event.key==="End"?choices.length-1:null;
      if(next!==null){event.preventDefault();const button=choices[next];button?.focus({preventScroll:true});button?.scrollIntoView({block:"nearest",inline:"nearest",behavior:"instant"});}
    }}>
      {months.map(point=>{
        const selected=point.period===selectedMonth;
        return <button key={point.period} type="button" data-month-section={point.period} data-month-count={point.count} aria-pressed={selected} aria-controls="completion-year-games" aria-label={`${monthName(point.period,"long")} ${year}: ${point.count} ${t(point.count===1?"Completed game":"Completed games")}`} onClick={()=>onSelect(selected?"":point.period)} className={`min-h-16 min-w-0 rounded-xl border px-2 py-3 text-left sm:px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-safe:transition-colors ${selected?"border-primary bg-primary/10":point.count?"border-outline-variant/50 bg-surface-container hover:border-primary/70 hover:bg-surface-container-high":"border-outline-variant/20 bg-surface-container-low"}`}>
          <span className="flex min-w-0 flex-wrap items-center justify-between gap-2"><span className={`text-body-sm ${selected?"font-semibold text-primary":"text-on-surface-variant"}`}><span className="sm:hidden">{monthName(point.period,"short")}</span><span className="hidden sm:inline">{monthName(point.period,"long")}</span></span><span className={`text-body-lg font-semibold tabular-nums ${point.count?"text-primary":"text-on-surface-variant"}`}>{point.count}</span></span>
        </button>;
      })}
    </div>
  </figure>;
}
