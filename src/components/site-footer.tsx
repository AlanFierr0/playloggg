import Link from "next/link";
import { getMessages } from "@/lib/locale/server";

export async function SiteFooter() {
  const t = await getMessages();
  const external = "min-h-11 inline-flex items-center text-on-surface-variant hover:text-primary transition-colors";
  return <footer className="mt-space-xl w-full shrink-0 border-t border-outline-variant/20 bg-surface-container-lowest">
    <div className="site-container mx-auto px-4 py-10 sm:px-6 lg:px-12">
      <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div className="max-w-lg space-y-3">
          <Link href="/" translate="no" className="inline-flex min-h-11 items-center font-headline-md text-headline-md uppercase tracking-tight text-on-surface">Playlog<span className="text-primary">.gg</span></Link>
          <p className="text-body-lg text-on-surface">{t("Rate, rank and remember what you play.")}</p>
          <p className="text-body-sm leading-relaxed text-on-surface-variant">{t("Your scores, personal rankings, tiers and reviews in one gaming portfolio.")}</p>
          <div className="flex flex-wrap gap-x-6"><a className={external} href="https://alanfierr0.github.io/">{t("Creator’s website")}</a><a className={external} href="https://github.com/AlanFierr0/playloggg/issues">{t("Feedback and bug reports")}</a></div>
        </div>
        <div className="max-w-lg space-y-3">
          <h2 className="font-headline-md text-headline-md text-on-surface">{t("Your profile, your choice")}</h2>
          <p className="text-body-sm leading-relaxed text-on-surface-variant">{t("Profiles are public and discoverable by default. You can change this in settings.")}</p>
          <Link className={external} href="/settings">{t("Profile settings")}</Link>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-outline-variant/20 pt-4 text-body-sm text-on-surface-variant">
        <span>© {new Date().getFullYear()} <span translate="no">Playlogg</span></span>
        <div className="flex flex-wrap items-center gap-x-3"><span>{t("Game data")}</span><a className={external} href="https://www.igdb.com/" translate="no">IGDB</a><span aria-hidden="true">·</span><a className={external} href="https://store.steampowered.com/" translate="no">Steam</a></div>
      </div>
    </div>
  </footer>;
}
