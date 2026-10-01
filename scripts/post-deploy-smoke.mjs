// Read-only production check: no credentials, sign-ins, writes or cleanup.
const base = "https://playloggg.vercel.app";
const checks = [
  ["/", 200, "Curated editorial selection from the catalog."],
  ["/robots.txt", 200, "Sitemap: https://playloggg.vercel.app/sitemap.xml"],
  ["/sitemap.xml", 200, "https://playloggg.vercel.app/games"],
  ["/games", 200, "The game archive"],
  ["/profile", 307, null],
  ["/profile/favorites", 307, null],
  ["/profile/ranking", 307, null],
  ["/profile/reviews", 307, null],
  ["/profile/stats", 307, null],
  ["/u/alexvance", 404, null],
  ["/u/unknown_smoke_profile/favorites", 404, null],
  ["/search?q=Hades&from=/games", 200, "Search the game catalog"],
  ["/login", 200, "Sign in with Steam"],
  ["/compare", 200, "First profile handle"],
  ["/compare?left=alexvance&right=unknown_smoke_profile", 200, "Comparison unavailable."],
  ["/u/unknown_smoke_profile", 404, null],
  ["/u/unknown_smoke_profile/game/hades", 404, null],
  ["/u/unknown_smoke_profile/lists/999999", 404, null],
];
let failures = 0;
for (const [path, status, marker] of checks) {
  try {
    const response = await fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(30000), headers: { "Cache-Control": "no-cache" } });
    const body = await response.text();
    if (response.status !== status || (marker && !body.includes(marker))) throw new Error(`expected ${status}${marker ? " and page marker" : ""}, received ${response.status}`);
    console.log(`PASS ${path} (${status})`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${path}: ${error.message}`);
  }
}
process.exitCode = failures ? 1 : 0;
