import { discoverProfiles, profileSearch } from "@/lib/profile-directory";
import { getAccount } from "@/lib/owner";

export async function GET(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const query = profileSearch(new URL(request.url).searchParams.get("q") ?? "");
    const account = await getAccount();
    const excluded: number[] = [];
    if (account?.profile) {
      const { data, error } = await account.supabase.from("profile_blocks").select("blocker_id,blocked_id");
      if (error) throw new Error("Connections could not be loaded.");
      data.forEach(row => excluded.push(row.blocker_id === account.profile!.id ? row.blocked_id : row.blocker_id));
    }
    const rows = await discoverProfiles(24, 0, query, excluded);
    return Response.json({ profiles: rows.map(row => ({ id: String(row.id), handle: row.handle, displayName: row.display_name, avatarUrl: row.avatar_url, isPublic: true })) }, { headers });
  } catch {
    return Response.json({ error: "Profile search could not be loaded." }, { status: 503, headers });
  }
}
