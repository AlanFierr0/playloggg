import type { LibraryRow } from "../app/actions/steam-library.ts";
import { steamAppId } from "./steam-library-input.ts";

export type SteamImportWork = {
  version: 1;
  rows: LibraryRow[];
  pending: number[];
  rateIds: number[];
  total: number;
  imported: number;
  skipped: number;
};

// shortcut: per-profile browser recovery; use server jobs for cross-device/background imports.
export function readSteamImportWork(raw: string): SteamImportWork | null {
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !Array.isArray(value.rows) || !value.rows.length || value.rows.length > 10000) return null;
    if (!value.rows.every((row: LibraryRow) => row && steamAppId(row.appId) && typeof row.title === "string" && row.title.length <= 300 && Number.isFinite(row.hours) && row.hours >= 0 && typeof row.matched === "boolean" && typeof row.logged === "boolean" && (row.cover === null || typeof row.cover === "string") && Array.isArray(row.genres) && row.genres.every(genre => typeof genre === "string"))) return null;
    const ids = new Set(value.rows.map((row: LibraryRow) => row.appId));
    if (ids.size !== value.rows.length || !Array.isArray(value.pending) || !value.pending.length || !Array.isArray(value.rateIds)) return null;
    for (const list of [value.pending, value.rateIds]) if (new Set(list).size !== list.length || !list.every((id: unknown) => steamAppId(id) && ids.has(id))) return null;
    if (value.total !== value.rows.length || !Number.isInteger(value.imported) || value.imported < 0 || !Number.isInteger(value.skipped) || value.skipped < 0 || value.imported + value.skipped + value.pending.length > value.total) return null;
    return value as SteamImportWork;
  } catch { return null; }
}
