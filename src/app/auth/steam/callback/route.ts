import { navigationPath } from "@/lib/return-navigation";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { steamSite, verifySteam, steamLinkActor } from "@/lib/steam-openid";
import { findSteamAccount, linkSteamAccount } from "@/lib/steam-account-link";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const store = await cookies();
  const state = store.get("playlogg-steam-state")?.value;
  const linking = store.get("playlogg-steam-link")?.value;
  let next: string | null = null;
  try { const saved = JSON.parse(store.get("playlogg-steam-next")?.value ?? "null"); if (state && saved?.state === state) next = navigationPath(saved.next); } catch {}
  for (const name of ["playlogg-steam-state", "playlogg-steam-link", "playlogg-steam-next"]) store.set(name, "", { path: "/auth/steam", maxAge: 0, httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:" });
  let destination = linking ? "/profile/import/steam?error=steam" : `/login?error=steam${next ? `&next=${encodeURIComponent(next)}` : ""}`;
  try {
    const site = steamSite(process.env.PLAYLOGG_SITE_URL);
    if (request.nextUrl.origin !== site) throw new Error("Invalid origin");
    const supabase = await createClient();
    const actor = linking ? steamLinkActor(linking, state, process.env.SUPABASE_SECRET_KEY ?? "") : null;
    const current = linking ? await supabase.auth.getUser() : null;
    if (linking && (!actor || current?.error || current?.data.user?.id !== actor)) throw new Error("Link session changed");
    const steamId = await verifySteam(request.nextUrl.searchParams, state, site);
    if (!steamId) throw new Error("Invalid assertion");
    const admin = createAuthAdmin();
    if (linking && current?.data.user) {
      await linkSteamAccount(admin, steamId, current.data.user);
      destination = "/profile/import/steam?connected=1";
    } else {
      const ownerId = await findSteamAccount(admin, steamId);
      let email: string;
      if (ownerId) {
        const owner = await admin.auth.admin.getUserById(ownerId);
        if (owner.error || !owner.data.user?.email) throw new Error("Account lookup failed");
        email = owner.data.user.email;
      } else {
        // Reserved, non-deliverable address, only used for a new Steam identity.
        email = `steam.${steamId}@users.playlogg.invalid`;
        const created = await admin.auth.admin.createUser({ email, email_confirm: true, app_metadata: { playlogg_steam_id: steamId } });
        if (created.error && !["email_exists", "user_already_exists"].includes(created.error.code ?? "")) throw new Error("Account creation failed");
      }
      const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
      if (error || !data.user || (ownerId && data.user.id !== ownerId)) throw new Error("Identity mismatch");
      await linkSteamAccount(admin, steamId, data.user);
      const verified = await supabase.auth.verifyOtp({ token_hash: data.properties.hashed_token, type: "magiclink" });
      if (verified.error || verified.data.user?.id !== data.user.id) throw new Error("Session failed");
      const { data: profile, error: profileError } = await supabase.from("profiles").select("id").eq("owner_user_id", data.user.id).maybeSingle();
      if (profileError) throw new Error("Profile read failed");
      destination = profile ? next ?? "/profile" : `/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`;
    }
  } catch (error) {
    if (linking && error instanceof Error && error.message === "steam-linked") destination = "/profile/import/steam?error=steam-linked";
    // Never log assertions, auth tokens, emails or provider responses.
  }
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
