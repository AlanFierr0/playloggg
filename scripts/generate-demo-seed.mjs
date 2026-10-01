import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "supabase/seed.sql");
const sql = "-- Demo seeding is retired. Automatic database seeding remains disabled.\n-- Create isolated test fixtures in rollback-only tests; never restore demo players.\n";
if (process.argv.includes("--check")) {
  if (fs.readFileSync(target, "utf8").replaceAll("\r\n", "\n") !== sql) throw new Error("seed.sql must remain an empty seed.");
} else fs.writeFileSync(target, sql);
console.log("Demo seeding is disabled; no database writes prepared.");
