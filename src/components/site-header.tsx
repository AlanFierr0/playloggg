"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProfileAvatar } from "@/components/profile-avatar";
import { usePortfolio } from "@/components/portfolio-provider";

const navigation = [{ href: "/", label: "Discover" }, { href: "/games", label: "Games" }, { href: "/profile", label: "Rankings" }, { href: "/tiers", label: "Lists" }, { href: "/compare", label: "Compare" }];

export function SiteHeader() {
  const { access, profile } = usePortfolio();
  const pathname = usePathname();
  const router = useRouter();
  const searchHref = `/search?q=&from=${encodeURIComponent(pathname === "/search" ? "/" : pathname)}`;
  const isActive = (href: string) => pathname === href || (href === "/tiers" && pathname.startsWith("/lists"));
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); if (pathname !== "/search") router.push(searchHref); }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [pathname, router, searchHref]);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 site-container mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-2 lg:gap-6">
        <div className="flex min-w-0 items-center gap-4 xl:gap-8">
          <Link className="flex shrink-0 items-center gap-2 lg:gap-3 group min-h-11" href="/" aria-label="Playlogg home">
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-[28px]">sports_esports</span>
            <span className="font-headline-md text-headline-md tracking-tight uppercase text-on-surface font-bold">Playlog<span className="text-primary">.gg</span></span>
          </Link>
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navigation.map((item) => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={`inline-flex min-h-11 items-center font-body-md text-body-md transition-colors ${isActive(item.href) ? "text-on-surface font-semibold" : "text-on-surface-variant hover:text-on-surface"}`}>{item.label}</Link>)}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-3 lg:gap-4 sm:flex-1 sm:max-w-xs justify-end">
          <Link href={searchHref} aria-label="Open game search" className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-on-surface-variant hover:text-primary sm:hidden"><span className="material-symbols-outlined text-[20px]" aria-hidden="true">search</span></Link>
          <Link href={searchHref} aria-label="Open game search" className="relative hidden sm:flex items-center w-full min-w-0 max-w-[220px] min-h-11">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none" aria-hidden="true">search</span>
            <span className="w-full truncate bg-surface-container-low pl-9 pr-3 xl:pr-12 py-2 rounded text-on-surface-variant/60 font-body-sm text-body-sm">Search titles...</span>
            <kbd className="absolute right-2 hidden xl:block font-label-sm text-label-sm text-on-surface-variant px-1.5 py-0.5 rounded bg-surface-container-high pointer-events-none">⌘K</kbd>
          </Link>
          <Link aria-label="Log a game" className="inline-flex shrink-0 min-h-11 min-w-11 justify-center items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded bg-primary-container text-on-primary-container hover:bg-primary transition-colors font-label-md text-label-md tracking-wider uppercase font-semibold" href="/log"><span className="material-symbols-outlined text-[16px]" aria-hidden="true">add</span><span className="hidden sm:inline">Log</span></Link>
          <Link className="flex h-11 w-11 shrink-0 items-center justify-center" href="/login" aria-label={access?.signedIn ? "Account and sign out" : "Sign in"}><ProfileAvatar name={access?.canEdit ? profile.displayName : "Account"} className="w-8 h-8 rounded-full ring-1 ring-surface-variant hover:ring-primary transition-all" /></Link>
        </div>
      </div>
      <nav aria-label="Main navigation" className="lg:hidden flex h-12 items-center justify-between gap-1 px-4 sm:px-6 bg-surface-container-low/80">
        {navigation.map((item) => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={`flex min-w-0 min-h-11 flex-1 items-center justify-center rounded px-1 font-body-md text-body-md transition-colors ${isActive(item.href) ? "text-primary bg-primary/10 font-semibold" : "text-on-surface-variant hover:text-on-surface"}`}>{item.label}</Link>)}
      </nav>
    </header>
  );
}
