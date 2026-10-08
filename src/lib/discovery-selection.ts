import { randomBytes } from "node:crypto";

export const discoveryCookie = "playlogg_discovery";
export function discoverySelection(value?: string, tokenExpiry?: number, now = Date.now()) {
  const limit = Math.min(now + 600_000, tokenExpiry && tokenExpiry * 1000 > now ? tokenExpiry * 1000 : Infinity);
  const match = value?.match(/^([a-f0-9]{32})\.(\d{13})$/);
  const storedExpiry = Number(match?.[2]);
  const valid = Boolean(match && storedExpiry > now && storedExpiry <= now + 600_000);
  const seed = valid ? match![1] : randomBytes(16).toString("hex");
  const expiresAt = valid ? Math.min(storedExpiry, limit) : limit;
  return { seed, expiresAt, value: `${seed}.${expiresAt}` };
}
