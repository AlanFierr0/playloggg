import type { Database, Json } from "../types/database.ts";

export interface IgdbMatch {
  id: number;
  title: string;
  cover: string | null;
  year: number | null;
  platforms: string[];
  type: string | null;
  catalogSlug?: string;
}

export function igdbId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= 2147483647;
}

export function catalogQuery(value: unknown): string | null {
  if (typeof value !== "string" || /[\u0000-\u001f\u007f]/.test(value)) return null;
  const query = value.trim();
  return query.length >= 2 && query.length <= 100 ? query : null;
}

// APICalypse uses quoted strings. Escape quotes/backslashes; do not interpolate
// user input as filters, field names, endpoints, or numeric IDs.
export function searchBody(query: string) {
  return `search ${JSON.stringify(query)}; fields id,name,first_release_date,cover.image_id,platforms.name,game_type.type; limit 20;`;
}

const object = (value: unknown): Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown, limit: number) => typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, limit) : "";
const rows = (value: unknown) => Array.isArray(value) ? value.slice(0, 50).map(object) : [];
const imageId = (value: unknown): string | null => typeof value === "string" && /^[A-Za-z0-9_]{1,100}$/.test(value) ? value : null;
const imageIds = (value: unknown) => [...new Set(rows(value).map((row) => imageId(row.image_id)).filter((id): id is string => id !== null))];
const names = (value: unknown) => [...new Set(rows(value).map((row) => text(row.name, 120)).filter(Boolean))];
const coverUrl = (id: string) => `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${id}.jpg`;

function releaseDate(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > 253402300799) return null;
  return new Date(value * 1000).toISOString().slice(0, 10);
}

export function normalizeMatch(value: unknown): IgdbMatch | null {
  const record = object(value);
  const title = text(record.name, 300);
  if (!igdbId(record.id) || !title) return null;
  const image = imageId(object(record.cover).image_id);
  const date = releaseDate(record.first_release_date);
  return { id: record.id, title, cover: image ? coverUrl(image) : null, year: date ? Number(date.slice(0, 4)) : null, platforms: names(record.platforms), type: text(object(record.game_type).type, 80) || null };
}

export function normalizeImport(value: unknown): Database["public"]["Tables"]["games"]["Insert"] | null {
  const match = normalizeMatch(value);
  if (!match) return null;
  const record = object(value);
  const slug = text(record.slug, 200).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80).replace(/-$/, "") || "game";
  const date = releaseDate(record.first_release_date);
  const companies = rows(record.involved_companies);
  const companyNames = (role: string) => names(companies.filter((row) => row[role] === true).map((row) => row.company));
  const genres = names(record.genres);
  // Whitelist public fields. Never persist arbitrary provider payloads or URLs.
  const metadata: Json = { summary: text(record.summary, 10000) || null, platforms: match.platforms, developers: companyNames("developer"), publishers: companyNames("publisher"), game_type: match.type };
  return {
    slug: `${slug}-igdb-${match.id}`, title: match.title, igdb_id: match.id,
    cover_url: match.cover ?? "/images/missing-cover.svg", cover_image_id: imageId(object(record.cover).image_id),
    released_on: date, release_year: match.year, genres,
    artwork_image_ids: imageIds(record.artworks), screenshot_image_ids: imageIds(record.screenshots),
    igdb_url: typeof record.url === "string" && /^https:\/\/www\.igdb\.com\/games\/[a-z0-9-]+$/.test(record.url) ? record.url : null, igdb_metadata: metadata,
    search_keywords: [match.title, slug.replaceAll("-", " "), ...genres].join(" "),
    igdb_synced_at: new Date().toISOString(),
  };
}
