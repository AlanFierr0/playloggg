"use client";

import { PortfolioError } from "@/components/portfolio-error";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return <PortfolioError retry={retry} />;
}
