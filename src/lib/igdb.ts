import "server-only";
import { createIgdbHttp } from "@/lib/igdb-http";

let query: ReturnType<typeof createIgdbHttp> | undefined;
export function queryIgdb(body: string) {
  const id = process.env.IGDB_CLIENT_ID;
  const secret = process.env.IGDB_CLIENT_SECRET;
  if (!id || !secret) throw new Error("IGDB search is not configured yet.");
  query ??= createIgdbHttp(id, secret);
  return query(body);
}
