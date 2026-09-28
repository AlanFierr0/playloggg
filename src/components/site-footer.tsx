import Link from "next/link";
import { PreviewAction } from "@/components/preview-action";

export function SiteFooter() { return (<footer className="w-full bg-surface-container-lowest mt-space-xl"><div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="font-headline-md text-headline-md tracking-tight uppercase text-on-surface-variant">{"Playlog"}<span className="text-primary">{".gg"}</span>
</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">{"© 2025"}</span>
</div>
<div className="flex items-center gap-6"><Link className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors" data-path="database-archive" href="/search">{"Archive"}</Link>
<PreviewAction className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors" data-path="api-docs" message={"Preview only: this feature is not connected yet."}>{"API"}</PreviewAction>
<PreviewAction className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors" data-path="terms" message={"Preview only: this feature is not connected yet."}>{"Terms"}</PreviewAction>
<PreviewAction className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors" data-path="privacy" message={"Preview only: this feature is not connected yet."}>{"Privacy"}</PreviewAction>
</div>
</div>
</footer>
); }
