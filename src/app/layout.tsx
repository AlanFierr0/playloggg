import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PreviewNoticeProvider } from "@/components/preview-action";
import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPortfolio } from "@/lib/portfolio";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Playlogg — Your gaming portfolio", template: "%s | Playlogg" },
  description: "A personal gaming portfolio of ratings, rankings, tiers and shared gaming taste. Visual prototype with sample content.",
  openGraph: { title: "Playlogg — Your gaming portfolio", description: "Ratings, rankings and personal gaming taste.", type: "website", siteName: "Playlogg" },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const portfolio = await getPortfolio();
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300..700;1,300..700&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-surface font-body-md text-on-surface antialiased">
        <PortfolioProvider portfolio={portfolio}><PreviewNoticeProvider>
          <SiteHeader />
          <main className="w-full pt-16 bg-surface">{children}</main>
          <SiteFooter />
        </PreviewNoticeProvider></PortfolioProvider>
      </body>
    </html>
  );
}
