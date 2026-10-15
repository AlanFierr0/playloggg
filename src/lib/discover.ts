import "server-only";
import { cookies } from "next/headers";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";
import { discoveryCookie, discoverySelection } from "@/lib/discovery-selection";
import { portfolioGames } from "@/lib/portfolio";
export async function getDiscover(amount = 5, genres: string[] = [], profileId?: number) {
  const store = await cookies();
  const selection = discoverySelection(store.get(discoveryCookie)?.value);
  const client=createAuthAdmin();
  const {data, error} = genres.length && profileId
    ? await client.rpc("explore_games",{p_seed:selection.seed,p_amount:amount,p_profile_id:profileId,p_genres:genres})
    : await client.rpc("discover_games", {p_seed: selection.seed, p_amount: amount});
  if (error) throw new Error("Games worth exploring could not be loaded.");
  return {games: portfolioGames(data, []), expiresAt: selection.expiresAt};
}
