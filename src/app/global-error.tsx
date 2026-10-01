"use client";

import { useSyncExternalStore } from "react";
import { PortfolioError } from "@/components/portfolio-error";
import { localeCookie, siteLocale, siteTheme, themeCookie } from "@/lib/locale/preferences";
import { translateText } from "@/lib/locale/translate";
import "./globals.css";

export default function GlobalError({ retry }: { retry: () => void }) {
  const cookieText = useSyncExternalStore(() => () => {}, () => document.cookie, () => "");
  const values = Object.fromEntries(cookieText.split("; ").map((item) => {
    const separator = item.indexOf("=");
    return separator < 0 ? [item, ""] : [item.slice(0, separator), item.slice(separator + 1)];
  }));
  const preferences = { locale: siteLocale(values[localeCookie]), theme: siteTheme(values[themeCookie]) };
  return <html lang={preferences.locale} className={preferences.theme}>
    <head>
      <title>{translateText("Portfolio unavailable", preferences.locale)} | Playlogg</title>
      <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300..700;1,300..700&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
    </head>
    <body className="bg-surface font-body-md text-on-surface antialiased"><main><PortfolioError retry={retry} locale={preferences.locale} /></main></body>
  </html>;
}
