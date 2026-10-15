"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { navigationPath, previousPage, restoreNavigation, visitPage } from "@/lib/return-navigation";

const NavigationContext = createContext<string[]>([]);

export function ReturnNavigationProvider({ children, account }: { children: ReactNode; account: string }) {
  const pathname = usePathname(), params = useSearchParams();
  const current = navigationPath(`${pathname}${params.size ? `?${params}` : ""}`);
  const [state, setState] = useState({ current, paths: current ? [current] : [], ready: false });
  const key = `playlogg_navigation:${account}`;
  let paths = state.paths;
  if (state.current !== current) {
    paths = visitPage(paths, current);
    setState({ ...state, current, paths });
  }
  useEffect(() => {
    let active = true;
    let restored: string[] = [];
    try { restored = restoreNavigation(sessionStorage.getItem(key), current); } catch {}
    queueMicrotask(() => {
      if (active) setState(value => ({ ...value, paths: value.paths.length <= 1 && value.current === current && restored.length ? restored : value.paths, ready: true }));
    });
    return () => { active = false; };
    // Restore only on mount; subsequent visits are tracked above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    if (state.ready) try { sessionStorage.setItem(key, JSON.stringify(state.paths)); } catch {}
  }, [key, state.ready, state.paths]);
  return <NavigationContext value={paths}>{children}</NavigationContext>;
}

export function useReturnNavigation(fallback = "/profile") {
  const history = useContext(NavigationContext), router = useRouter();
  const pathname = usePathname(), params = useSearchParams();
  const current = navigationPath(`${pathname}${params.size ? `?${params}` : ""}`);
  const href = previousPage(history, current, fallback);
  return { href, goBack: () => { if (href !== current) router.replace(href); } };
}

export function BackLink({ href: fallback, ...props }: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const { href } = useReturnNavigation(fallback);
  return <Link {...props} href={href} replace />;
}
