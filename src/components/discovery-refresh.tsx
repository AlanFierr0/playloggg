"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function DiscoveryRefresh({ expiresAt }: { expiresAt: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setTimeout(() => router.refresh(), Math.max(0, expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [expiresAt, router]);
  return null;
}
