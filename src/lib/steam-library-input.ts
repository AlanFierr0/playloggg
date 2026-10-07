export interface SteamGame { appId: number; title: string; hours: number }
export interface SteamBrowse {offset:number;sort:"title"|"hours_desc"|"hours_asc";minHours:number|null;maxHours:number|null}

export function parseSteamBrowse(value: unknown): SteamBrowse | null {
  if (!value || typeof value !== "object") return null;
  const {offset,sort,minHours,maxHours} = value as Record<string,unknown>;
  const hours = (value:unknown) => value === null || typeof value === "number" && Number.isFinite(value) && value >= 0;
  if (typeof offset !== "number" || !Number.isSafeInteger(offset) || offset < 0 || offset > 50000 || typeof sort !== "string" || !["title","hours_desc","hours_asc"].includes(sort) || !hours(minHours) || !hours(maxHours)) return null;
  if (typeof minHours === "number" && typeof maxHours === "number" && minHours > maxHours) return null;
  return {offset,sort:sort as SteamBrowse["sort"],minHours:minHours as number|null,maxHours:maxHours as number|null};
}

export function browseSteamLibrary<T extends SteamGame>(games: T[], query: SteamBrowse) {
  return games.filter(game=>(query.minHours===null||game.hours>=query.minHours)&&(query.maxHours===null||game.hours<=query.maxHours))
    .sort((a,b)=>(query.sort==="hours_desc" ? b.hours-a.hours : query.sort==="hours_asc" ? a.hours-b.hours : 0)||a.title.localeCompare(b.title)||a.appId-b.appId);
}

export function steamAppId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= 2147483647;
}

export function steamIdentity(value: unknown): value is string {
  return typeof value === "string" && /^7656119\d{10}$/.test(value);
}

export function parseSteamLibrary(value: unknown): SteamGame[] {
  const response = value && typeof value === "object" && "response" in value ? value.response : null;
  if (!response || typeof response !== "object" || !("game_count" in response) || !Number.isSafeInteger(response.game_count) || Number(response.game_count) < 0) throw new Error("Steam game details are unavailable. Set Game details to Public in Steam privacy settings, then retry.");
  if (response.game_count === 0) return [];
  if (!("games" in response) || !Array.isArray(response.games) || response.games.length > 50000) throw new Error("Steam returned an invalid library. Please retry.");
  const seen = new Set<number>();
  return response.games.map((game: unknown) => {
    if (!game || typeof game !== "object" || !("appid" in game) || !steamAppId(game.appid) || !("name" in game) || typeof game.name !== "string" || !game.name.trim() || !("playtime_forever" in game) || typeof game.playtime_forever !== "number" || !Number.isSafeInteger(game.playtime_forever) || game.playtime_forever < 0) throw new Error("Steam returned an invalid library. Please retry.");
    return { appId: game.appid, title: game.name.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0,300), hours: Math.round(game.playtime_forever / 60 * 100) / 100 };
  }).filter(game => !seen.has(game.appId) && Boolean(seen.add(game.appId)))
    .sort((a,b) => a.title.localeCompare(b.title) || a.appId-b.appId);
}

// Require an exact external Steam ID and reject ambiguous provider matches.
export function matchSteamGames(records: unknown[], appIds: number[]): Map<number, number> {
  const wanted = new Set(appIds);
  const candidates = new Map<number, Set<number>>();
  for (const record of records) {
    if (!record || typeof record !== "object" || !("id" in record) || !steamAppId(record.id) || !("external_games" in record) || !Array.isArray(record.external_games)) continue;
    for (const external of record.external_games) {
      if (!external || typeof external !== "object" || external.external_game_source !== 1 || typeof external.uid !== "string" || !/^[1-9]\d{0,9}$/.test(external.uid)) continue;
      const appId = Number(external.uid);
      if (!wanted.has(appId)) continue;
      const ids = candidates.get(appId) ?? new Set<number>();
      ids.add(record.id); candidates.set(appId, ids);
    }
  }
  return new Map([...candidates].flatMap(([appId,ids]) => ids.size === 1 ? [[appId,[...ids][0]]] : []));
}

export function steamMatchBody(appIds: number[]) {
  if (!appIds.length || appIds.length > 25 || appIds.some(id => !steamAppId(id))) throw new Error("Invalid library selection.");
  return `fields id,name,slug,first_release_date,cover.image_id,genres.name,platforms.name,artworks.image_id,screenshots.image_id,url,summary,game_type.type,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,external_games.uid,external_games.external_game_source; where external_games.uid = (${appIds.map(id=>JSON.stringify(String(id))).join(",")}) & external_games.external_game_source = 1; limit 500;`;
}
