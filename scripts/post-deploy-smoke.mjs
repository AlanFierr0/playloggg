// Read-only production check: no credentials, sign-ins, writes or cleanup.
const base = "https://playlogg.alanfierro.dev";
const checks = [
  ["/", 200, "Build your gaming identity."],
  ["/robots.txt", 200, "Sitemap: https://playlogg.alanfierro.dev/sitemap.xml"],
  ["/sitemap.xml", 200, "https://playlogg.alanfierro.dev/games"],
  ["/games", 200, "Catalog filters"],
  ["/people",200,"Explore profiles"],
  ["/quick-rate",404,null],
  ["/profile/wrapped",404,null],
  ["/profile/activity",307,null],
  ["/profile/social",307,null],
  ["/profile/import/steam",307,null],
  ["/api/share/profile",404,null],
  ["/api/share/list?id=999999",404,null],
  ["/api/share/compare?left=unknown_smoke_profile&right=missing_smoke_profile",404,null],
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
    if(response.headers.get("x-content-type-options")!=="nosniff" || response.headers.get("x-frame-options")!=="DENY" || !response.headers.get("content-security-policy")?.includes("frame-ancestors 'none'")) throw new Error("Missing security headers");
    if (response.status !== status || (marker && !body.includes(marker))) throw new Error(`expected ${status}${marker ? " and page marker" : ""}, received ${response.status}`);
    console.log(`PASS ${path} (${status})`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${path}: ${error.message}`);
  }
}
process.exitCode = failures ? 1 : 0;
