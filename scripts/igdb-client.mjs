// Administrative scripts only. Never import into application/browser code.
import { setTimeout as delay } from "node:timers/promises";

export function createIgdbClient() {
  const clientId = process.env.IGDB_CLIENT_ID;
  const secret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("Configure IGDB_CLIENT_ID and IGDB_CLIENT_SECRET in ignored .env.local.");
  let token;
  let expiresAt = 0;
  let lastRequest = 0;

  async function authenticate() {
    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({ client_id: clientId, client_secret: secret, grant_type: "client_credentials" }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`Twitch authentication failed (HTTP ${response.status}).`);
    const data = await response.json();
    if (typeof data.access_token !== "string" || !Number.isFinite(data.expires_in)) throw new Error("Invalid Twitch token response.");
    token = data.access_token;
    expiresAt = Date.now() + Math.max(0, data.expires_in - 60) * 1000;
  }

  // Call sequentially: deliberately stay below IGDB's four requests/second.
  return async function query(body) {
    for (let attempt = 0; attempt < 4; attempt++) {
      if (!token || Date.now() >= expiresAt) await authenticate();
      await delay(Math.max(0, 300 - (Date.now() - lastRequest)));
      lastRequest = Date.now();
      const response = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers: { "Client-ID": clientId, Authorization: `Bearer ${token}`, "Content-Type": "text/plain" },
        body,
        signal: AbortSignal.timeout(30000),
      });
      if (response.status === 401 && attempt === 0) { token = undefined; continue; }
      if ((response.status === 429 || response.status >= 500) && attempt < 3) {
        const retrySeconds = Number(response.headers.get("retry-after"));
        await delay(Math.min(30000, Math.max(1000 * 2 ** attempt, Number.isFinite(retrySeconds) ? retrySeconds * 1000 : 0)));
        continue;
      }
      // Never log request headers, credentials, tokens or full authentication responses.
      if (!response.ok) throw new Error(`IGDB request failed (HTTP ${response.status}).`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid IGDB game response.");
      return data;
    }
    throw new Error("IGDB retry limit reached.");
  };
}
