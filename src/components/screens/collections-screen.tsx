"use client";
import {ShareCardControls} from "@/components/share-card-controls";
import { useMessages } from "@/components/site-preferences";

import { ProfileNavigation } from "@/components/profile-navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveList, deleteList } from "@/app/actions/collections";
import { usePortfolio } from "@/components/portfolio-provider";
import type { CuratedList } from "@/types/domain";
import type { Game } from "@/types/domain";
import { IgdbSearch } from "@/components/igdb-search";

const button = "max-w-full break-words px-3 py-2 rounded bg-surface-container-high text-on-surface hover:bg-surface-bright disabled:opacity-40 font-label-md text-label-md";
export function CollectionsScreen({ initial }: { initial?: CuratedList }) {
  const t = useMessages();
  const { games, lists = [], profile, access, publicBase } = usePortfolio();
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [name, setName] = useState(initial?.name ?? "");
  const [description,setDescription]=useState(initial?.description ?? "");
  const [isPublic,setIsPublic]=useState(initial?.is_public ?? false);
  const [isRanked,setIsRanked]=useState(initial?.is_ranked ?? true);
  const [slugs, setSlugs] = useState(initial?.slugs ?? []);
  const [query, setQuery] = useState("");
  const [importedGames, setImportedGames] = useState<Game[]>([]);
  const [importBusy, setImportBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const canEdit = Boolean(access?.canEdit);
  const bySlug = new Map([...importedGames, ...games].map((game) => [game.slug, game]));
  const available = [...bySlug.values()].filter((game) => !slugs.includes(game.slug) && game.title.toLowerCase().includes(query.trim().toLowerCase()));
  function discard() { setDescription(saved?.description ?? "");setIsPublic(saved?.is_public ?? false);setIsRanked(saved?.is_ranked ?? true);setName(saved?.name ?? ""); setSlugs(saved?.slugs ?? []); setQuery(""); setMessage(""); setConfirmDelete(false); }
  function move(index: number, direction: number) {
    setSlugs((current) => { const next = [...current]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; return next; });
  }
  function commit() {
    startTransition(async () => {
      try {
        const result = await saveList({ id: saved?.id ?? null, revision: saved?.revision ?? null, name, slugs, description, isPublic,isRanked });
        setMessage(result.message);
        if (result.ok && result.list) {
          const updated = { ...result.list, slugs: [...slugs] };
          setSaved(updated); setName(updated.name); setConfirmDelete(false);
          if (!initial) router.push(`/lists/${updated.id}`);
          router.refresh();
        }
      } catch { setMessage("Saving is unavailable. Your draft has been kept; please try again."); }
    });
  }
  function removeList() {
    if (!saved) return;
    startTransition(async () => { try { const result = await deleteList(saved.id, saved.revision); setMessage(result.message); if (result.ok) { router.push("/lists"); router.refresh(); } } catch { setMessage("Deleting is unavailable. The list has been kept."); } });
  }
  return <div className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-8">
    {!publicBase && <ProfileNavigation />}
    {saved&&<ShareCardControls endpoint={`/api/share/list?id=${saved.id}${publicBase?`&handle=${encodeURIComponent(profile.handle)}`:""}`}/> }
    <header className="break-words space-y-3"><Link href={publicBase ? `${publicBase}/tiers` : "/tiers"} className="text-primary font-label-md text-label-md">{t("← Tier board")}</Link><h1 className="font-headline-xl text-headline-xl font-bold">{t("Curated lists")}</h1><p className="text-on-surface-variant">{profile.displayName} · {t("Lists keep their own order and visibility. Scores and tiers stay independent.")}</p></header>
    <nav aria-label={t("Curated lists")} className="flex flex-wrap gap-3">{canEdit && <Link href="/lists" className={`inline-flex min-w-0 items-center ${button}`}>{t("New list")}</Link>}{lists.map((list) => <Link key={list.id} href={`${publicBase ?? ""}/lists/${list.id}`} className={`inline-flex min-w-0 items-center ${button}`}><span className="min-w-0 break-words">{list.name}</span></Link>)}</nav>
    {!initial && !canEdit ? <p className="text-on-surface-variant">{lists.length ? t("Choose a list to view its games.") : t("This profile has no curated lists.")}</p> : <section className="bg-surface-container-low rounded-lg p-4 sm:p-6 space-y-6">
      <h2 className="font-headline-lg text-headline-lg">{initial ? publicBase ? t("Selected games") : t("Your selection") : t("Create a list")}</h2>
      {canEdit ? <label className="block space-y-2"><span className="font-label-sm text-label-sm uppercase tracking-wider">{t("List name")}</span><input id="list-name" className="block min-w-0 w-full rounded bg-surface-container p-3" value={name} maxLength={80} onChange={(event) => setName(event.target.value)} disabled={pending || importBusy} /></label> : <h3 className="font-headline-md text-headline-md break-words">{name}</h3>}
      {slugs.length>0&&<div className="flex max-w-md overflow-hidden rounded-xl">{slugs.slice(0,4).map(slug=>{const game=bySlug.get(slug);return game?<img key={slug} src={game.cover} alt="" loading="lazy" className="w-1/4 aspect-[2/3] object-cover flex-1 min-w-0"/>:null;})}</div>}
      {canEdit?<fieldset disabled={pending||importBusy} className="space-y-4"><label className="block space-y-2"><span>{t("Description")}</span><textarea aria-label={t("Description")} className="w-full rounded bg-surface-container p-3" rows={3} maxLength={2000} value={description} onChange={event=>setDescription(event.target.value)}/></label><label className="flex items-center gap-3"><input type="checkbox" checked={isRanked} onChange={event=>setIsRanked(event.target.checked)}/>{t("Ranked list")}</label><label className="flex items-center gap-3"><input type="checkbox" checked={isPublic} onChange={event=>setIsPublic(event.target.checked)}/>{t("Public list")}</label><p className="text-body-sm text-on-surface-variant">{t("A public list is visible only while your profile is public. Private lists stay visible only to you.")}</p></fieldset>:<p translate="no" className="text-on-surface-variant whitespace-pre-wrap break-words">{description}</p>}
      <ol id="list-games" className="space-y-3">{slugs.map((slug, index) => { const game = bySlug.get(slug); if (!game) return null; return <li key={slug} data-game={slug} className="flex flex-wrap items-center gap-3 bg-surface-container rounded p-3">
        {isRanked&&<span className="text-primary font-label-md text-label-md">{index + 1}</span>}<img src={game.cover} alt={""} className="w-10 h-14 object-cover rounded" /><Link href={`${publicBase ?? ""}/game/${slug}`} className="flex-1 min-w-0 break-words">{game.title}</Link>
        {canEdit && <div className="flex gap-2 justify-end w-full sm:w-auto"><button className={button} aria-label={t(`Move ${game.title} up`)} disabled={pending || importBusy || index === 0} onClick={() => move(index, -1)}>↑</button><button className={button} aria-label={t(`Move ${game.title} down`)} disabled={pending || importBusy || index === slugs.length - 1} onClick={() => move(index, 1)}>↓</button><button className={button} aria-label={t(`Remove ${game.title}`)} disabled={pending || importBusy} onClick={() => setSlugs(slugs.filter((item) => item !== slug))}>{t("Remove")}</button></div>}
      </li>; })}</ol>
      {slugs.length === 0 && <p className="text-on-surface-variant">{t("No games in this list yet.")}</p>}
      {canEdit && <fieldset disabled={pending || importBusy} className="space-y-3"><legend className="font-label-md text-label-md mb-3">{t("Add catalog games · ")}{slugs.length}/500</legend><input id="list-search" aria-label={t("Find games to add")} placeholder={t("Find a game…")} className="w-full bg-surface-container rounded p-3" value={query} onChange={(event) => setQuery(event.target.value)} /><div className="scroll-region max-h-72 overflow-y-auto space-y-2">{available.map((game) => <button key={game.slug} data-add-game={game.slug} disabled={slugs.length >= 500} className="flex items-center gap-3 w-full p-2 rounded hover:bg-surface-container disabled:opacity-40 text-left" onClick={() => setSlugs([...slugs, game.slug])}><img src={game.cover} alt={""} className="w-8 h-11 object-cover rounded" /><span className="min-w-0 flex-1 break-words">{game.title}</span><span className="text-primary">{t("Add")}</span></button>)}{available.length === 0 && !(access?.canImportCatalog && query.trim().length >= 2) && <p className="text-on-surface-variant">{t("No matching games available to add.")}</p>}
        {access?.canImportCatalog && <IgdbSearch query={query} excludeSlugs={[...bySlug.keys()]} disabled={pending || slugs.length >= 500} onBusyChange={setImportBusy} onImported={(game) => {
          setImportedGames((current) => [...current.filter((item) => item.slug !== game.slug), game]);
          setSlugs((current) => current.includes(game.slug) || current.length >= 500 ? current : [...current, game.slug]);
          setQuery("");
        }} />}
      </div></fieldset>}
      <p role="status" className="text-on-surface-variant">{t(message)}</p>
      {canEdit && <div className="flex flex-wrap gap-3"><button id="save-list" className="px-5 py-2 rounded bg-primary-container text-on-primary-container disabled:opacity-40" disabled={pending || importBusy} onClick={commit}>{pending ? t("Saving…") : t("Save list")}</button><button className={button} disabled={pending || importBusy} onClick={discard}>{t("Discard draft")}</button>{saved && <button id="delete-list" className={button} disabled={pending || importBusy} onClick={() => setConfirmDelete(true)}>{t("Delete list")}</button>}</div>}
      {canEdit && confirmDelete && <div className="space-y-3"><p>{t("Delete this list? Its games and ratings will stay in your portfolio.")}</p><div className="flex gap-3"><button id="confirm-delete-list" className={button} disabled={pending || importBusy} onClick={removeList}>{t("Confirm delete")}</button><button className={button} disabled={pending || importBusy} onClick={() => setConfirmDelete(false)}>{t("Cancel")}</button></div></div>}
    </section>}
  </div>;
}
