"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { useMessages } from "@/components/site-preferences";

export function HomeCarousel({ children, kind = "reviews" }: { children: ReactNode[]; kind?: "reviews" | "games" }) {
  const games = kind === "games";
  const t = useMessages(), track = useRef<HTMLDivElement>(null);
  const transition = useRef<Animation | null>(null);
  useEffect(() => () => transition.current?.cancel(), []);
  async function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const end = element.scrollWidth - element.clientWidth;
    const left = direction > 0 && element.scrollLeft >= end - 1 ? 0
      : direction < 0 && element.scrollLeft <= 1 ? end
      : element.scrollLeft + direction * element.clientWidth;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      transition.current?.cancel();
      element.scrollTo({ left, behavior: "instant" });
      return;
    }
    if (transition.current) return;
    const looping = end > 1 && (direction > 0 ? element.scrollLeft >= end - 1 : element.scrollLeft <= 1);
    if (!looping) {
      element.scrollTo({ left, behavior: "smooth" });
      return;
    }
    let animation = element.animate({ opacity: [1, 0] }, { duration: 100, easing: "ease-out", fill: "forwards" });
    transition.current = animation;
    try {
      await animation.finished;
      element.scrollTo({ left, behavior: "instant" });
      animation.cancel();
      animation = element.animate({ opacity: [0, 1] }, { duration: 180, easing: "ease-out" });
      transition.current = animation;
      await animation.finished;
    } catch {
      // Cancellation on unmount or a reduced-motion request ends the transition.
    } finally {
      animation.cancel();
      if (transition.current === animation) transition.current = null;
    }
  }
  return <section aria-label={t(games ? "Trending games" : "Best reviews")} className="space-y-5">
    <div className="space-y-2"><h2 className="font-headline-lg text-headline-lg">{t(games ? "Trending games" : "Best reviews")}</h2><p className="text-body-sm text-on-surface-variant">{t(games ? "Distinct people who changed a score in the last 30 days." : "Ranked by upvotes minus downvotes.")}</p></div>
    <div className={children.length > 1 ? "grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2 sm:gap-3" : "min-w-0"}>
      {children.length > 1 && <button type="button" aria-label={t(games ? "Previous games" : "Previous reviews")} onClick={() => move(-1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-high text-primary hover:bg-surface-container-highest motion-safe:transition-[background-color,transform] motion-safe:duration-150 motion-safe:hover:scale-105 motion-safe:active:scale-95"><span aria-hidden="true" className="material-symbols-outlined">chevron_left</span></button>}
      <div ref={track} role="group" aria-label={t(games ? "Trending games carousel" : "Review carousel")} tabIndex={0} onKeyDown={event => {
        if (event.target === event.currentTarget && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
          event.preventDefault();
          move(event.key === "ArrowRight" ? 1 : -1);
        }
      }} className="flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children.map((child, index) => <div key={index} className={`shrink-0 snap-start ${games ? "w-[44%] sm:w-[calc((100%_-_2rem)/3)] lg:w-[calc((100%_-_3rem)/4)]" : "w-[90%] sm:w-[calc((100%_-_1rem)/2)] xl:w-[calc((100%_-_2rem)/3)]"}`}>{child}</div>)}
      </div>
      {children.length > 1 && <button type="button" aria-label={t(games ? "Next games" : "Next reviews")} onClick={() => move(1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-high text-primary hover:bg-surface-container-highest motion-safe:transition-[background-color,transform] motion-safe:duration-150 motion-safe:hover:scale-105 motion-safe:active:scale-95"><span aria-hidden="true" className="material-symbols-outlined">chevron_right</span></button>}
    </div>
  </section>;
}
