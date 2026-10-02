"use client";
import { useMessages } from "@/components/site-preferences";
export function RouteLoading() {
  const t=useMessages();
  return <section aria-busy="true" className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-6">
    <p role="status" className="flex items-center gap-3 text-on-surface-variant"><span aria-hidden="true" className="w-5 h-5 rounded-full border-2 border-primary/25 border-t-primary motion-safe:animate-spin"/>{t("Loading…")}</p>
    <div aria-hidden="true" className="motion-safe:animate-pulse space-y-6"><div className="h-10 w-2/3 max-w-lg rounded-xl bg-surface-container"/><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">{Array.from({length:5},(_,index)=><div key={index} className="aspect-[3/4] rounded-xl bg-surface-container-low"/>)}</div></div>
  </section>;
}
