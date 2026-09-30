"use client";

import { useEffect } from "react";
import { PortfolioError } from "@/components/portfolio-error";
import { localeCookie, siteLocale, siteTheme, themeCookie } from "@/lib/locale/preferences";
import { translateText } from "@/lib/locale/translate";
import "./globals.css";

export default function GlobalError({ retry }: { retry: () => void }) {
  useEffect(() => {
    const values = Object.fromEntries(document.cookie.split("; ").map((item) => {
      const separator = item.indexOf("=");
      return separator < 0 ? [item, ""] : [item.slice(0, separator), item.slice(separator + 1)];
    }));
    const locale = siteLocale(values[localeCookie]);
    const theme = siteTheme(values[themeCookie]);
    document.documentElement.className = theme;
    document.documentElement.lang = locale;
    document.title = translateText(document.title, locale);
    document.querySelectorAll("[data-error-translate]").forEach((node) => { node.textContent = translateText(node.textContent ?? "", locale); });
  }, []);
  return <html lang="en" className="dark">
    <head>
      <title>Portfolio unavailable | Playlogg</title>
      <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300..700;1,300..700&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
    </head>
    <body className="bg-surface font-body-md text-on-surface antialiased"><main><PortfolioError retry={retry} /></main></body>
  </html>;
}
