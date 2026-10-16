"use server";
import { navigationPath } from "@/lib/return-navigation";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { eligibleAccount } from "@/lib/account-identity";
import { emailAddress, passwordValue } from "@/lib/password-input";
import { steamSite } from "@/lib/steam-openid";

export async function emailPassword(_previous: {message: string}, form: FormData) {
  const mode = form.get("mode");
  const next = navigationPath(form.get("next"));
  const email = emailAddress(form.get("email"));
  if (!email || !["signin", "register", "recover", "link"].includes(String(mode))) return {message: "Enter a valid email address."};
  let destination: string | undefined;
  try {
    const supabase = await createClient();
    const callback = `${steamSite(process.env.PLAYLOGG_SITE_URL)}/auth/confirm${next ? `?next=${encodeURIComponent(next)}` : ""}`;
    if (mode === "link") {
      const {error} = await supabase.auth.signInWithOtp({email, options: {
        shouldCreateUser: true, emailRedirectTo: callback,
      }});
      return {message: error ? "We couldn't send an email. Please try again shortly." : "Check your inbox for a sign-in link. New accounts start with a public profile."};
    }
    if (mode === "recover") {
      const {error} = await supabase.auth.resetPasswordForEmail(email, {redirectTo: `${callback}${next ? "&" : "?"}flow=recovery`});
      return {message: error ? "We couldn't send an email. Please try again shortly." : "If this account exists, a password reset link has been sent. Check your inbox."};
    }
    const raw = form.get("password");
    // Existing passwords may predate the new registration policy.
    const password = mode === "register" ? passwordValue(raw) : typeof raw === "string" && raw.length > 0 && raw.length <= 128 ? raw : null;
    if (!password) return {message: "Use a password of 12–128 characters."};
    if (mode === "register") {
      const {data, error} = await supabase.auth.signUp({email, password, options: {emailRedirectTo: callback}});
      if (error) return {message: "Registration couldn't be completed. Please retry, or sign in if you already have an account."};
      // Fail closed if project email confirmations were accidentally disabled.
      if (data.session) await supabase.auth.signOut();
      return {message: "Check your inbox to verify your email, then sign in and create your public profile."};
    }
    const {data, error} = await supabase.auth.signInWithPassword({email, password});
    if (error || !data.user || !eligibleAccount(data.user)) {
      if (data.session) await supabase.auth.signOut();
      return {message: "Sign-in failed. Check your email and password and verify your email before signing in."};
    }
    const {data: profile, error: profileError} = await supabase.from("profiles").select("id").eq("owner_user_id", data.user.id).maybeSingle();
    if (profileError) return {message: "Your profile could not be loaded. Please retry."};
    destination = profile ? next ?? "/profile" : `/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`;
  } catch { return {message: "Sign-in is unavailable right now. Please try again."}; }
  revalidatePath("/", "layout");
  redirect(destination!);
}

export async function changePassword(_previous: {message: string}, form: FormData) {
  const password = passwordValue(form.get("password"));
  if (!password || password !== form.get("confirmPassword")) return {message: "Use matching passwords of 12–128 characters."};
  try {
    const supabase = await createClient();
    const {data: {user}, error} = await supabase.auth.getUser();
    if (error || !user || !eligibleAccount(user) || user.email?.endsWith(".invalid")) return {message: "Open a valid email password reset link first."};
    const {error: updateError} = await supabase.auth.updateUser({password});
    if (updateError) return {message: "The password could not be updated. Request a fresh reset link and retry."};
    return {message: "Password updated. You can now sign in with your email and password."};
  } catch { return {message: "Saving is unavailable. Please retry."}; }
}
