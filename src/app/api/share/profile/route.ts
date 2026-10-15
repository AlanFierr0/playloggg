import { getCommunityScores } from "@/lib/community";
import { NextRequest, NextResponse } from "next/server";
import { getPublicPortfolio } from "@/lib/public-portfolio";
import { getAccount } from "@/lib/owner";
import { getPortfolio, getCatalogRows } from "@/lib/portfolio";
import { profileCard } from "@/lib/share-card";
export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get("handle"),
    kind = request.nextUrl.searchParams.get("kind") ?? "favorites";
  if (request.nextUrl.searchParams.get("kind") === "wrapped") return NextResponse.json({error:"Unavailable"}, {status:404,headers:{"Cache-Control":"private, no-store"}});
  const headers = { "Cache-Control": "private, no-store" };
  let portfolio;
  if (handle) portfolio = await getPublicPortfolio(handle);
  else {
    const account = await getAccount();
    if (!account?.profile)
      return NextResponse.json(
        { error: "Unavailable" },
        { status: 404, headers },
      );
    portfolio = await getPortfolio();
  }
  if (!portfolio)
    return NextResponse.json(
      { error: "Unavailable" },
      { status: 404, headers },
    );
  if (kind === "takes") {
    const rows=await getCatalogRows([],portfolio.games.filter(game=>game.logged&&game.score!==null).map(game=>game.slug));
    const bySlug = new Map(rows.map((row) => [row.slug, row.id]));
    const ids=portfolio.games.filter(game=>game.logged&&game.score!==null).flatMap(game=>bySlug.has(game.slug)?[bySlug.get(game.slug)!]:[]);
    const scores=await getCommunityScores(ids);
    const items = portfolio.games
      .flatMap((game) => {
        if (!game.logged || game.score === null) return [];
        const score = scores.find(
          (row) => row.gameId === bySlug.get(game.slug),
        );
        if (!score) return [];
        return [
          { game, community: score, difference: game.score - score.average },
        ];
      })
      .sort(
        (a, b) =>
          Math.abs(b.difference) - Math.abs(a.difference) ||
          a.game.slug.localeCompare(b.game.slug),
      );
    return NextResponse.json(
      {
        title: portfolio.profile.displayName,
        subtitle: "My biggest score differences",
        items: items.map(({ game, community, difference }) => ({
          label: game.title,
          value: `${game.score} / ${community.average} · ${difference > 0 ? "+" : ""}${difference.toFixed(1)} · n=${community.count}`,
          cover: game.cover,
        })),
      },
      { headers },
    );
  }
  return NextResponse.json(profileCard(portfolio, kind), { headers });
}
