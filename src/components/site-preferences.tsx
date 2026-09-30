"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePortfolio } from "@/components/portfolio-provider";
import { localeCookie, siteLocale, siteTheme, themeCookie, type SiteLocale, type SiteTheme } from "@/lib/locale/preferences";
import { translateText } from "@/lib/locale/translate";

type Preferences = { locale: SiteLocale; theme: SiteTheme; setLocale: (value: SiteLocale) => void; setTheme: (value: SiteTheme) => void };
const Context = createContext<Preferences | null>(null);
const trackedText = new WeakMap<Text, { source: string; applied: string }>();
const trackedAttributes = new WeakMap<Element, Map<string, { source: string; applied: string }>>();
const attributes = ["aria-label", "aria-description", "placeholder", "title", "alt"];

function translateDocument(locale: SiteLocale, protectedText: Set<string>) {
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node as Text;
      const parent = text.parentElement;
      if (!parent || parent.closest("script,style,noscript,textarea,code,pre,.material-symbols-outlined,[translate='no']")) continue;
      const current = text.data;
      const previous = trackedText.get(text);
      const source = previous && current === previous.applied ? previous.source : current;
      const translated = protectedText.has(source.replace(/\s+/g, " ").trim()) ? source : translateText(source, locale);
      trackedText.set(text, { source, applied: translated });
      if (current !== translated) text.data = translated;
    } else if (node instanceof Element && !node.closest("[translate='no']")) {
      const values = trackedAttributes.get(node) ?? new Map<string, { source: string; applied: string }>();
      for (const name of attributes) {
        const current = node.getAttribute(name);
        if (current === null) continue;
        const previous = values.get(name);
        const source = previous && current === previous.applied ? previous.source : current;
        const translated = translateText(source, locale);
        values.set(name, { source, applied: translated });
        if (current !== translated) node.setAttribute(name, translated);
      }
      trackedAttributes.set(node, values);
    }
  }
}

export function SitePreferences({ initialLocale, initialTheme, children }: { initialLocale: SiteLocale; initialTheme: SiteTheme; children: ReactNode }) {
  const portfolio = usePortfolio();
  const protectedText = useMemo(() => new Set([portfolio.profile.displayName, portfolio.profile.handle, ...portfolio.games.map((game) => game.title), ...(portfolio.lists ?? []).map((list) => list.name)]), [portfolio]);
  const [locale, setLocale] = useState(initialLocale);
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    document.cookie = `${themeCookie}=${siteTheme(theme)}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = siteLocale(locale);
    document.cookie = `${localeCookie}=${siteLocale(locale)}; Path=/; Max-Age=31536000; SameSite=Lax`;
    let frame = 0;
    const refresh = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => translateDocument(locale, protectedText)); };
    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributes });
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [locale, protectedText]);
  return <Context.Provider value={{ locale, theme, setLocale, setTheme }}>{children}</Context.Provider>;
}

export function useSitePreferences() {
  const value = useContext(Context);
  if (!value) throw new Error("SitePreferences is missing.");
  return value;
}
