"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Portfolio } from "@/types/domain";

const PortfolioContext = createContext<Portfolio | null>(null);

export function PortfolioProvider({ portfolio, children }: { portfolio: Portfolio; children: ReactNode }) {
  return <PortfolioContext.Provider value={portfolio}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const portfolio = useContext(PortfolioContext);
  if (!portfolio) throw new Error("PortfolioProvider is missing.");
  return portfolio;
}
