/** Catalog families only; stored IGDB names and played-platform choices stay intact. */
export const catalogPlatformGroups = ["PC", "PlayStation", "Xbox", "Nintendo", "Other"] as const;
export type CatalogPlatformGroup = typeof catalogPlatformGroups[number];

const pc = new Set(["pc", "pc (microsoft windows)", "windows", "microsoft windows", "mac", "macos", "linux", "dos", "steam deck", "steamvr", "windows mixed reality"]);
const nintendo = new Set(["64dd", "family computer", "family computer disk system", "game boy", "game boy advance", "game boy color", "satellaview", "super famicom", "super nes cd-rom system", "wii", "wii u", "nes", "snes"]);

export function catalogPlatformGroup(platform: string): CatalogPlatformGroup {
  const name = platform.trim().toLowerCase();
  if (pc.has(name)) return "PC";
  if (name.startsWith("playstation")) return "PlayStation";
  if (name.startsWith("xbox")) return "Xbox";
  if (nintendo.has(name) || name.startsWith("nintendo ") || name.startsWith("new nintendo ") || name === "super nintendo entertainment system") return "Nintendo";
  return "Other";
}

export function matchesCatalogPlatform(platforms: string[] | undefined, filter: string): boolean {
  if (!filter) return true;
  if (catalogPlatformGroups.some(group => group === filter)) return Boolean(platforms?.some(platform => catalogPlatformGroup(platform) === filter));
  // Previously shared exact-platform URLs keep filtering precisely.
  return Boolean(platforms?.includes(filter));
}
