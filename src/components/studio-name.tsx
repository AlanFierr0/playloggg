import { studioLogo } from "@/lib/studio-logos";

export function StudioName({ name, compact = false }: { name: string; compact?: boolean }) {
  const logo = studioLogo(name);
  return <span translate="no" className="inline-flex min-w-0 items-center gap-2.5 align-middle">
    {logo && <img src={logo} alt="" width={compact ? 20 : 32} height={compact ? 20 : 32} loading="lazy" className={`studio-logo shrink-0 object-contain ${compact ? "h-5 w-5" : "h-8 w-8"}`} />}
    <span className="min-w-0 break-words">{name}</span>
  </span>;
}
