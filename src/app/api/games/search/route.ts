import { getSearchPortfolio } from "@/lib/portfolio";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q") ?? "";
  const offset = Number(params.get("offset") ?? 0);
  if (query.length > 100 || !Number.isSafeInteger(offset) || offset < 0) return Response.json({error: "Invalid search."}, {status: 400});
  try {
    const {games, hasMore} = await getSearchPortfolio(query, offset, params.get("mode") === "log");
    return Response.json({games, hasMore}, {headers: {"Cache-Control": "private, no-store"}});
  } catch {
    return Response.json({error: "Game search could not be loaded."}, {status: 503});
  }
}
