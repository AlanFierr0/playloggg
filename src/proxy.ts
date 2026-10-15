import { discoveryCookie, discoverySelection } from "@/lib/discovery-selection";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let tokenExpiry: number | undefined;
  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values, headers) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
          response.headers.set("Cache-Control", "private, no-store");
        },
      },
    });
    const { data } = await supabase.auth.getClaims();
    tokenExpiry = data?.claims.exp;
  }
  if (request.nextUrl.pathname === "/") {
    const previous = request.cookies.get(discoveryCookie)?.value;
    const selection = discoverySelection(previous, tokenExpiry);
    request.cookies.set(discoveryCookie, selection.value);
    const updated = NextResponse.next({ request });
    response.cookies.getAll().forEach(cookie => updated.cookies.set(cookie));
    response.headers.forEach((value, name) => {
      if (!name.startsWith("x-middleware-") && name !== "set-cookie") updated.headers.set(name, value);
    });
    response = updated;
    if (selection.value !== previous) response.cookies.set(discoveryCookie, selection.value, { httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/", expires: new Date(selection.expiresAt) });
  }
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
