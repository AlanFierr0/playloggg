"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveList, deleteList } from "@/app/actions/collections";
import { usePortfolio } from "@/components/portfolio-provider";
import type { CuratedList } from "@/types/domain";

const button = "max-w-full break-words px-3 py-2 rounded bg-surface-container-high text-on-surface hover:bg-surface-bright disabled:opacity-40 font-label-md text-label-md";
export function CollectionsScreen({ initial }: { initial?: CuratedList }) {
  const { games, lists = [], profile, access } = usePortfolio();
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [name, setName] = useState(initial?.name ?? "");
  const [slugs, setSlugs] = useState(initial?.slugs ?? []);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const canEdit = Boolean(access?.canEdit);
  const bySlug = new Map(games.map((game) => [game.slug, game]));
  const available = games.filter((game) => !slugs.includes(game.slug) && game.title.toLowerCase().includes(query.trim().toLowerCase()));
  function discard() { setName(saved?.name ?? ""); setSlugs(saved?.slugs ?? []); setQuery(""); setMessage(""); setConfirmDelete(false); }
  function move(index: number, direction: number) {
    setSlugs((current) => { const next = [...current]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; return next; });
  }
  function commit() {
    startTransition(async () => {
      try {
        const result = await saveList({ id: saved?.id ?? null, revision: saved?.revision ?? null, name, slugs });
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
    <header className="break-words space-y-3"><Link href="/tiers" className="text-primary font-label-md text-label-md">← Personal tier board</Link><h1 className="font-headline-xl text-headline-xl font-bold">Curated lists</h1><p className="text-on-surface-variant">{profile.displayName} · {profile.isPublic ? "Visible with this public profile" : "Private with this profile"}. Games follow your custom order.</p></header>
    <nav aria-label="Curated lists" className="flex flex-wrap gap-3"><Link href="/lists" className={`inline-flex min-w-0 items-center ${button}`}>New list</Link>{lists.map((list) => <Link key={list.id} href={`/lists/${list.id}`} className={`inline-flex min-w-0 items-center ${button}`}><span className="min-w-0 break-words">{list.name}</span></Link>)}</nav>
    {!initial && !canEdit ? <p className="text-on-surface-variant">{lists.length ? "Choose a list to view its games." : "This profile has no curated lists."}</p> : <section className="bg-surface-container-low rounded-lg p-4 sm:p-6 space-y-6">
      <h2 className="font-headline-lg text-headline-lg">{initial ? "Your selection" : "Create a list"}</h2>
      {canEdit ? <label className="block space-y-2"><span className="font-label-sm text-label-sm uppercase tracking-wider">List name</span><input id="list-name" className="block min-w-0 w-full rounded bg-surface-container p-3" value={name} maxLength={80} onChange={(event) => setName(event.target.value)} disabled={pending} /></label> : <h3 className="font-headline-md text-headline-md break-words">{name}</h3>}
      <ol id="list-games" className="space-y-3">{slugs.map((slug, index) => { const game = bySlug.get(slug); if (!game) return null; return <li key={slug} data-game={slug} className="flex flex-wrap items-center gap-3 bg-surface-container rounded p-3">
        <span className="text-primary font-label-md text-label-md">{index + 1}</span><img src={game.cover} alt="" className="w-10 h-14 object-cover rounded" /><Link href={`/game/${slug}`} className="flex-1 min-w-0 break-words">{game.title}</Link>
        {canEdit && <div className="flex gap-2 justify-end w-full sm:w-auto"><button className={button} aria-label={`Move ${game.title} up`} disabled={pending || index === 0} onClick={() => move(index, -1)}>↑</button><button className={button} aria-label={`Move ${game.title} down`} disabled={pending || index === slugs.length - 1} onClick={() => move(index, 1)}>↓</button><button className={button} aria-label={`Remove ${game.title}`} disabled={pending} onClick={() => setSlugs(slugs.filter((item) => item !== slug))}>Remove</button></div>}
      </li>; })}</ol>
      {slugs.length === 0 && <p className="text-on-surface-variant">No games in this list yet.</p>}
      {canEdit && <fieldset disabled={pending} className="space-y-3"><legend className="font-label-md text-label-md mb-3">Add catalog games · {slugs.length}/500</legend><input id="list-search" aria-label="Find games to add" placeholder="Find a game…" className="w-full bg-surface-container rounded p-3" value={query} onChange={(event) => setQuery(event.target.value)} /><div className="scroll-region max-h-72 overflow-y-auto space-y-2">{available.map((game) => <button key={game.slug} data-add-game={game.slug} disabled={slugs.length >= 500} className="flex items-center gap-3 w-full p-2 rounded hover:bg-surface-container disabled:opacity-40 text-left" onClick={() => setSlugs([...slugs, game.slug])}><img src={game.cover} alt="" className="w-8 h-11 object-cover rounded" /><span className="min-w-0 flex-1 break-words">{game.title}</span><span className="text-primary">Add</span></button>)}{available.length === 0 && <p className="text-on-surface-variant">No matching games available to add.</p>}</div></fieldset>}
      <p role="status" className="text-on-surface-variant">{message}</p>
      {canEdit && <div className="flex flex-wrap gap-3"><button id="save-list" className="px-5 py-2 rounded bg-primary-container text-on-primary-container disabled:opacity-40" disabled={pending} onClick={commit}>{pending ? "Saving…" : "Save list"}</button><button className={button} disabled={pending} onClick={discard}>Discard draft</button>{saved && <button id="delete-list" className={button} disabled={pending} onClick={() => setConfirmDelete(true)}>Delete list</button>}</div>}
      {canEdit && confirmDelete && <div className="space-y-3"><p>Delete this list? Its games and ratings will stay in your portfolio.</p><div className="flex gap-3"><button id="confirm-delete-list" className={button} disabled={pending} onClick={removeList}>Confirm delete</button><button className={button} disabled={pending} onClick={() => setConfirmDelete(false)}>Cancel</button></div></div>}
    </section>}
  </div>;
}
