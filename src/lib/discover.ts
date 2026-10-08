import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { discoveryCookie, discoverySelection } from "@/lib/discovery-selection";
import { getCatalog, portfolioGames } from "@/lib/portfolio";
export async function getDiscover(amount = 5) {
  const [rows, store] = await Promise.all([getCatalog(), cookies()]);
  const selection = discoverySelection(store.get(discoveryCookie)?.value);
  const sampled = rows.map(row => ({ row, order: createHash("sha256").update(`${selection.seed}:${row.id}`).digest("hex") }))
    .sort((a, b) => a.order.localeCompare(b.order) || a.row.id - b.row.id)
    .slice(0, amount).map(item => item.row);
  return { games: portfolioGames(sampled, []), expiresAt: selection.expiresAt };
}
