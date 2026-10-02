import { NextRequest, NextResponse } from "next/server";
import { getPublicList } from "@/lib/public-portfolio";
import { getAccount } from "@/lib/owner";
import { getList } from "@/lib/collections";
import { getCatalog } from "@/lib/portfolio";
export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "private, no-store" },
    id = request.nextUrl.searchParams.get("id"),
    handle = request.nextUrl.searchParams.get("handle");
  if (!/^[1-9]\d*$/.test(id ?? "") || !Number.isSafeInteger(Number(id)))
    return NextResponse.json(
      { error: "Unavailable" },
      { status: 404, headers },
    );
  const rows = await getCatalog();
  let list;
  if (handle) list = await getPublicList(handle, id!);
  else {
    const account = await getAccount();
    if (!account?.profile)
      return NextResponse.json(
        { error: "Unavailable" },
        { status: 404, headers },
      );
    const own = await getList(account.profile.id, Number(id));
    list = own
      ? {
          ...own,
          slugs: own.gameIds.flatMap(
            (gameId) => rows.find((row) => row.id === gameId)?.slug ?? [],
          ),
        }
      : null;
  }
  if (!list)
    return NextResponse.json(
      { error: "Unavailable" },
      { status: 404, headers },
    );
  const games = new Map(rows.map((row) => [row.slug, row]));
  return NextResponse.json(
    {
      title: list.name,
      subtitle: list.description || "My game list",
      items: list.slugs.flatMap((slug, index) => {
        const game = games.get(slug);
        return game
          ? [
              {
                label: game.title,
                value: list.is_ranked ? `#${index + 1}` : "",
                cover: game.cover_url,
              },
            ]
          : [];
      }),
    },
    { headers },
  );
}
