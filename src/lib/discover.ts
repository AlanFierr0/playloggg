import "server-only";
import { getCatalogGame, portfolioGames } from "@/lib/portfolio";
const selection = ["elden-ring-shadow-of-the-erdtree", "baldurs-gate-3", "disco-elysium", "metaphor-refantazio", "alan-wake-2", "half-life-2"];
export async function getDiscover() {
  const rows=await Promise.all(selection.map(slug=>getCatalogGame(slug)));
  const games=rows.flatMap(row=>row ? portfolioGames([row],[]) : []);
  return {hero:games[0],games:games.slice(1)};
}
