"use client";


import Link from "next/link";
import type { ReactNode } from "react";
import { usePortfolio } from "@/components/portfolio-provider";

export function ShelfLink({ slug, className, children }: { slug: string; className?: string; children: ReactNode }) {
  const { access } = usePortfolio();
  return <Link href={access?.canEdit ? `/log?game=${encodeURIComponent(slug)}` : "/login"} className={className}>{children}</Link>;
}
