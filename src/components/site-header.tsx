"use client";
import { useMessages } from "@/components/site-preferences";


import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ProfileAvatar } from "@/components/profile-avatar";
import { usePortfolio } from "@/components/portfolio-provider";
import { useSitePreferences } from "@/components/site-preferences";

const navigation = [{ href: "/", label: "Discover" }, { href: "/games", label: "Games" }, { href: "/profile", label: "Profile" }, { href: "/compare", label: "Compare" }];

export function SiteHeader() {
  const t = useMessages();
  const { access, profile } = usePortfolio();
  const { locale, theme, setLocale, setTheme } = useSitePreferences();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnPath = pathname === "/games" && searchParams.size ? `${pathname}?${searchParams}` : pathname;
  const searchHref = `/search?q=&from=${encodeURIComponent(pathname === "/search" ? "/" : returnPath)}`;
  const isActive = (href: string) => pathname === href || (href === "/profile" && (pathname.startsWith("/profile/") || pathname === "/tiers" || pathname.startsWith("/lists") || pathname.startsWith("/u/")));
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 site-container mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-2 lg:gap-6">
        <div className="flex min-w-0 items-center gap-4 xl:gap-8">
          <Link className="flex shrink-0 items-center gap-2 lg:gap-3 group min-h-11" href="/" aria-label={t("Playlogg home")}>
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-[28px]">sports_esports</span>
            <span translate="no" className="font-headline-md text-headline-md tracking-tight uppercase text-on-surface font-bold">Playlog<span className="text-primary">.gg</span></span>
          </Link>
          <nav aria-label={t("Main navigation")} className="hidden xl:flex items-center gap-6">
            {navigation.map((item) => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded px-2 font-body-md text-body-md transition-colors ${isActive(item.href) ? "text-primary bg-primary/10 font-semibold" : "text-on-surface-variant hover:text-on-surface"}`}>{t(item.label)}</Link>)}
          </nav>
        </div>
        <div className="flex min-w-0 items-center gap-1 sm:gap-3 lg:gap-4 sm:flex-1 sm:max-w-[440px] xl:max-w-[480px] justify-end">
          <Link href={searchHref} aria-label={t("Open game search")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-on-surface-variant hover:text-primary sm:hidden"><span className="material-symbols-outlined text-[20px]" aria-hidden="true">search</span></Link>
          <Link href={searchHref} aria-label={t("Open game search")} className="relative hidden sm:flex items-center w-full min-w-0 max-w-[220px] min-h-11">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none" aria-hidden="true">search</span>
            <span className="w-full truncate bg-surface-container-low pl-9 pr-3 py-2 rounded text-on-surface-variant font-body-sm text-body-sm">{t("Search titles...")}</span>
          </Link>
          <Link aria-label={t("Log a game")} className="inline-flex shrink-0 min-h-11 min-w-11 justify-center items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded bg-primary-container text-on-primary-container hover:bg-primary transition-colors font-label-md text-label-md tracking-wider uppercase font-semibold" href="/log"><span className="material-symbols-outlined text-[16px]" aria-hidden="true">add</span><span className="hidden sm:inline">{t("Log")}</span></Link>
          <div className="hidden sm:flex items-center gap-1"><PreferenceControls locale={locale} theme={theme} setLocale={setLocale} setTheme={setTheme} /></div>
          <Link className="flex h-11 w-11 shrink-0 items-center justify-center" href="/login" aria-label={access?.signedIn ? t("Account and sign out") : t("Sign in")}><ProfileAvatar src={access?.canEdit ? profile.avatarUrl : null} name={access?.canEdit ? profile.displayName : "Account"} className="w-8 h-8 rounded-full ring-1 ring-surface-variant hover:ring-primary transition-all" /></Link>
        </div>
      </div>
      <nav aria-label={t("Main navigation")} className="scroll-region xl:hidden flex h-12 items-center justify-start gap-1 overflow-x-auto px-4 sm:px-6 bg-surface-container-low/80">
        {navigation.map((item) => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={`flex shrink-0 min-h-11 items-center justify-center rounded px-2 font-body-md text-body-md transition-colors ${isActive(item.href) ? "text-primary bg-primary/10 font-semibold" : "text-on-surface-variant hover:text-on-surface"}`}>{t(item.label)}</Link>)}
      </nav>
      <div className="sm:hidden h-12 flex items-center justify-end gap-2 px-4 bg-surface-container-low/80"><PreferenceControls locale={locale} theme={theme} setLocale={setLocale} setTheme={setTheme} /></div>
    </header>
  );
}

function PreferenceControls({ locale, theme, setLocale, setTheme }: { locale: "en" | "es-AR"; theme: "dark" | "light"; setLocale: (value: "en" | "es-AR") => void; setTheme: (value: "dark" | "light") => void }) {
  const nextTheme = theme === "dark" ? "light" : "dark";
  const nextLocale = locale === "en" ? "es-AR" : "en";
  return <>
    <button translate="no" type="button" onClick={() => setTheme(nextTheme)} aria-label={locale === "en" ? `Switch to ${nextTheme} mode` : `Cambiar a modo ${nextTheme === "light" ? "claro" : "oscuro"}`} aria-pressed={theme === "light"} title={locale === "en" ? `Switch to ${nextTheme} mode` : `Cambiar a modo ${nextTheme === "light" ? "claro" : "oscuro"}`} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded bg-surface-container-low text-on-surface-variant hover:text-primary focus-visible:text-primary"><span className="material-symbols-outlined text-[20px]" aria-hidden="true">{theme === "dark" ? "light_mode" : "dark_mode"}</span></button>
    <button translate="no" type="button" onClick={() => setLocale(nextLocale)} aria-label={locale === "en" ? "Switch to Spanish (Argentina)" : "Cambiar a inglés"} title={locale === "en" ? "Switch to Spanish (Argentina)" : "Cambiar a inglés"} className="inline-flex h-10 min-w-11 shrink-0 items-center justify-center rounded bg-surface-container-low px-2 text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-container-high">{locale === "en" ? "EN" : "ES-AR"}</button>
  </>;
}
