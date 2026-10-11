"use server";
import { getAccount } from "@/lib/owner";
import { revalidatePath } from "next/cache";
export async function saveRanking(slugs: unknown, revision: unknown, manual: Record<string, number>): Promise<{ok:boolean;message:string;revision?:number|null;conflict?:boolean}> {
  if (
    !manual || typeof manual !== "object" || Array.isArray(manual) ||
    Object.entries(manual).some(([slug, position]) => !Array.isArray(slugs) || !slugs.includes(slug) || !Number.isInteger(position) || position < 0 || position >= slugs.length) ||
    !Array.isArray(slugs) ||
    slugs.length > 10000 ||
    slugs.some(
      (slug) =>
        typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
    ) ||
    new Set(slugs).size !== slugs.length ||
    (revision !== null &&
      (!Number.isSafeInteger(revision) || Number(revision) < 1))
  )
    return { ok: false, message: "Invalid ranking." };
  try {
    const account = await getAccount();
    if (!account?.profile)
      return { ok: false, message: "Sign in to edit your ranking." };
    const rows = [];
    for (let offset = 0; offset < slugs.length; offset += 100) {
      const { data, error } = await account.supabase
        .from("games")
        .select("id,slug")
        .in("slug", slugs.slice(offset, offset + 100));
      if (error)
        return {
          ok: false,
          message: "Ranking could not be saved. Your draft has been kept.",
        };
      rows.push(...data);
    }
    const bySlug = new Map(rows.map((row) => [row.slug, row.id]));
    if (rows.length !== slugs.length)
      return { ok: false, message: "A game is unavailable." };
    const { data, error } = await account.supabase.rpc(
      "save_preference_ranking_v2",
      {
        p_ids: slugs.map((slug) => bySlug.get(slug)!),
        p_revision: revision as number,
        p_manual: Object.fromEntries(Object.entries(manual).map(([slug, position]) => [String(bySlug.get(slug)!), position])),
      },
    );
    if(error){
      if(error.code==="40001"){
        const {data:current,error:readError}=await account.supabase.from("profile_rankings").select("revision").eq("profile_id",account.profile.id).maybeSingle();
        if(!readError)return {ok:false,conflict:true,revision:current?.revision??null,message:"Ranking changed elsewhere. Your draft is kept. Review it before retrying against the latest saved version."};
      }
      return {ok:false,message:"Ranking could not be saved. Your draft has been kept."};
    }
    revalidatePath("/", "layout");
    return {
      ok: true,
      revision: data,
      message: "Personal ranking saved. Scores and tiers are unchanged.",
    };
  } catch {
    return {
      ok: false,
      message: "Ranking could not be saved. Your draft has been kept.",
    };
  }
}
