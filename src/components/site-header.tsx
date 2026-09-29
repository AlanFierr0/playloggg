"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProfileAvatar } from "@/components/profile-avatar";
import { usePortfolio } from "@/components/portfolio-provider";

const navigation = [{ href: "/", label: "Discover" }, { href: "/profile", label: "Rankings" }, { href: "/tiers", label: "Lists" }, { href: "/compare", label: "Compare" }];

export function SiteHeader() {
  const { access, profile } = usePortfolio();
  const pathname = usePathname();
  const router = useRouter();
  const searchHref = `/search?q=&from=${encodeURIComponent(pathname === "/search" ? "/" : pathname)}`;
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); if (pathname !== "/search") router.push(searchHref); }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [pathname, router, searchHref]);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link className="flex items-center gap-3 group" href="/" aria-label="Playlogg home">
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-[28px]">sports_esports</span>
            <span className="font-headline-md text-headline-md tracking-tight uppercase text-on-surface font-bold">Playlog<span className="text-primary">.gg</span></span>
          </Link>
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
            {navigation.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={pathname === item.href ? "transition-colors text-on-surface font-semibold" : "font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"}>{item.label}</Link>)}
          </nav>
        </div>
        <div className="flex items-center gap-4 flex-1 max-w-xs justify-end">
          <div className="relative hidden sm:flex items-center w-full max-w-[220px]">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none" aria-hidden="true">search</span>
            <input aria-label="Open game search" className="w-full bg-surface-container-low pl-9 pr-3 py-1.5 rounded text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm focus:outline-none focus:bg-surface-container transition-colors cursor-pointer" placeholder="Search titles..." type="text" readOnly onClick={() => router.push(searchHref)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); router.push(searchHref); } }} />
            <kbd className="absolute right-2 font-label-sm text-label-sm text-on-surface-variant px-1.5 py-0.5 rounded bg-surface-container-high pointer-events-none">⌘K</kbd>
          </div>
          <Link className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary-container text-on-primary-container hover:bg-primary transition-colors font-label-md text-label-md tracking-wider uppercase font-semibold" href="/log"><span className="material-symbols-outlined text-[16px]" aria-hidden="true">add</span><span>Log</span></Link>
          <Link className="flex-shrink-0" href="/login" aria-label={access?.signedIn ? "Account and sign out" : "Owner sign-in"}><ProfileAvatar name={access?.signedIn ? profile.displayName : "Account"} className="w-8 h-8 rounded-full ring-1 ring-surface-variant hover:ring-primary transition-all" /></Link>
        </div>
      </div>
    </header>
  );
}
