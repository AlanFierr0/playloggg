"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMessages } from "@/components/site-preferences";
import { usePortfolio } from "@/components/portfolio-provider";
import { ProfileAvatar } from "@/components/profile-avatar";

export function ProfileNavigation() {
  const t = useMessages();
  const { publicBase, profile } = usePortfolio();
  const path = usePathname();
  const navigation = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navigation.current, selected = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !selected) return;
    if (selected.offsetLeft < nav.scrollLeft) nav.scrollLeft = selected.offsetLeft;
    else if (selected.offsetLeft + selected.offsetWidth > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = selected.offsetLeft + selected.offsetWidth - nav.clientWidth;
  }, [path]);
  const base = publicBase ?? "/profile";
  const items = [
    ["Overview", base], ["Ranking", `${base}/ranking`],
    ...(publicBase ? [["Tier List", `${base}/tiers`]] : []),
    ["Reviews", `${base}/reviews`], ["Stats", `${base}/stats`],
  ];
  return <><nav ref={navigation} aria-label={t("Profile sections")} className={`relative flex overflow-x-auto overscroll-x-contain lg:grid ${publicBase ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-2 rounded-xl bg-surface-container-low p-2`}>
    {items.map(([label, href]) => <Link key={href} href={href} aria-current={path === href ? "page" : undefined} className={`min-h-12 shrink-0 inline-flex justify-center items-center rounded-lg px-4 py-3 text-center font-label-md ${path === href ? "bg-primary-container text-on-primary-container font-semibold" : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"}`}>{t(label)}</Link>)}
  </nav>
  {publicBase && path !== publicBase && (
      <div className="flex justify-end pt-4">
        <Link href={publicBase} aria-label={`${t("Viewing profile")} ${profile.displayName}`} className="flex min-w-0 max-w-full items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3">
          <div className="min-w-0 text-right">
            <p className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">{t("Viewing profile")}</p>
            <p translate="no" className="text-headline-md font-headline-md font-semibold break-words">{profile.displayName}</p>
            <p translate="no" className="text-body-sm text-primary break-all">@{profile.handle}</p>
          </div>
          <ProfileAvatar name={profile.displayName} src={profile.avatarUrl} className="h-11 w-11 rounded-xl" />
        </Link>
      </div>
  )}
  </>;
}
