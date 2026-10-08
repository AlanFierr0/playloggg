"use client";
import { useRef, type ReactNode } from "react";
import { useMessages } from "@/components/site-preferences";

export function ReviewCarousel({ children }: { children: ReactNode[] }) {
  const t = useMessages(), track = useRef<HTMLDivElement>(null);
  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <section aria-label={t("Best reviews")} className="space-y-5">
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-2"><h2 className="font-headline-lg text-headline-lg">{t("Best reviews")}</h2><p className="text-body-sm text-on-surface-variant">{t("Ranked by upvotes minus downvotes.")}</p></div>
      {children.length > 1 && <div className="flex shrink-0 gap-2">
        {[{ direction: -1, label: "Previous reviews", icon: "chevron_left" }, { direction: 1, label: "Next reviews", icon: "chevron_right" }].map(button => <button key={button.direction} type="button" aria-label={t(button.label)} onClick={() => move(button.direction)} className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-high text-primary hover:bg-surface-container-highest"><span aria-hidden="true" className="material-symbols-outlined">{button.icon}</span></button>)}
      </div>}
    </div>
    <div ref={track} role="group" aria-label={t("Review carousel")} tabIndex={0} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
      {children.map((child, index) => <div key={index} className="w-[90%] shrink-0 snap-start sm:w-[calc((100%_-_1rem)/2)] xl:w-[calc((100%_-_2rem)/3)]">{child}</div>)}
    </div>
  </section>;
}
