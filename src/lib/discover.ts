import "server-only";
import { randomInt } from "node:crypto";
import { getCatalog, portfolioGames } from "@/lib/portfolio";
export async function getDiscover() {
  const rows = [...await getCatalog()];
  const count = Math.min(5, rows.length);
  // Sample without replacement on each render; shared catalog caching is unchanged.
  for (let index = 0; index < count; index++) {
    const selected = randomInt(index, rows.length);
    [rows[index], rows[selected]] = [rows[selected], rows[index]];
  }
  const games = portfolioGames(rows.slice(0, count), []);
  return {games};
}
