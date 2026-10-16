"use client";
import { useMessages } from "@/components/site-preferences";
import { ProfileAvatar } from "@/components/profile-avatar";
import Link from "next/link";
import type { Profile } from "@/types/domain";

export function ReferenceProfile0({ profile }: { profile: Profile }) {
  const t = useMessages(); return (<Link data-search-result className="group flex items-center gap-3 p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors" href={`/u/${profile.handle}`}>
<div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface-container-highest shadow">
<ProfileAvatar className="w-full h-full object-cover" src={profile.avatarUrl} name={profile.displayName} />

</div>

<div className="min-w-0 flex-1">
<div className="flex items-center gap-1.5">
<span className="font-headline-md text-body-lg font-bold text-on-surface truncate group-hover:text-primary transition-colors">{profile.displayName}</span>

{(profile.isSample || !profile.isPublic) && <span className="font-label-sm text-label-sm text-primary bg-primary/10 px-1 rounded uppercase font-semibold">{t(profile.isSample ? "Sample" : "Private")}</span>}

</div>

<div className="font-body-sm text-body-sm text-on-surface-variant truncate">{"@" + profile.handle}</div>

</div>

<span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-[18px] group-hover:translate-x-0.5 transition-transform">{"chevron_right"}</span>

</Link>
); }

export function HighlightedTitle({ title, query }: { title: string; query: string }) {
 const word = query.trim().split(/\s+/)[0] ?? "";
 const index = title.toLocaleLowerCase().indexOf(word.toLocaleLowerCase());
 if (!word || index < 0) return <>{title}</>;
 return <>{title.slice(0, index)}<mark className="bg-transparent text-primary underline decoration-primary/40 underline-offset-2">{title.slice(index, index + word.length)}</mark>{title.slice(index + word.length)}</>;
}
