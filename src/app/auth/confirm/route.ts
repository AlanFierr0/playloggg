import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { eligibleAccount } from "@/lib/account-identity";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const code = searchParams.get("code");
  const supabase = await createClient();
  let verified = false;
  const type = searchParams.get("type");
  if (token_hash && (type === "email" || type === "signup" || type === "recovery")) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    verified = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verified = !error;
  }
  if (verified) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && eligibleAccount(user)) {
      const response = NextResponse.redirect(new URL(type === "recovery" || (code && searchParams.get("flow") === "recovery") ? "/reset-password" : "/profile", request.url));
      response.headers.set("Cache-Control", "private, no-store");
      response.headers.set("Referrer-Policy", "no-referrer");
      return response;
    }
    await supabase.auth.signOut();
  }
  const response = NextResponse.redirect(new URL("/login?error=link", request.url));
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
