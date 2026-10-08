import Link from "next/link";
import { getAccount } from "@/lib/owner";
import { getCompareFriends } from "@/lib/compare-friends";
import { getMessages } from "@/lib/locale/server";
import { avatarSource } from "@/lib/avatar-input";
import { ProfileAvatar } from "@/components/profile-avatar";

export async function FriendsGameRatings({ gameId, slug }: { gameId: number; slug: string }) {
  const t = await getMessages();
  const ratings: { score: number | null; tier: string | null; profiles: { id: number; handle: string; display_name: string; avatar_url: string | null } }[] = [];
  let unavailable = false;
  try {
    const account = await getAccount();
    if (!account?.profile) return null;
    const friends = await getCompareFriends(account);
    for (let offset = 0; offset < friends.length; offset += 100) {
      const { data, error } = await account.supabase.from("ratings")
        .select("score,tier,profiles!ratings_profile_id_fkey!inner(id,handle,display_name,avatar_url)")
        .eq("game_id", gameId).in("profile_id", friends.slice(offset, offset + 100).map(friend => friend.id))
        .eq("profiles.is_public", true).eq("profiles.is_discoverable", true).order("profile_id");
      if (error) throw new Error("Friend ratings unavailable");
      ratings.push(...data);
    }
  } catch { unavailable = true; }
  if (unavailable) return <p role="status" className="text-body-sm text-on-surface-variant">{t("Friends’ ratings could not be loaded. Please retry.")}</p>;
  if (!ratings.length) return null;
  ratings.sort((a, b) => a.profiles.display_name.localeCompare(b.profiles.display_name));
  return <section aria-labelledby="friends-game-ratings-title" className="rounded-xl bg-surface-container-low p-5 sm:p-6 space-y-4">
    <h2 id="friends-game-ratings-title" className="font-headline-md text-headline-md font-bold">{t("Friends’ ratings")}</h2>
    <ul className="divide-y divide-outline-variant/30">{ratings.map(({ profiles: profile, score, tier }) => <li key={profile.id}>
      <Link href={`/u/${profile.handle}/game/${encodeURIComponent(slug)}`} className="flex min-h-16 items-center gap-3 rounded-lg py-3 hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
        <ProfileAvatar name={profile.display_name} src={avatarSource(profile.id, profile.avatar_url)} className="h-10 w-10 rounded-lg" />
        <span translate="no" className="min-w-0 flex-1 break-words font-semibold">{profile.display_name}</span>
        <span className="shrink-0 text-right"><span className="block font-semibold tabular-nums text-primary">{score === null ? t("Unrated") : `${score} / 100`}</span>{tier && <span className="block text-body-sm text-on-surface-variant">{t(`Tier ${tier}`)}</span>}</span>
      </Link>
    </li>)}</ul>
  </section>;
}
