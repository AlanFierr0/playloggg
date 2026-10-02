import { NextRequest, NextResponse } from "next/server";
import { getPublicComparison } from "@/lib/public-comparison";
import { compareGames } from "@/lib/comparison";
export async function GET(request: NextRequest) {
  const comparison = await getPublicComparison(
    request.nextUrl.searchParams.get("left") ?? "",
    request.nextUrl.searchParams.get("right") ?? "",
  );
  const headers = { "Cache-Control": "private, no-store" };
  if (!comparison)
    return NextResponse.json(
      { error: "Unavailable" },
      { status: 404, headers },
    );
  const result = compareGames(comparison.left.games, comparison.right.games);
  return NextResponse.json(
    {
      title: `${comparison.left.profile.displayName} + ${comparison.right.profile.displayName}`,
      subtitle: "Taste Match",
      items: [
        {
          label: "Taste Match",
          translateLabel: true,
          value:
            result.affinity === null
              ? "Not enough shared ratings"
              : `${result.affinity}%`,
        },
        {
          label: "Shared scored games",
          translateLabel: true,
          value: String(result.scored),
        },
        ...result.agreements
          .slice(0, 1)
          .map((entry) => ({
            translateLabel: true,
            label: `Biggest agreement: ${entry.game.title}`,
            value: `${entry.game.score} / ${entry.other.score}`,
            cover: entry.game.cover,
          })),
        ...result.divergences
          .slice(0, 1)
          .map((entry) => ({
            translateLabel: true,
            label: `Biggest disagreement: ${entry.game.title}`,
            value: `${entry.game.score} / ${entry.other.score}`,
            cover: entry.game.cover,
          })),
      ],
    },
    { headers },
  );
}
