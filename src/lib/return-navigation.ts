const allowedQueries: Record<string, string[]> = {
  "/games": ["q", "genre", "tag", "platform", "year", "library", "status", "tier", "rating", "sort", "minScore", "maxScore", "page", "size"],
  "/compare": ["left", "right", "page"],
  "/people": ["q", "page"],
  "/search": ["q", "mode"],
  "/log": ["game"],
};

export function navigationPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 8192 || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;
  try {
    const url = new URL(value, "https://playlogg.invalid");
    if (url.origin !== "https://playlogg.invalid" || !/^(?:\/|\/(?:games|compare|people|search|log|settings|tiers)|\/profile(?:\/(?:ranking|reviews|stats|timeline|favorites|social|import\/steam))?|\/game\/[a-z0-9]+(?:-[a-z0-9]+)*|\/u\/[a-z0-9][a-z0-9_]{2,29}(?:\/(?:ranking|tiers|reviews|stats|favorites|timeline)|\/game\/[a-z0-9]+(?:-[a-z0-9]+)*)?)$/.test(url.pathname)) return null;
    const query = new URLSearchParams();
    for (const key of allowedQueries[url.pathname] ?? ["page"]) {
      const text = url.searchParams.get(key);
      if (text) query.set(key, text.slice(0, 120));
    }
    return `${url.pathname}${query.size ? `?${query}` : ""}`;
  } catch { return null; }
}

export function loginHref(destination: unknown): string {
  return `/login?${new URLSearchParams({ next: navigationPath(destination) ?? "/" })}`;
}

export function visitPage(history: string[], current: string | null): string[] {
  if (!current) return [];
  const index = history.lastIndexOf(current);
  return index < 0 ? [...history, current].slice(-50) : history.slice(0, index + 1);
}

export function previousPage(history: string[], current: string | null, fallback: string): string {
  const pages = visitPage(history, current).slice(0, -1);
  // A game picker or a switched draft is part of the same logging action.
  const logging = current?.startsWith("/log?game=");
  while (pages.length) {
    const previous = pages.pop()!;
    const url = new URL(previous, "https://playlogg.invalid");
    if (logging && (url.pathname === "/log" || (url.pathname === "/search" && url.searchParams.get("mode") === "log"))) continue;
    return previous;
  }
  return navigationPath(fallback) ?? "/";
}

export function restoreNavigation(value: string | null, current: string | null): string[] {
  try {
    const paths: unknown = JSON.parse(value ?? "null");
    if (Array.isArray(paths) && paths.length <= 50 && paths.every(path => navigationPath(path) === path) && paths.at(-1) === current) return paths;
  } catch {}
  return current ? [current] : [];
}
