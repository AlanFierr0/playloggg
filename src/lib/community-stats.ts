export interface CommunityRating {
  profile_id: number;
  game_id: number;
  score: number | null;
  review?: string | null;
  updated_at?: string;
}
export interface RatingActivity {
  profile_id: number;
  game_id: number | null;
  occurred_at: string;
  score_changed: boolean;
}
export function communityStats(
  ratings: CommunityRating[],
  activity: RatingActivity[],
  now = Date.now(),
) {
  const groups = new Map<number, Map<number, number>>();
  for (const row of ratings) {
    if (row.score === null) continue;
    const group = groups.get(row.game_id) ?? new Map<number, number>();
    group.set(row.profile_id, row.score);
    groups.set(row.game_id, group);
  }
  const scores = [...groups].flatMap(([gameId, group]) => {
    const values = [...group.values()];
    if (values.length < 5) return [];
    const average =
      values.reduce((sum, value) => sum + value, 0) / values.length;
    return [
      {
        gameId,
        count: values.length,
        average: Math.round(average * 10) / 10,
        deviation: Math.sqrt(
          values.reduce((sum, value) => sum + (value - average) ** 2, 0) /
            values.length,
        ),
      },
    ];
  });
  const recent = new Map<number, Set<number>>();
  const cutoff = now - 30 * 86400000;
  for (const event of activity) {
    const time = Date.parse(event.occurred_at);
    if (
      event.game_id === null ||
      !event.score_changed ||
      time < cutoff ||
      time > now ||
      !Number.isFinite(time)
    )
      continue;
    const users = recent.get(event.game_id) ?? new Set<number>();
    users.add(event.profile_id);
    recent.set(event.game_id, users);
  }
  const trending = [...recent]
    .map(([gameId, users]) => ({ gameId, count: users.size }))
    .sort((a, b) => b.count - a.count || a.gameId - b.gameId);
  return {
    scores,
    controversial: [...scores].sort(
      (a, b) =>
        b.deviation - a.deviation || b.count - a.count || a.gameId - b.gameId,
    ),
    trending,
  };
}
export function tasteRecommendations(
  own: CommunityRating[],
  others: CommunityRating[],
  ownerId: number,
) {
  const scored = new Map(
    own
      .filter((row) => row.score !== null)
      .map((row) => [row.game_id, row.score!]),
  );
  const logged = new Set(own.map((row) => row.game_id));
  const profiles = new Map<number, CommunityRating[]>();
  for (const row of others) {
    if (row.profile_id === ownerId) continue;
    const rows = profiles.get(row.profile_id) ?? [];
    rows.push(row);
    profiles.set(row.profile_id, rows);
  }
  const candidates = new Map<
    number,
    { gameId: number; total: number; count: number; bestMatch: number }
  >();
  for (const rows of profiles.values()) {
    const shared = rows.filter(
      (row) => row.score !== null && scored.has(row.game_id),
    );
    if (shared.length < 5) continue;
    const match =
      100 -
      shared.reduce(
        (sum, row) => sum + Math.abs(row.score! - scored.get(row.game_id)!),
        0,
      ) /
        shared.length;
    if (match < 85) continue;
    for (const row of rows) {
      if (row.score === null || row.score < 90 || logged.has(row.game_id))
        continue;
      const candidate = candidates.get(row.game_id) ?? {
        gameId: row.game_id,
        total: 0,
        count: 0,
        bestMatch: 0,
      };
      candidate.total += row.score;
      candidate.count++;
      candidate.bestMatch = Math.max(candidate.bestMatch, match);
      candidates.set(row.game_id, candidate);
    }
  }
  return [...candidates.values()]
    .map((row) => ({
      ...row,
      average: Math.round((row.total / row.count) * 10) / 10,
      bestMatch: Math.round(row.bestMatch * 10) / 10,
    }))
    .sort(
      (a, b) =>
        b.count - a.count || b.average - a.average || a.gameId - b.gameId,
    );
}

export function tasteNeighbors(
  own: CommunityRating[],
  others: CommunityRating[],
  ownerId: number,
) {
  const scored = new Map(
    own
      .filter((row) => row.score !== null)
      .map((row) => [row.game_id, row.score!]),
  );
  const groups = new Map<number, CommunityRating[]>();
  for (const row of others) {
    if (
      row.profile_id === ownerId ||
      row.score === null ||
      !scored.has(row.game_id)
    )
      continue;
    const rows = groups.get(row.profile_id) ?? [];
    rows.push(row);
    groups.set(row.profile_id, rows);
  }
  return [...groups]
    .flatMap(([profileId, shared]) => {
      if (shared.length < 5) return [];
      const match =
        100 -
        shared.reduce(
          (sum, row) => sum + Math.abs(row.score! - scored.get(row.game_id)!),
          0,
        ) /
          shared.length;
      return match >= 85
        ? [
            {
              profileId,
              shared: shared.length,
              match: Math.round(match * 10) / 10,
            },
          ]
        : [];
    })
    .sort(
      (a, b) =>
        b.match - a.match || b.shared - a.shared || a.profileId - b.profileId,
    );
}
