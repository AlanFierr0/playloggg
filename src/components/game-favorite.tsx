import { getAccount } from "@/lib/owner";
import { readFavorites } from "@/lib/favorites";
import { FavoriteControls } from "@/components/favorite-controls";
export async function GameFavorite({ slug }: { slug: string }) {
  const account = await getAccount();
  if (!account?.profile) return null;
  const favorites = await readFavorites(account.supabase, account.profile.id);
  return (
    <FavoriteControls
      slug={slug}
      favorite={favorites.find((item) => item.slug === slug)}
    />
  );
}
