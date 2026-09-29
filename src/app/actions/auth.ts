"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isOwnerEmail } from "@/lib/owner";

export interface LoginState { message: string; sent: boolean }

export async function requestMagicLink(_previous: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim();
  const site = process.env.PLAYLOGG_SITE_URL;
  if (!process.env.PLAYLOGG_OWNER_EMAIL || !site) return { message: "Owner sign-in has not been configured yet.", sent: false };
  const generic = { message: "If this is the owner account, a sign-in link has been sent. Check your inbox.", sent: true };
  if (!isOwnerEmail(email)) return generic;
  try {
    const url = new URL(site);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "localhost")) throw new Error("Invalid site URL");
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({ email, options: {
      shouldCreateUser: false, emailRedirectTo: new URL("/auth/confirm", url).toString(),
    } });
    if (error) return { message: "We couldn't send a link. Please try again shortly, or check the owner account setup.", sent: false };
    return generic;
  } catch { return { message: "Sign-in is unavailable right now. Please try again.", sent: false }; }
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) redirect("/login?error=signout");
  revalidatePath("/", "layout");
  redirect("/login");
}
