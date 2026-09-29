import { timingSafeEqual } from "node:crypto";

export const steamEndpoint = "https://steamcommunity.com/openid/login";
const namespace = "http://specs.openid.net/auth/2.0";
export const validSteamId = (value: unknown): value is string => typeof value === "string" && /^7656119\d{10}$/.test(value);
export function steamSite(value: string | undefined) {
  const url = new URL(value ?? "");
  if (url.username || url.password || (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "localhost"))) throw new Error("Invalid site configuration");
  return url.origin;
}
export function steamLoginUrl(site: string, state: string) {
  const url = new URL(steamEndpoint);
  const selected = "http://specs.openid.net/auth/2.0/identifier_select";
  url.search = new URLSearchParams({ "openid.ns": namespace, "openid.mode": "checkid_setup", "openid.return_to": `${site}/auth/steam/callback?state=${state}`, "openid.realm": `${site}/`, "openid.identity": selected, "openid.claimed_id": selected }).toString();
  return url.toString();
}
export async function verifySteam(params: URLSearchParams, cookie: string | undefined, site: string, send: typeof fetch = fetch, now = Date.now()): Promise<string | null> {
  const state = params.get("state");
  if (!cookie || !state || !/^[a-f0-9]{64}$/.test(state) || !/^[a-f0-9]{64}$/.test(cookie) || !timingSafeEqual(Buffer.from(state), Buffer.from(cookie))) return null;
  if ([...new Set(params.keys())].some((key) => params.getAll(key).length !== 1) || params.toString().length > 12000) return null;
  if (params.get("openid.ns") !== namespace || params.get("openid.mode") !== "id_res" || params.get("openid.op_endpoint") !== steamEndpoint || params.get("openid.return_to") !== `${site}/auth/steam/callback?state=${state}`) return null;
  const claimed = params.get("openid.claimed_id") ?? "";
  const id = /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/.exec(claimed)?.[1];
  if (!validSteamId(id) || params.get("openid.identity") !== claimed) return null;
  const signed = new Set((params.get("openid.signed") ?? "").split(","));
  if (!["op_endpoint", "claimed_id", "identity", "return_to", "response_nonce", "assoc_handle"].every((key) => signed.has(key) && params.get(`openid.${key}`)) || !params.get("openid.sig")) return null;
  const nonce = params.get("openid.response_nonce") ?? "";
  const timestamp = Date.parse(nonce.slice(0, 20));
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z.+$/.test(nonce) || !Number.isFinite(timestamp) || now - timestamp > 600000 || timestamp - now > 60000) return null;
  const body = new URLSearchParams([...params].filter(([key]) => key.startsWith("openid.")));
  body.set("openid.mode", "check_authentication");
  const response = await send(steamEndpoint, { method: "POST", body, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000) });
  if (!response.ok) return null;
  const result = await response.text();
  return result.length < 4000 && result.split(/\r?\n/).filter((line) => line.startsWith("is_valid:")).join("") === "is_valid:true" ? id : null;
}

export function profileNames(input: { handle: unknown; displayName: unknown }) {
  const handle = typeof input.handle === "string" ? input.handle.trim().toLowerCase() : "";
  const displayName = typeof input.displayName === "string" ? input.displayName.trim() : "";
  return /^[a-z0-9][a-z0-9_]{2,29}$/.test(handle) && displayName.length > 0 && displayName.length <= 80 && !/[\u0000-\u001f\u007f]/.test(displayName) ? { handle, display_name: displayName } : null;
}
