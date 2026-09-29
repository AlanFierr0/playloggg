import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Explicitly anonymous even when the visitor is signed in. Visibility reads stay fresh.
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Public portfolio reads are not configured.");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(15000) }) },
  });
}
