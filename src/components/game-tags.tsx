import Link from "next/link";
import { gamesQuery } from "@/lib/games-query";
import { defaultGamesFilters, type GamesFilters } from "@/lib/games-view";

export function GameTags({tags,filters=defaultGamesFilters}:{tags?:string[];filters?:GamesFilters}) {
  if (!tags?.length) return null;
  return <div className="flex flex-wrap gap-2">{tags.map(tag => <Link key={tag.toLowerCase()} href={`/games?${gamesQuery({...filters,tag})}`} translate="no" className="inline-flex min-h-9 max-w-full items-center break-words rounded-lg bg-primary/10 px-3 py-1.5 font-label-sm text-label-sm text-primary hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{tag}</Link>)}</div>;
}
