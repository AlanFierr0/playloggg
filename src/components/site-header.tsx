"use client";
import { useMessages } from "@/components/site-preferences";


import Link from "next/link";
import { useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ProfileAvatar } from "@/components/profile-avatar";
import { usePortfolio } from "@/components/portfolio-provider";
import { useSitePreferences } from "@/components/site-preferences";

const navigation = [{ href: "/games", label: "Games" }, { href: "/tiers", label: "Tier List" }, { href: "/people", label: "Profiles" }, { href: "/compare", label: "Compare" }];

export function SiteHeader() {
  const t = useMessages();
  const menu = useRef<HTMLDetailsElement>(null);
  function closeMenu() { if (menu.current) menu.current.open = false; }
  const { access, profile } = usePortfolio();
  const { locale, theme, setLocale, setTheme } = useSitePreferences();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnPath = searchParams.size ? `${pathname}?${searchParams}` : pathname;
  const searchHref = `/search?q=&from=${encodeURIComponent(pathname === "/search" ? "/" : returnPath)}`;
  const isActive = (href: string) => pathname === href;
  return (
    <header onKeyDown={event => { if (event.key === "Escape" && menu.current?.open) { closeMenu(); menu.current.querySelector("summary")?.focus(); } }} className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 site-container mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-2 lg:gap-6">
        <div className="flex min-w-0 shrink-0 items-center gap-4 xl:gap-8">
          <Link className="flex shrink-0 items-center gap-2 lg:gap-3 group min-h-11" href="/" onClick={closeMenu} aria-label={t("Playlogg home")} aria-current={pathname === "/" ? "page" : undefined}>
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-[28px]">sports_esports</span>
            <span translate="no" className="font-headline-md text-headline-md tracking-tight uppercase text-on-surface font-bold">Playlog<span className="text-primary">.gg</span></span>
          </Link>
          <nav aria-label={t("Main navigation")} className="hidden xl:flex items-center gap-6">
            {navigation.map((item) => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded px-2 font-body-md text-body-md transition-colors ${isActive(item.href) ? "text-primary bg-primary/10 font-semibold" : "text-on-surface-variant hover:text-on-surface"}`}>{t(item.label)}</Link>)}
          </nav>
        </div>
        <div className="flex min-w-0 items-center gap-1 sm:gap-3 lg:gap-4 sm:flex-1 justify-end">
          <Link href={searchHref} aria-label={t("Open game search")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-on-surface-variant hover:text-primary sm:hidden"><span className="material-symbols-outlined text-[20px]" aria-hidden="true">search</span></Link>
          <Link href={searchHref} aria-label={t("Open game search")} className="relative hidden sm:flex flex-1 items-center min-w-0 min-h-11">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none" aria-hidden="true">search</span>
            <span className={`w-full truncate bg-surface-container-low pl-9 pr-3 py-2 ${pathname === "/" ? "rounded-2xl" : "rounded"} text-on-surface-variant font-body-sm text-body-sm`}>{t("Search games")}</span>
          </Link>
          <Link aria-label={t("Log a game")} className="inline-flex shrink-0 min-h-11 min-w-11 justify-center items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded bg-primary-container text-on-primary-container hover:bg-primary transition-colors font-body-md text-body-md font-semibold" href="/log"><span className="material-symbols-outlined text-[16px]" aria-hidden="true">add</span><span className="hidden sm:inline">{t("Log")}</span></Link>
          <div className="hidden xl:flex shrink-0 items-center gap-1"><PreferenceControls locale={locale} theme={theme} setLocale={setLocale} setTheme={setTheme} /></div>
          <details ref={menu} className="xl:hidden">
            <summary role="button" className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-xl bg-surface-container text-on-surface [&::-webkit-details-marker]:hidden" aria-label={t("Navigation menu")}>
              <span aria-hidden="true" className="material-symbols-outlined text-[24px]">menu</span>
            </summary>
            <div className="absolute inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-outline-variant/40 bg-surface p-4 sm:px-6 shadow-xl">
              <nav aria-label={t("Main navigation")} className="grid gap-1">
                {navigation.map(item => <Link key={item.href} href={item.href} onClick={closeMenu} aria-current={isActive(item.href) ? "page" : undefined} className={`flex min-h-12 items-center rounded-xl px-4 text-body-lg ${isActive(item.href) ? "bg-primary/10 text-primary font-semibold" : "text-on-surface-variant hover:bg-surface-container"}`}>{t(item.label)}</Link>)}
              </nav>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-outline-variant/30 pt-3">
                <span className="text-body-md text-on-surface-variant">{t("Display preferences")}</span>
                <div className="flex gap-2"><PreferenceControls locale={locale} theme={theme} setLocale={setLocale} setTheme={setTheme} /></div>
              </div>
            </div>
          </details>
          <Link className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" href={access?.signedIn ? "/profile" : "/login"} aria-label={access?.signedIn ? t("Your profile") : t("Sign in")} title={access?.signedIn ? t("Your profile") : t("Sign in")}><ProfileAvatar src={access?.canEdit ? profile.avatarUrl : null} name={access?.canEdit ? profile.displayName : "Account"} className="h-11 w-11 rounded-xl ring-1 ring-inset ring-outline-variant/30 group-hover:ring-primary group-focus-visible:ring-primary transition-colors" /></Link>
        </div>
      </div>

    </header>
  );
}

function PreferenceControls({ locale, theme, setLocale, setTheme }: { locale: "en" | "es-AR"; theme: "dark" | "light"; setLocale: (value: "en" | "es-AR") => void; setTheme: (value: "dark" | "light") => void }) {
  const nextTheme = theme === "dark" ? "light" : "dark";
  const nextLocale = locale === "en" ? "es-AR" : "en";
  return <>
    <button translate="no" type="button" onClick={() => setTheme(nextTheme)} aria-label={locale === "en" ? `Switch to ${nextTheme} mode` : `Cambiar a modo ${nextTheme === "light" ? "claro" : "oscuro"}`} aria-pressed={theme === "light"} title={locale === "en" ? `Switch to ${nextTheme} mode` : `Cambiar a modo ${nextTheme === "light" ? "claro" : "oscuro"}`} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-primary focus-visible:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]" aria-hidden="true">{theme === "dark" ? "light_mode" : "dark_mode"}</span></button>
    <button translate="no" type="button" onClick={() => setLocale(nextLocale)} aria-label={locale === "en" ? "Switch to Spanish (Argentina)" : "Cambiar a inglés"} title={locale === "en" ? "Switch to Spanish (Argentina)" : "Cambiar a inglés"} className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container-low px-2 text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-container-high transition-colors">{locale === "en" ? "EN" : "ES-AR"}</button>
  </>;
}
