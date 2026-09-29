"use client";

import { PortfolioError } from "@/components/portfolio-error";
import "./globals.css";

export default function GlobalError({ retry }: { retry: () => void }) {
  return <html lang="en" className="dark">
    <head>
      <title>Portfolio unavailable | Playlogg</title>
      <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300..700;1,300..700&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
    </head>
    <body className="bg-surface font-body-md text-on-surface antialiased"><main><PortfolioError retry={retry} /></main></body>
  </html>;
}
