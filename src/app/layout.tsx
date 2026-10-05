import { getMessages, localizeMetadata } from "@/lib/locale/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PreviewNoticeProvider } from "@/components/preview-action";
import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPortfolioShell } from "@/lib/portfolio";
import { cookies } from "next/headers";
import { localeCookie, siteLocale, siteTheme, themeCookie } from "@/lib/locale/preferences";
import { SitePreferences } from "@/components/site-preferences";
import { siteOrigin, noIndex } from "@/lib/site-url";
import "./globals.css";
import { Hanken_Grotesk, Space_Grotesk, JetBrains_Mono } from "next/font/google";

const bodyFont = Hanken_Grotesk({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", variable: "--font-hanken" });
const headingFont = Space_Grotesk({ subsets: ["latin"], display: "swap", variable: "--font-space" });
const labelFont = JetBrains_Mono({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", variable: "--font-jetbrains" });

export async function generateMetadata() { return localizeMetadata({
  metadataBase: new URL(siteOrigin),
  robots: noIndex,
  title: { default: "Playlogg | Your gaming portfolio", template: "%s | Playlogg" },
  description: "Track games, save ratings and independent tiers, and choose whether to share your gaming portfolio.",
  openGraph: { title: "Playlogg | Your gaming portfolio", description: "Ratings, rankings and personal gaming taste.", type: "website", siteName: "Playlogg" },
  twitter: { card: "summary" },
}); }

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const t = await getMessages();
  const [portfolio, cookieStore] = await Promise.all([getPortfolioShell(), cookies()]);
  const locale = siteLocale(cookieStore.get(localeCookie)?.value);
  const theme = siteTheme(cookieStore.get(themeCookie)?.value);
  return (
    <html lang={locale} className={`${theme} ${bodyFont.variable} ${headingFont.variable} ${labelFont.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body className="flex min-h-dvh flex-col bg-surface font-body-md text-on-surface antialiased">
        <PortfolioProvider portfolio={portfolio}><SitePreferences initialLocale={locale} initialTheme={theme}><PreviewNoticeProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-surface-container-high focus:px-4 focus:py-3">{t("Skip to content")}</a>
          <SiteHeader />
          <main id="main-content" tabIndex={-1} className="w-full min-w-0 flex-1 pt-[var(--site-header-height)] bg-surface">{children}</main>
          <SiteFooter />
        </PreviewNoticeProvider></SitePreferences></PortfolioProvider>
      </body>
    </html>
  );
}
