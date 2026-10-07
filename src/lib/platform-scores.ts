import "server-only";
import { cache } from "react";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";

export const getPlatformScores = cache(async () => {
  const client = createAuthAdmin();
  const scores = new Map<string, { average: number; count: number }>();
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.rpc("platform_game_scores").order("slug").range(offset, offset + 499);
    if (error) throw new Error("Platform scores could not be loaded.");
    for (const row of data) scores.set(row.slug, { average: row.average, count: row.sample_count });
    if (data.length < 500) return scores;
  }
});
