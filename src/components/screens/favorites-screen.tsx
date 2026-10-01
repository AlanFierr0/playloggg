"use client";
import Link from "next/link";
import { useState } from "react";
import { useMessages } from "@/components/site-preferences";
import { usePortfolio } from "@/components/portfolio-provider";
import { FavoriteControls } from "@/components/favorite-controls";
import { ProfileNavigation } from "@/components/profile-navigation";

export function FavoritesScreen() {
  const t = useMessages();
  const { games, favorites = [], access, publicBase } = usePortfolio();
  const [search, setSearch] = useState("");
  const [catalog, setCatalog] = useState(false);
  const [page, setPage] = useState(1);
  const canEdit = Boolean(access?.canEdit && !publicBase);
  const bySlug = new Map(favorites.map(favorite => [favorite.slug, favorite]));
  const filtered = games.filter(game => (canEdit && catalog || bySlug.has(game.slug)) && game.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / 24));
  const current = Math.min(page, pages);
  return <section className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-6">
    {!publicBase && <ProfileNavigation />}<h1 className="font-headline-xl text-headline-xl">{canEdit ? t("Manage favorites") : t("Favorites")}</h1>
    <p className="text-on-surface-variant">{t("Favorites never create a rating or playback status. Choose up to four featured positions; replacing a position keeps the previous game as a favorite.")}</p>
    {canEdit && <div className="flex flex-wrap gap-4"><button className="min-h-11 text-primary" aria-pressed={!catalog} onClick={() => { setCatalog(false); setPage(1); }}>{t("Your favorites")}</button><button className="min-h-11 text-primary" aria-pressed={catalog} onClick={() => { setCatalog(true); setPage(1); }}>{t("Browse catalog")}</button></div>}
    <label className="block max-w-lg"><span className="block mb-2">{t("Search games")}</span><input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} className="w-full min-h-11 rounded bg-surface-container p-3" /></label>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">{filtered.slice((current - 1) * 24, current * 24).map(game => <article key={game.slug} className="min-w-0 space-y-3"><Link href={publicBase && game.logged ? `${publicBase}/game/${game.slug}` : `/game/${game.slug}`}><img src={game.cover} alt="" loading="lazy" className="w-full aspect-[2/3] rounded object-cover" /><h2 translate="no" className="mt-3 font-headline-md text-headline-md break-words">{game.title}</h2></Link>{bySlug.get(game.slug)?.featuredSlot && <p className="text-primary">{t("Featured position")} #{bySlug.get(game.slug)!.featuredSlot}</p>}{canEdit && <FavoriteControls slug={game.slug} favorite={bySlug.get(game.slug)} />}</article>)}</div>
    {!filtered.length && <p className="text-on-surface-variant">{t("No games match this view.")}</p>}
    {pages > 1 && <nav aria-label={t("Favorites pages")} className="flex flex-wrap items-center gap-4"><button className="min-h-11 text-primary disabled:opacity-50" disabled={current <= 1} onClick={() => setPage(current - 1)}>{t("Previous")}</button><span>{current} / {pages}</span><button className="min-h-11 text-primary disabled:opacity-50" disabled={current >= pages} onClick={() => setPage(current + 1)}>{t("Next")}</button></nav>}
  </section>;
}
