import { getMessages } from "@/lib/locale/server";
import Link from "next/link";

export async function SiteFooter() {
  const t = await getMessages(); return (<footer className="w-full shrink-0 bg-surface-container-lowest mt-space-xl"><div className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-4"><div className="flex items-center gap-3"><span translate="no" className="font-headline-md text-headline-md tracking-tight uppercase text-on-surface-variant">{"Playlog"}<span className="text-primary">{".gg"}</span>
</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">{t(`© ${new Date().getFullYear()}`)}</span>
</div>
<div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2"><Link className="inline-flex items-center font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors" data-path="database-archive" href="/search">{t("Archive")}</Link>
</div>
</div>
</footer>
); }
