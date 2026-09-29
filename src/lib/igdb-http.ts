// Only imported by the server-only runtime module and HTTP contract tests.
// Credentials are supplied by that module, never a Client Component.
export function createIgdbHttp(clientId: string, clientSecret: string, request: typeof fetch = fetch) {
  let token: string | undefined;
  let expiresAt = 0;
  let nextRequest = 0;
  let queue: Promise<unknown> = Promise.resolve();
  let queued = 0;
  let cooldownUntil = 0;

  async function run(body: string): Promise<unknown[]> {
    if (Date.now() < cooldownUntil) throw new Error("IGDB is busy. Please wait a moment and try again.");
    for (let attempt = 0; attempt < 2; attempt++) {
      if (!token || Date.now() >= expiresAt) {
        const response = await request("https://id.twitch.tv/oauth2/token", {
          method: "POST", body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials" }),
          cache: "no-store", signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) throw new Error("IGDB authentication is unavailable. Please try again later.");
        const auth: unknown = await response.json();
        if (!auth || typeof auth !== "object" || !("access_token" in auth) || typeof auth.access_token !== "string" || !auth.access_token || !("expires_in" in auth) || typeof auth.expires_in !== "number" || !Number.isFinite(auth.expires_in) || auth.expires_in <= 0) throw new Error("IGDB authentication is unavailable. Please try again later.");
        token = auth.access_token;
        expiresAt = Date.now() + Math.max(0, auth.expires_in - 60) * 1000;
      }
      await new Promise((resolve) => setTimeout(resolve, Math.max(0, nextRequest - Date.now())));
      nextRequest = Date.now() + 300;
      const response = await request("https://api.igdb.com/v4/games", {
        method: "POST", headers: { "Client-ID": clientId, Authorization: `Bearer ${token}`, "Content-Type": "text/plain" },
        body, cache: "no-store", signal: AbortSignal.timeout(15000),
      });
      if (response.status === 401 && attempt === 0) { token = undefined; continue; }
      if (response.status === 429) {
        const retry = response.headers.get("retry-after");
        const seconds = Number(retry);
        const delay = retry && Number.isFinite(seconds) ? seconds * 1000 : retry ? Date.parse(retry) - Date.now() : 1000;
        cooldownUntil = Date.now() + Math.max(1000, Math.min(Number.isFinite(delay) ? delay : 1000, 60000));
        throw new Error("IGDB is busy. Please wait a moment and try again.");
      }
      if (!response.ok) throw new Error("IGDB search is unavailable. Please try again later.");
      const result: unknown = await response.json();
      if (!Array.isArray(result)) throw new Error("IGDB returned an invalid response. Please try again later.");
      return result;
    }
    throw new Error("IGDB search is unavailable. Please try again later.");
  }

  return (body: string): Promise<unknown[]> => {
    if (queued >= 4) return Promise.reject(new Error("IGDB is busy. Please wait a moment and try again."));
    queued++;
    const result = queue.then(() => run(body)).finally(() => { queued--; });
    queue = result.catch(() => undefined);
    return result;
  };
}
