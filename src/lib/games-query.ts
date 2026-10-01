import { defaultGamesFilters, type GamesFilters } from "./games-view.ts";
const choices = {
  library: ["all", "logged", "unlogged"],
  status: ["all", "completed", "playing", "backlog", "shelved", "unset"],
  tier: ["all", "S", "A", "B", "C", "D", "F", "unset"],
  rating: ["all", "rated", "unrated"],
  sort: ["title", "newest", "oldest", "score-desc", "score-asc"],
} as const;
export function parseGamesQuery(params: Pick<URLSearchParams, "get">): { filters: GamesFilters; page: number } {
  const filters = { ...defaultGamesFilters };
  filters.query = (params.get("q") ?? "").slice(0, 100);
  filters.genre = (params.get("genre") ?? "").trim().slice(0, 120);
  filters.platform = (params.get("platform") ?? "").trim().slice(0, 120);
  const year = params.get("year") ?? "";
  filters.year = year === "unknown" || (/^\d{1,4}$/.test(year) && Number(year) >= 1) ? year : "";
  for (const key of Object.keys(choices) as (keyof typeof choices)[]) {
    const value = params.get(key);
    if (value && (choices[key] as readonly string[]).includes(value)) Object.assign(filters, { [key]: value });
  }
  // Keep bounded invalid score input visible so the existing validation explains it.
  filters.minScore = (params.get("minScore") ?? "").trim().slice(0, 16);
  filters.maxScore = (params.get("maxScore") ?? "").trim().slice(0, 16);
  const rawPage = params.get("page") ?? "";
  const page = /^\d{1,7}$/.test(rawPage) && Number(rawPage) >= 1 ? Math.min(Number(rawPage), 1_000_000) : 1;
  return { filters, page };
}
export function gamesQuery(filters: GamesFilters, page = 1): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(defaultGamesFilters) as (keyof GamesFilters)[]) {
    if (filters[key] !== defaultGamesFilters[key]) params.set(key === "query" ? "q" : key, filters[key]);
  }
  if (page > 1) params.set("page", String(page));
  return params.toString();
}
