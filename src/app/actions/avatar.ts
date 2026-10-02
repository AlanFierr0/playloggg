"use server";
import { checkOperationLimit, operationFailure } from "@/lib/operation-limits";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getAccount } from "@/lib/owner";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";
import { avatarLimit, avatarFormat, avatarPath } from "@/lib/avatar-input";

export async function saveAvatar(_previous: {message: string}, form: FormData) {
  try {
    const account = await getAccount();
    if (!account?.profile) return {message: "Sign in to edit your own profile."};
    const file = form.get("picture");
    if (!(file instanceof File) || file.size === 0 || file.size > avatarLimit) return {message: "Choose a JPEG, PNG or WebP image up to 2 MB."};
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!avatarFormat(bytes)) return {message: "Choose a JPEG, PNG or WebP image up to 2 MB."};
    await checkOperationLimit(account.user.id,"avatar");
    // Decode, limit memory, orient and resize. Re-encoding removes original metadata.
    const picture = await sharp(bytes, {limitInputPixels: 20_000_000, animated: false}).rotate().resize(512,512,{fit: "cover", withoutEnlargement: true}).webp({quality:80}).toBuffer();
    const path = `${account.profile.id}/${randomUUID()}.webp`;
    const {error: uploadError} = await account.supabase.storage.from("profile-pictures").upload(path, picture, {contentType:"image/webp", cacheControl:"0", upsert:false});
    if (uploadError) return {message:"Your picture could not be uploaded. Please retry."};
    const admin = createAuthAdmin();
    const {data: previous, error: readError} = await admin.from("profiles").select("avatar_url").eq("id",account.profile.id).eq("owner_user_id",account.user.id).single();
    if (readError) { await account.supabase.storage.from("profile-pictures").remove([path]); return {message:"Your picture could not be saved. Please retry."}; }
    const {data, error} = await admin.from("profiles").update({avatar_url:path, updated_at:new Date().toISOString()}).eq("id",account.profile.id).eq("owner_user_id",account.user.id).select("id").maybeSingle();
    if (error || !data) { await account.supabase.storage.from("profile-pictures").remove([path]); return {message:"Your picture could not be saved. Please retry."}; }
    if (avatarPath(previous.avatar_url) && previous.avatar_url.startsWith(`${account.profile.id}/`)) await account.supabase.storage.from("profile-pictures").remove([previous.avatar_url]);
    revalidatePath("/", "layout");
    return {message:"Profile picture saved."};
  } catch(error) { return {message:operationFailure(error,"Your picture could not be processed. Try a smaller JPEG, PNG or WebP image.")}; }
}
export async function removeAvatar() {
  try {
    const account = await getAccount();
    if (!account?.profile) return {message:"Sign in to edit your own profile."};
    const admin = createAuthAdmin();
    const {data: previous, error: readError} = await admin.from("profiles").select("avatar_url").eq("id",account.profile.id).eq("owner_user_id",account.user.id).single();
    if (readError) return {message:"Your picture could not be removed. Please retry."};
    const {data, error} = await admin.from("profiles").update({avatar_url:null,updated_at:new Date().toISOString()}).eq("id",account.profile.id).eq("owner_user_id",account.user.id).select("id").maybeSingle();
    if (error || !data) return {message:"Your picture could not be removed. Please retry."};
    if (avatarPath(previous.avatar_url) && previous.avatar_url.startsWith(`${account.profile.id}/`)) await account.supabase.storage.from("profile-pictures").remove([previous.avatar_url]);
    revalidatePath("/", "layout");
    return {message:"Profile picture removed."};
  } catch { return {message:"Your picture could not be removed. Please retry."}; }
}
