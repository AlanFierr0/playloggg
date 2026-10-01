"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { localeCookie, siteLocale, siteTheme, themeCookie, type SiteLocale, type SiteTheme } from "@/lib/locale/preferences";
import { translateText } from "@/lib/locale/translate";

type Preferences = { locale: SiteLocale; theme: SiteTheme; setLocale: (value: SiteLocale) => void; setTheme: (value: SiteTheme) => void };
const Context = createContext<Preferences | null>(null);

export function SitePreferences({ initialLocale, initialTheme, children }: { initialLocale: SiteLocale; initialTheme: SiteTheme; children: ReactNode }) {
  const router = useRouter();
  const [locale, updateLocale] = useState(initialLocale);
  const [theme, setTheme] = useState(initialTheme);
  function setLocale(value: SiteLocale) {
    const next = siteLocale(value);
    document.cookie = `${localeCookie}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    document.documentElement.lang = next;
    updateLocale(next);
    router.refresh();
  }
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    document.cookie = `${themeCookie}=${siteTheme(theme)}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, [theme]);
  return <Context.Provider value={{ locale, theme, setLocale, setTheme }}>{children}</Context.Provider>;
}
export function useSitePreferences() {
  const value = useContext(Context);
  if (!value) throw new Error("SitePreferences is missing.");
  return value;
}
export function useMessages(override?: SiteLocale) {
  const value = useContext(Context);
  return (source: string) => translateText(source, override ?? value?.locale ?? "en");
}
