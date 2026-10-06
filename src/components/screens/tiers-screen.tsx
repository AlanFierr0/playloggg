"use client";
import { tierLabels } from "@/lib/tier-labels";
import { useMessages } from "@/components/site-preferences";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { updateGameTier } from "@/app/actions/tiers";
import { TierDragHandle } from "@/components/tier-drag-handle";
import { usePortfolio } from "@/components/portfolio-provider";
import { groupTiers, loggedGames, tiers } from "@/lib/portfolio-view";
import type { Game, Tier } from "@/types/domain";



export function TiersScreen() {
  const t = useMessages();
const { games, profile, publicBase, access } = usePortfolio();
const canEdit=Boolean(access?.canEdit&&!publicBase&&!profile.isSample);
const router=useRouter();
const [pending,startTransition]=useTransition();
const saving=useRef(false);
const [message,setMessage]=useState("");
const [dragged,setDragged]=useState<string|null>(null);
const [over,setOver]=useState<string|null>(null);
const logged = loggedGames(games);
const groups = groupTiers(logged);
function moveGame(slug:string,tier:Tier|null){
  const game=logged.find(game=>game.slug===slug);
  if(!canEdit||saving.current||pending||!game||(game.tier??null)===tier)return;
  saving.current=true;setMessage("");
  startTransition(async()=>{
    try {const result=await updateGameTier(slug,tier);setMessage(result.message);if(result.ok)router.refresh();}
    catch {setMessage("Tier could not be saved. Your game stayed in its previous tier. Please retry.");}
    finally {saving.current=false;}
  });
}
function endDrag(){setDragged(null);setOver(null);}
return (<>
<div className="w-full  bg-surface"><div className="flex flex-col w-full">

<div className="relative w-full site-container mx-auto px-4 sm:px-6 lg:px-12 py-10 flex flex-col gap-10">

<div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-gradient-to-b from-primary/10 via-tertiary/5 to-transparent blur-3xl pointer-events-none -z-10"></div>

<section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
<div className="flex flex-col gap-2">
<div className="flex flex-wrap items-center gap-3">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-container text-primary font-label-sm text-label-sm uppercase tracking-widest font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
{t("\n            Tier List\n          ")}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t("Playlogg")}</span>

</div>

<h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">{t("\n          Personal Tier Board\n        ")}</h1>

<p className="font-body-md text-body-md text-on-surface-variant">{t(logged.length + " logged titles grouped by independently selected tiers.")}</p>

</div>

<div className="flex flex-wrap items-center gap-2 p-1.5 bg-surface-container rounded-lg self-start md:self-auto max-w-full">
<a className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-bright transition-colors text-on-surface group" href="#tier-s">
<span className={"font-label-md text-label-md font-bold " + tierThemes.S.color}>{"S"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{groups.find((group) => group.tier === "S")!.games.length}</span>

</a>

<a className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface group" href="#tier-a">
<span className={"font-label-md text-label-md font-bold " + tierThemes.A.color}>{"A"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{groups.find((group) => group.tier === "A")!.games.length}</span>

</a>

<a className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface group" href="#tier-b">
<span className={"font-label-md text-label-md font-bold " + tierThemes.B.color}>{"B"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{groups.find((group) => group.tier === "B")!.games.length}</span>

</a>

<a className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface group" href="#tier-c">
<span className={"font-label-md text-label-md font-bold " + tierThemes.C.color}>{"C"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{groups.find((group) => group.tier === "C")!.games.length}</span>

</a>

<a className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface group" href="#tier-d">
<span className={"font-label-md text-label-md font-bold " + tierThemes.D.color}>{"D"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{groups.find((group) => group.tier === "D")!.games.length}</span>

</a>

<a className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface group" href="#tier-f">
<span className={"font-label-md text-label-md font-bold " + tierThemes.F.color}>{"F"}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{groups.find((group) => group.tier === "F")!.games.length}</span>

</a>

</div>

</section>

{canEdit&&<p className="text-body-sm text-on-surface-variant">{t("Drag games between tiers, or use each game's tier selector. Changes save automatically.")}</p>}
{canEdit&&<p role="status" aria-live="polite" className="text-body-sm text-primary">{t(pending ? "Saving tier…" : message)}</p>}
<div className="flex flex-col gap-6 w-full" aria-busy={pending}>
{groups.filter((group) => canEdit || group.tier !== null || group.games.length > 0).map((group) => {
 const key = group.tier ?? "Unassigned";
 const theme = tierThemes[key];
 return <section key={key} data-tier-drop={group.tier??"unassigned"} className={`flex flex-col md:flex-row gap-4 p-4 lg:p-6 rounded-xl shadow-sm ${theme.surface} ${over===key ? "ring-2 ring-on-surface ring-offset-2 ring-offset-surface" : ""}`} id={"tier-" + key.toLowerCase()}
 onDragOver={event=>{if(canEdit&&dragged&&!pending){event.preventDefault();event.dataTransfer.dropEffect="move";setOver(key);}}}
 onDragLeave={event=>{if(!(event.relatedTarget instanceof Node)||!event.currentTarget.contains(event.relatedTarget))setOver(null);}}
 onDrop={event=>{if(!canEdit||!dragged||pending)return;event.preventDefault();const slug=dragged;endDrag();moveGame(slug,group.tier);}}>
 <div className="flex flex-wrap gap-2 md:flex-col justify-between items-center md:items-start w-full md:w-44 flex-shrink-0 p-4 rounded-lg">
 <div className="flex items-center md:flex-col md:items-start gap-2"><span className="font-display-lg text-display-lg font-bold leading-none">{group.tier ?? "—"}</span><div className="flex flex-col"><span className="font-label-md text-label-md font-semibold uppercase tracking-wider">{t(theme.label)}</span>{!group.tier && <span className="font-label-sm text-label-sm">{t("No tier selected")}</span>}</div></div>
 <div className="flex items-center gap-1.5 pt-0 md:pt-6"><span className="font-label-sm text-label-sm">{group.games.length} {group.games.length === 1 ? t("game") : t("games")}</span><span className="w-1.5 h-1.5 rounded-full bg-current"></span></div>
 </div>
 <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2 flex-1 min-w-0">
 {group.games.map((game) => <TierCard key={game.slug} game={game} color={theme.color} publicBase={publicBase} editable={canEdit} disabled={pending} dragged={dragged===game.slug} onStart={()=>setDragged(game.slug)} onEnd={endDrag} onHover={tier=>setOver(tier===undefined ? null : tier??"Unassigned")} onMove={tier=>moveGame(game.slug,tier)} />)}
 {group.games.length === 0 && <p className="col-span-full py-8 font-body-sm text-body-sm">{t("No games assigned to this tier.")}</p>}
 </div>
 </section>;
})}
</div>
<div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-surface-container-low text-on-surface-variant mt-4">
<div className="flex items-center gap-3">
<span aria-hidden="true" className="material-symbols-outlined text-primary text-xl">{"auto_awesome"}</span>

<span className="font-body-sm text-body-sm">{publicBase ? t("Published ratings and independent tiers from this profile.") : profile.isSample ? t("Sample ratings. Sign in to save your own scores and independent tiers.") : t("Your saved ratings. Tier changes do not change scores or favorites.")}</span>

</div>



</div>

</div>

</div>
</div>
</>);
}

const tierThemes: Record<string, { label: string; color: string; surface: string }> = {
 S:{label:tierLabels.S,color:"text-[#ff7f7f] [.light_&]:text-[#a32929]",surface:"bg-[#ff7f7f] text-black"},
 A:{label:tierLabels.A,color:"text-[#ffbf7f] [.light_&]:text-[#854000]",surface:"bg-[#ffbf7f] text-black"},
 B:{label:tierLabels.B,color:"text-[#ffdf7f] [.light_&]:text-[#735700]",surface:"bg-[#ffdf7f] text-black"},
 C:{label:tierLabels.C,color:"text-[#ffff7f] [.light_&]:text-[#626200]",surface:"bg-[#ffff7f] text-black"},
 D:{label:tierLabels.D,color:"text-[#bfff7f] [.light_&]:text-[#3c6200]",surface:"bg-[#bfff7f] text-black"},
 F:{label:tierLabels.F,color:"text-[#7fff7f] [.light_&]:text-[#176117]",surface:"bg-[#7fff7f] text-black"},
 Unassigned:{label:"Unassigned",color:"text-on-surface-variant",surface:"bg-surface-container-low text-on-surface-variant"},
};
function TierCard({ game, color, publicBase, editable, disabled, dragged, onStart, onEnd, onHover, onMove }: { game: Game; color: string; publicBase?: string; editable:boolean; disabled:boolean; dragged:boolean; onStart:()=>void; onEnd:()=>void; onHover:(tier:Tier|null|undefined)=>void; onMove:(tier:Tier|null)=>void }) {
  const t = useMessages();

 return <div data-tier-game={game.slug} draggable={editable&&!disabled} onDragStart={event=>{if(!editable||disabled){event.preventDefault();return;}event.dataTransfer.effectAllowed="move";event.dataTransfer.setData("text/plain",game.slug);onStart();}} onDragEnd={onEnd} className={`group relative rounded-lg overflow-hidden bg-surface-container transition-transform duration-200 hover:-translate-y-1 ${editable ? "cursor-grab" : ""} ${dragged ? "opacity-50 ring-2 ring-primary" : ""}`}>
 <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-container-high"><img draggable={false} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src={game.cover} alt={game.title} />{editable&&game.tier&&<TierDragHandle cover title={game.title} disabled={disabled} onStart={onStart} onEnd={onEnd} onHover={onHover} onMove={onMove}/>}</div>
 <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-md shadow"><span className={"font-label-sm text-label-sm font-bold " + color}>{game.score ?? "—"}</span></div>
 <div className="p-2.5 flex flex-col bg-surface-container"><h2 className="font-headline-md text-body-md font-semibold text-on-surface min-h-[2.5rem] line-clamp-2"><Link className="block after:absolute after:inset-0" href={(publicBase ?? "") + "/game/" + game.slug}>{game.title}</Link></h2><span className="font-label-sm text-label-sm text-on-surface-variant truncate">{game.year ?? t("Release year unavailable")}</span></div>
 {editable&&<div className={game.tier ? "" : "relative z-10 flex flex-col gap-1 px-1 pb-1"}><div className="flex items-center justify-between">{!game.tier&&<TierDragHandle title={game.title} disabled={disabled} onStart={onStart} onEnd={onEnd} onHover={onHover} onMove={onMove}/>}{game.tier&&<button type="button" disabled={disabled} onClick={()=>onMove(null)} aria-label={`${t("Clear tier for")} ${game.title}`} title={t("Clear tier; keep log entry")} className="absolute top-0 left-0 z-20 min-h-11 min-w-11 rounded bg-surface/90 text-on-surface-variant hover:bg-surface-container-high hover:text-error disabled:opacity-50"><span aria-hidden="true" className="material-symbols-outlined">close</span></button>}</div><select disabled={disabled} aria-label={`${t("Tier for")} ${game.title}`} value={game.tier??""} onChange={event=>{onMove(event.target.value ? event.target.value as Tier : null);event.currentTarget.blur();}} className={(game.tier ? "sr-only focus:not-sr-only focus:relative focus:z-20 focus:min-h-11 focus:w-full focus:rounded focus:px-1 focus:text-body-sm " : "relative z-10 min-h-11 min-w-0 w-full rounded px-1 text-body-sm ") + (game.tier ? tierThemes[game.tier].surface : "bg-surface-container-high text-on-surface")}><option value="" className="bg-surface-container-high text-on-surface">{t("Unassigned")}</option>{tiers.map(tier=><option key={tier} value={tier} className={tierThemes[tier].surface}>{tier} · {t(tierLabels[tier])}</option>)}</select></div>}
 </div>;
}
