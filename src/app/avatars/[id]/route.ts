import { getAccount } from "@/lib/owner";
import { createPublicClient } from "@/lib/supabase/public";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";
import { avatarPath } from "@/lib/avatar-input";
export const runtime = "nodejs";
export async function GET(_request: Request, {params}: {params:Promise<{id:string}>}) {
  const headers = {"Cache-Control":"private, no-store", "X-Content-Type-Options":"nosniff", "X-Robots-Tag":"noindex", "Referrer-Policy":"no-referrer"};
  const {id} = await params;
  if (!/^[1-9]\d{0,14}$/.test(id)) return new Response(null,{status:404,headers});
  try {
    const account = await getAccount();
    const client = account?.profile?.id === Number(id) ? account.supabase : createPublicClient();
    // RLS checks publication on every request, even if someone knows an old URL.
    const {data: profile, error} = await client.from("profiles").select("id,avatar_url").eq("id",Number(id)).eq("is_sample",false).maybeSingle();
    if (error || !profile || !avatarPath(profile.avatar_url)) return new Response(null,{status:404,headers});
    const {data, error: downloadError} = await createAuthAdmin().storage.from("profile-pictures").download(profile.avatar_url);
    if (downloadError || !data) return new Response(null,{status:404,headers});
    // Check again after storage I/O to avoid serving a profile unpublished meanwhile.
    const {data: current} = await client.from("profiles").select("avatar_url").eq("id",Number(id)).eq("avatar_url",profile.avatar_url).maybeSingle();
    if (!current) return new Response(null,{status:404,headers});
    return new Response(data,{headers:{...headers,"Content-Type":"image/webp"}});
  } catch { return new Response(null,{status:503,headers}); }
}
