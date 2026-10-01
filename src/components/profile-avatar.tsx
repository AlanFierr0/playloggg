"use client";
import { useState } from "react";
import { useMessages } from "@/components/site-preferences";

export function ProfileAvatar({ name, src, className = "" }: { name: string; src?: string | null; className?: string }) {
  const t = useMessages();
  const [failed, setFailed] = useState<string>();
  if (src && src !== failed) return <img src={src} alt={name} className={`shrink-0 object-cover ${className}`} onError={() => setFailed(src)} />;
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return <span role="img" aria-label={t(`${name} initials`)} className={`inline-flex shrink-0 items-center justify-center bg-surface-container-high text-primary font-semibold ${className}`}>{initials || "?"}</span>;
}
