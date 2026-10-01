// Read-only production check: no credentials, sign-ins, writes or cleanup.
const base = "https://playloggg.vercel.app";
const checks = [
  ["/", 200, "Sample editorial selection."],
  ["/games", 200, "The game archive"],
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
