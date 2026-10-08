import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { steamLoginUrl, steamSite, steamLinkCookie } from "@/lib/steam-openid";

import { getAccount } from "@/lib/owner";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  let linking = false;
  try {
    const site = steamSite(process.env.PLAYLOGG_SITE_URL);
    if (request.headers.get("origin") !== site || request.nextUrl.origin !== site) return new NextResponse("Invalid origin", { status: 403 });
    linking = (await request.formData()).get("mode") === "link";
    if (!process.env.SUPABASE_SECRET_KEY) throw new Error("Not configured");
    const account = linking ? await getAccount() : null;
    if (linking && !account?.profile) return NextResponse.redirect(new URL("/login", request.url), 303);
    const state = randomBytes(32).toString("hex");
    const response = NextResponse.redirect(steamLoginUrl(site, state), 303);
    response.cookies.set("playlogg-steam-state", state, { httpOnly: true, secure: site.startsWith("https:"), sameSite: "lax", path: "/auth/steam", maxAge: 600 });
    response.cookies.set("playlogg-steam-link", account ? steamLinkCookie(state, account.user.id, process.env.SUPABASE_SECRET_KEY) : "", { httpOnly: true, secure: site.startsWith("https:"), sameSite: "lax", path: "/auth/steam", maxAge: account ? 600 : 0 });
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch {
    return NextResponse.redirect(new URL(linking ? "/profile/import/steam?error=steam-config" : "/login?error=steam-config", request.url), 303);
  }
}
