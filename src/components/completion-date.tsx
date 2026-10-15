"use client";
import { useRef, useState, type RefObject } from "react";
import { useMessages, useSitePreferences } from "@/components/site-preferences";

function dateValue(date: Date) {
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function calendarDate(year: number, month: number, day = 1) {
  const date = new Date(0);
  date.setFullYear(year, month, day);
  date.setHours(12, 0, 0, 0);
  return date;
}
const control = "rounded-lg p-2 text-on-surface hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";

export function CompletionDate({ value, onChange, inputRef, minDate = "0001-01-01" }: { minDate?: string; value: string; onChange: (value: string) => void; inputRef: RefObject<HTMLInputElement | null> }) {
  const t = useMessages();
  const { locale } = useSitePreferences();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [month, setMonth] = useState(0);
  const [focused, setFocused] = useState("");
  const minimum = new Date(`${minDate}T12:00:00`);
  const minMonth = minimum.getFullYear() * 12 + minimum.getMonth();
  const year = Math.floor(month / 12);
  const monthIndex = month % 12;
  const first = calendarDate(year, monthIndex);
  const offset = (first.getDay() + 6) % 7;
  const today = new Date().toISOString().slice(0, 10);
  const invalid = Boolean(value && (value < minDate || value > today));
  const format = (date: Date, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, options).format(date);
  function open() {
    const selected = value && value <= today ? value : today;
    const date = new Date(`${selected < minDate ? minDate : selected}T12:00:00`);
    setMonth(date.getFullYear() * 12 + date.getMonth());
    setFocused(dateValue(date));
    dialog.current?.showModal();
    requestAnimationFrame(() => dialog.current?.querySelector<HTMLButtonElement>(`[data-date="${dateValue(date)}"]`)?.focus());
  }
  function changeMonth(next: number) {
    next = Math.max(minMonth, Math.min(new Date().getUTCFullYear() * 12 + new Date().getUTCMonth(), next));
    setMonth(next);
    const firstDay = dateValue(calendarDate(Math.floor(next / 12), next % 12));
    setFocused(firstDay < minDate ? minDate : firstDay);
  }
  function select(next: string) { if (next && (next < minDate || next > today)) return; onChange(next); dialog.current?.close(); }
  function focusDate(date: Date) {
    if (date.getFullYear() < 1 || dateValue(date) > today) return;
    if (dateValue(date) < minDate) date = minimum;
    setMonth(date.getFullYear() * 12 + date.getMonth());
    setFocused(dateValue(date));
    requestAnimationFrame(() => dialog.current?.querySelector<HTMLButtonElement>(`[data-date="${dateValue(date)}"]`)?.focus());
  }
  return <>
    <div className="flex items-center rounded-lg border border-outline-variant/30 bg-surface-container focus-within:border-primary">
      <input ref={inputRef} id="date-input" type="date" min={minDate} max={today} value={value} onChange={event => onChange(event.target.value)} aria-invalid={invalid} aria-describedby={invalid ? "completion-date-error" : undefined} className="completion-date-input min-w-0 flex-1 appearance-none rounded-lg bg-transparent px-4 py-2.5 font-label-md text-label-md text-on-surface focus:outline-none" />
      <button ref={trigger} type="button" onClick={open} aria-label={t("Choose completion date")} aria-haspopup="dialog" className={`${control} mr-1 text-primary`}><span aria-hidden="true" className="material-symbols-outlined">calendar_month</span></button>
    </div>
    {invalid && <p id="completion-date-error" role="alert" className="mt-2 text-body-sm text-error">{t("Choose a completion date between release and today.")}</p>}
    <dialog ref={dialog} aria-labelledby="completion-calendar-title" onClose={() => trigger.current?.focus()} onClick={event => { if (event.target === dialog.current) { const rect = dialog.current.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.current.close(); } }} className="m-auto w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border border-outline-variant/40 bg-surface-container-low p-5 text-on-surface shadow-2xl backdrop:bg-black/50">
      <div className="mb-5 flex items-center justify-between gap-2"><h2 id="completion-calendar-title" className="font-headline-sm text-title-lg">{t("Completion date")}</h2><button type="button" aria-label={t("Close calendar")} onClick={() => dialog.current?.close()} className={control}><span aria-hidden="true" className="material-symbols-outlined text-[20px]">close</span></button></div>
      <div className="mb-4 flex items-center gap-2">
        <button type="button" disabled={month <= minMonth} aria-label={t("Previous month")} onClick={() => changeMonth(month - 1)} className={`${control} disabled:opacity-30`}><span aria-hidden="true" className="material-symbols-outlined text-[20px]">chevron_left</span></button>
        <select aria-label={t("Month")} value={monthIndex} onChange={event => changeMonth(year * 12 + Number(event.target.value))} className="min-w-0 flex-1 rounded-lg bg-surface-container px-2 py-2 font-body-md text-body-md focus-visible:outline-primary">{Array.from({ length: 12 }, (_, index) => <option key={index} value={index} disabled={year * 12 + index < minMonth}>{format(calendarDate(2026, index), { month: "long" })}</option>)}</select>
        <input aria-label={t("Year")} type="number" min={minimum.getFullYear()} max={new Date().getUTCFullYear()} value={year} onChange={event => { const next = Number(event.target.value); if (Number.isInteger(next) && next >= 1 && next <= 9999) changeMonth(next * 12 + monthIndex); }} className="w-[4.5rem] rounded-lg bg-surface-container px-2 py-2 text-center tabular-nums focus-visible:outline-primary" />
        <button type="button" disabled={month >= new Date().getUTCFullYear() * 12 + new Date().getUTCMonth()} aria-label={t("Next month")} onClick={() => changeMonth(month + 1)} className={`${control} disabled:opacity-30`}><span aria-hidden="true" className="material-symbols-outlined text-[20px]">chevron_right</span></button>
      </div>
      <p className="sr-only" aria-live="polite">{format(first, { month: "long", year: "numeric" })}</p>
      <div className="mb-2 grid grid-cols-7 text-center font-label-sm text-label-sm text-on-surface-variant">{Array.from({ length: 7 }, (_, index) => <span key={index} className="py-1">{format(calendarDate(2026, 0, 5 + index), { weekday: "short" })}</span>)}</div>
      <div className="grid grid-cols-7 gap-1" role="group" aria-label={t("Choose completion date")}>
        {Array.from({ length: 42 }, (_, index) => {
          const date = calendarDate(year, monthIndex, index - offset + 1);
          const key = dateValue(date);
          const selected = key === value;
          return <button key={key} type="button" data-date={key} aria-label={format(date, { dateStyle: "full" })} aria-pressed={selected} aria-current={key === today ? "date" : undefined} disabled={key < minDate || key > today} tabIndex={key === focused ? 0 : -1} onFocus={() => setFocused(key)} onClick={() => select(key)} onKeyDown={event => {
            const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -((date.getDay() + 6) % 7), End: 6 - ((date.getDay() + 6) % 7) }[event.key];
            if (delta !== undefined) { event.preventDefault(); focusDate(calendarDate(date.getFullYear(), date.getMonth(), date.getDate() + delta)); }
          }} className={`aspect-square rounded-lg text-body-md tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-20 ${selected ? "bg-primary-container font-bold text-on-primary-container" : "hover:bg-surface-container-high"} ${!selected && date.getMonth() !== monthIndex ? "text-on-surface-variant" : ""} ${key === today && !selected ? "ring-1 ring-inset ring-primary/60 text-primary" : ""}`}>{date.getDate()}</button>;
        })}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-outline-variant/30 pt-4"><button type="button" onClick={() => select("")} disabled={!value} className={`${control} text-on-surface-variant disabled:opacity-40`}>{t("Clear date")}</button><button type="button" onClick={() => select(today)} disabled={today < minDate} className="rounded-lg bg-primary-container disabled:opacity-40 px-4 py-2 font-label-md text-label-md text-on-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{t("Today")}</button></div>
    </dialog>
  </>;
}
