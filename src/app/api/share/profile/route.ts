import { getCommunity } from "@/lib/community";
import { NextRequest, NextResponse } from "next/server";
import { getPublicPortfolio } from "@/lib/public-portfolio";
import { getAccount } from "@/lib/owner";
import { getPortfolio, getCatalog } from "@/lib/portfolio";
import { profileCard } from "@/lib/share-card";
import { gamingYear, yearGames, type GamingEvent } from "@/lib/gaming-year";
export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get("handle"),
    kind = request.nextUrl.searchParams.get("kind") ?? "favorites";
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
    const [community, rows] = await Promise.all([getCommunity(), getCatalog()]);
    const bySlug = new Map(rows.map((row) => [row.slug, row.id]));
    const items = portfolio.games
      .flatMap((game) => {
        if (!game.logged || game.score === null) return [];
        const score = community.scores.find(
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
  if (kind === "wrapped") {
    const account = await getAccount();
    if (
      !account?.profile ||
      String(account.profile.id) !== portfolio.profile.id
    )
      return NextResponse.json(
        { error: "Unavailable" },
        { status: 404, headers },
      );
    const raw = request.nextUrl.searchParams.get("year"),
      year = /^20\d{2}$/.test(raw ?? "")
        ? Number(raw)
        : new Date().getUTCFullYear();
    const events: GamingEvent[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await account.supabase
        .from("profile_activity")
        .select(
          "game_id,kind,score,score_changed,completion_changed,occurred_at",
        )
        .eq("profile_id", account.profile.id)
        .gte("occurred_at", `${year}-01-01T00:00:00Z`)
        .lt("occurred_at", `${year + 1}-01-01T00:00:00Z`)
        .order("id")
        .range(offset, offset + 499);
      if (error) throw new Error("Year in Gaming could not be loaded.");
      events.push(...data);
      if (data.length < 500) break;
    }
    const summary = gamingYear(events, year),
      games = yearGames(summary, await getCatalog(), portfolio.games);
    return NextResponse.json(
      {
        title: portfolio.profile.displayName,
        subtitle: `${year} Year in Gaming`,
        items: [
          {
            label: "Games rated",
            translateLabel: true,
            value: String(summary.scored),
          },
          {
            label: "Completed games",
            translateLabel: true,
            value: String(summary.completed),
          },
          {
            label: "Average score",
            translateLabel: true,
            value: String(summary.average ?? "—"),
          },
          ...games
            .slice(0, 3)
            .map((game) => ({
              label: game.title,
              value: String(game.score),
              cover: game.cover,
            })),
        ],
      },
      { headers },
    );
  }
  return NextResponse.json(profileCard(portfolio, kind), { headers });
}
