import Link from "next/link";
import { gamesQuery } from "@/lib/games-query";
import { defaultGamesFilters, type GamesFilters } from "@/lib/games-view";

export function GameGenres({genres,filters=defaultGamesFilters,fallback}:{genres?:string[];filters?:GamesFilters;fallback:string}) {
  if (!genres?.length) return <span>{fallback}</span>;
  return <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">{genres.map((genre,index) => <span key={genre} className="inline-flex items-center gap-2 min-w-0">
    {index > 0 && <span aria-hidden="true">·</span>}
    <Link href={`/games?${gamesQuery({...filters,genre})}`} className="inline-flex min-h-6 items-center break-words hover:text-primary hover:underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded">{genre}</Link>
  </span>)}</span>;
}
