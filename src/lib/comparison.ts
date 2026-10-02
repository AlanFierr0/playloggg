import type { Game } from "../types/domain.ts";

export function compareGames(left: Game[], right: Game[]) {
  const bySlug = new Map(right.filter(game => game.logged).map(game => [game.slug, game]));
  const shared = left.filter(game => game.logged && bySlug.has(game.slug)).map(game => {
    const other = bySlug.get(game.slug)!;
    return { game, other, difference: game.score !== null && other.score !== null ? Math.abs(game.score - other.score) : null };
  }).sort((a,b) => a.game.slug < b.game.slug ? -1 : a.game.slug > b.game.slug ? 1 : 0);
  const scored = shared.filter((entry): entry is typeof entry & { difference: number } => entry.difference !== null);
  const affinity = scored.length >= 5 ? Math.round((100 - scored.reduce((total,entry) => total + entry.difference,0) / scored.length) * 10) / 10 : null;
  const divergences = scored.filter(entry => entry.difference > 0).sort((a,b) => b.difference - a.difference || (a.game.slug < b.game.slug ? -1 : a.game.slug > b.game.slug ? 1 : 0)).slice(0,2);
  const masterpieces = scored.filter(entry => entry.game.score! >= 90 && entry.other.score! >= 90).slice(0,3);
  const agreements = [...scored].sort((a,b)=>a.difference-b.difference || a.game.slug.localeCompare(b.game.slug)).slice(0,3);
  const averageDifference = scored.length ? Math.round(scored.reduce((sum,entry)=>sum+entry.difference,0)/scored.length*10)/10 : null;
  let correlation: number | null = null;
  if(scored.length >= 3) {
    const x=scored.reduce((sum,entry)=>sum+entry.game.score!,0)/scored.length, y=scored.reduce((sum,entry)=>sum+entry.other.score!,0)/scored.length;
    const xx=scored.reduce((sum,entry)=>sum+(entry.game.score!-x)**2,0), yy=scored.reduce((sum,entry)=>sum+(entry.other.score!-y)**2,0);
    if(xx>0 && yy>0) correlation=Math.max(-1,Math.min(1,scored.reduce((sum,entry)=>sum+(entry.game.score!-x)*(entry.other.score!-y),0)/Math.sqrt(xx*yy)));
  }
  const suggestions=(from:Game[],to:Game[])=>from.filter(game=>game.logged && game.score!==null && game.score>=90 && !to.some(other=>other.slug===game.slug && other.logged)).sort((a,b)=>b.score!-a.score! || a.slug.localeCompare(b.slug)).slice(0,6);
  return { shared, scored: scored.length, unrated: shared.length - scored.length, affinity, divergences, masterpieces, agreements, averageDifference, correlation, forLeft:suggestions(right,left),forRight:suggestions(left,right) };
}
