import "server-only";
import { cookies } from "next/headers";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";
import { discoveryCookie, discoverySelection } from "@/lib/discovery-selection";
import { portfolioGames } from "@/lib/portfolio";
export async function getDiscover(amount = 5) {
  const store = await cookies();
  const selection = discoverySelection(store.get(discoveryCookie)?.value);
  const {data, error} = await createAuthAdmin().rpc("discover_games", {p_seed: selection.seed, p_amount: amount});
  if (error) throw new Error("Games worth exploring could not be loaded.");
  return {games: portfolioGames(data, []), expiresAt: selection.expiresAt};
}
