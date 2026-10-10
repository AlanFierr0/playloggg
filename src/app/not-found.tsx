import { getMessages } from "@/lib/locale/server";
import Link from "next/link";

export default async function NotFound() {
  const t = await getMessages();
  return (
    <section className="site-container mx-auto grid min-h-[65dvh] w-full items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.1fr_1fr] md:gap-12 md:py-16 lg:px-12">
      <div className="order-2 min-w-0 space-y-6 md:order-1">
        <p className="font-label-md text-label-md text-primary">{t("Error 404")}</p>
        <h1 className="max-w-[15ch] font-headline-xl text-[36px] font-semibold leading-[1.1] tracking-tight sm:text-[48px] lg:text-[56px]">{t("This page isn’t available.")}</h1>
        <p className="max-w-md text-body-lg leading-relaxed text-on-surface-variant">{t("This link may be outdated, or the page may have moved. Let’s get you back to your games.")}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/" className="ui-action bg-primary text-on-primary hover:bg-primary-container"><span aria-hidden="true" className="material-symbols-outlined text-[20px]">arrow_back</span>{t("Go home")}</Link>
          <Link href="/search?q=&from=/" className="ui-action border border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container-high"><span aria-hidden="true" className="material-symbols-outlined text-[20px]">search</span>{t("Search games")}</Link>
        </div>
      </div>
      <div aria-hidden="true" className="order-1 flex min-w-0 flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-low px-4 py-6 md:order-2 md:aspect-square md:py-12">
        <span className="font-label-lg text-[clamp(96px,18vw,240px)] font-bold leading-none tracking-tighter text-primary">404</span>
        <span className="material-symbols-outlined mt-4 text-[40px] text-primary md:mt-8 md:text-[56px]">sports_esports</span>
      </div>
    </section>
  );
}
