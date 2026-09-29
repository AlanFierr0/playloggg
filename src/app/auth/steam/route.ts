import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { steamLoginUrl, steamSite } from "@/lib/steam-openid";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    const site = steamSite(process.env.PLAYLOGG_SITE_URL);
    if (request.headers.get("origin") !== site || request.nextUrl.origin !== site) return new NextResponse("Invalid origin", { status: 403 });
    if (!process.env.SUPABASE_SECRET_KEY) throw new Error("Not configured");
    const state = randomBytes(32).toString("hex");
    const response = NextResponse.redirect(steamLoginUrl(site, state), 303);
    response.cookies.set("playlogg-steam-state", state, { httpOnly: true, secure: site.startsWith("https:"), sameSite: "lax", path: "/auth/steam", maxAge: 600 });
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=steam-config", request.url), 303);
  }
}
