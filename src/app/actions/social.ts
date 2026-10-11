"use server";
import { getAccount } from "@/lib/owner";
import { revalidatePath } from "next/cache";
export async function socialAction(
  _previous: { message: string },
  form: FormData,
) {
  const operation = form.get("operation"),
    target = Number(form.get("target"));
  if (
    !Number.isSafeInteger(target) ||
    target < 1 ||
    !["follow", "unfollow"].includes(
      String(operation),
    )
  )
    return { message: "Invalid action." };
  try {
    const account = await getAccount();
    if (!account?.profile)
      return { message: "Sign in to your account before saving." };
    const id = account.profile.id;
    let error;
    if (operation === "follow") {
      ({ error } = await account.supabase
        .from("profile_follows")
        .upsert(
          { follower_id: id, followed_id: target },
          { onConflict: "follower_id,followed_id", ignoreDuplicates: true },
        ));
    }
    if (operation === "unfollow") {
      ({ error } = await account.supabase
        .from("profile_follows")
        .delete()
        .eq("follower_id", id)
        .eq("followed_id", target));
    }
    if (error) return { message: "This action is unavailable. Please retry." };
    revalidatePath("/", "layout");
    return { message: "Saved." };
  } catch {
    return { message: "This action is unavailable. Please retry." };
  }
}
