"use client";
import { useMessages } from "@/components/site-preferences";


export function PortfolioError({ retry, locale }: { retry: () => void; locale?: import("@/lib/locale/preferences").SiteLocale }) {
  const t = useMessages(locale);
  return <div className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-24">
    <p className="font-label-md text-label-md uppercase tracking-wider text-primary mb-4">{t("Portfolio unavailable")}</p>
    <h1 className="font-headline-xl text-headline-xl mb-4">{t("We couldn’t load the portfolio.")}</h1>
    <p className="text-on-surface-variant mb-8">{t("Please try again in a moment.")}</p>
    <button type="button" onClick={retry} className="inline-flex rounded bg-primary-container text-on-primary-container px-5 py-3 font-label-md text-label-md uppercase">{t("Try again")}</button>
  </div>;
}
