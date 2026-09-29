import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isOwnerEmail } from "@/lib/owner";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const code = searchParams.get("code");
  const supabase = await createClient();
  let verified = false;
  if (token_hash && searchParams.get("type") === "email") {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: "email" });
    verified = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verified = !error;
  }
  if (verified) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && isOwnerEmail(user.email)) {
      const response = NextResponse.redirect(new URL("/profile", request.url));
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
