import { getMessages } from "@/lib/locale/server";
import { getAccount } from "@/lib/owner";
import { SocialControls } from "@/components/social-controls";
export async function ListLike({ id }: { id: number }) {
  const [account, t] = await Promise.all([getAccount(), getMessages()]);
  if (!account?.profile) return null;
  const { data, error } = await account.supabase
    .from("list_likes")
    .select("profile_id")
    .eq("list_id", id);
  if (error) return null;
  return (
    <div className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-4 space-y-3">
      <p>
        {data.length} {t("Likes")}
      </p>
      <SocialControls
        like
        target={id}
        liked={data.some((row) => row.profile_id === account.profile!.id)}
      />
    </div>
  );
}
