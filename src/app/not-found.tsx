import { getMessages } from "@/lib/locale/server";
import Link from "next/link";
import Image from "next/image";

export default async function NotFound() {
  const t = await getMessages();
  return (
    <section className="site-container mx-auto grid min-h-[65dvh] w-full items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_1.25fr] md:gap-12 md:py-16 lg:px-12">
      <div className="order-2 min-w-0 space-y-6 md:order-1">
        <p className="font-label-md text-label-md text-primary">{t("Error 404")}</p>
        <h1 className="max-w-[15ch] font-headline-xl text-[36px] font-semibold leading-[1.1] tracking-tight sm:text-[48px] lg:text-[56px]">{t("Nothing to play here.")}</h1>
        <p className="max-w-md text-body-lg leading-relaxed text-on-surface-variant">{t("This page is missing. Your next favorite game is still out there, waiting to join your backlog.")}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/" className="ui-action bg-primary text-on-primary hover:bg-primary-container"><span aria-hidden="true" className="material-symbols-outlined text-[20px]">arrow_back</span>{t("Back to Playlogg")}</Link>
          <Link href="/search?q=&from=/" className="ui-action border border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container-high"><span aria-hidden="true" className="material-symbols-outlined text-[20px]">search</span>{t("Find a game")}</Link>
        </div>
      </div>
      <div aria-hidden="true" className="order-1 relative min-w-0 md:order-2">
        <div className="flex items-center border-b border-outline-variant/30 pb-3 font-label-md text-label-md text-on-surface-variant">
          <span>{t("Page not found")}</span>
        </div>
        <Image src="/images/backlog-404.webp" alt="" width={1536} height={1024} priority sizes="(min-width: 768px) 55vw, 100vw" className="h-auto w-full" />
        <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
          <span className="h-2 w-2 rounded-full bg-primary" />
          {t("Next quest: clear your backlog.")}
        </div>
      </div>
    </section>
  );
}
