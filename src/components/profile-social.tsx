import { getAccount } from "@/lib/owner";
import { SocialControls } from "@/components/social-controls";
export async function ProfileSocial({ target }: { target: number }) {
  const account = await getAccount();
  if (!account?.profile || account.profile.id === target) return null;
  const [{ data: follow,error:followError }, { data: blocks,error:blockError }] = await Promise.all([
    account.supabase
      .from("profile_follows")
      .select("followed_id")
      .eq("follower_id", account.profile.id)
      .eq("followed_id", target)
      .maybeSingle(),
    account.supabase.from("profile_blocks").select("blocker_id,blocked_id"),
  ]);
  if(followError||blockError)return null;
  const blocked =
    blocks?.some(
      (block) =>
        block.blocker_id === account.profile!.id && block.blocked_id === target,
    ) ?? false;
  const blockedBy = blocks?.some(
    (block) =>
      block.blocker_id === target && block.blocked_id === account.profile!.id,
  );
  if (blockedBy) return null;
  return (
    <SocialControls
      target={target}
      followed={Boolean(follow)}
      blocked={blocked}
    />
  );
}
