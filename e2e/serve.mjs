import { spawn } from "node:child_process";
import { mkdirSync, createWriteStream } from "node:fs";
import { startFixtureServer, fixtureOrigin, fixtureAdminKey } from "./fixture-server.mjs";

mkdirSync("e2e-artifacts", { recursive: true });
const log = createWriteStream("e2e-artifacts/server.log", { flags: "w" });
const server = await startFixtureServer();
// Explicit values override ignored .env files. No production identity/provider keys.
const env = { ...process.env, PLAYLOGG_E2E_BUILD: "1", NEXT_PUBLIC_SUPABASE_URL: fixtureOrigin, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fixture-publishable-key", PLAYLOGG_OWNER_EMAIL: "owner@fixture.test", PLAYLOGG_SITE_URL: "http://localhost:3100", SUPABASE_SECRET_KEY: fixtureAdminKey, IGDB_CLIENT_ID: "fixture-client", IGDB_CLIENT_SECRET: "fixture-secret", NEXT_TELEMETRY_DISABLED: "1" };
let child;
function launch(args) {
  child = spawn(process.execPath, ["--import", "./e2e/provider-fetch.mjs", "node_modules/next/dist/bin/next", ...args], { env, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.on("data", (data) => { log.write(data); process.stdout.write(data); });
  child.stderr.on("data", (data) => { log.write(data); process.stderr.write(data); });
  return child;
}
const build = launch(["build"]);
const code = await new Promise((resolve) => build.on("exit", resolve));
if (code !== 0) { server.close(); log.end(); process.exit(code || 1); }
launch(["start", "--hostname", "127.0.0.1", "--port", "3100"]).on("exit", (code) => { server.close(); log.end(); process.exit(code || 0); });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => { child.kill(); server.close(); log.end(); });
