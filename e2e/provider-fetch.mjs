// Loaded only by the isolated Playwright server, never by application builds.
const realFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = String(input instanceof Request ? input.url : input);
  if (url.startsWith("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/")) return realFetch("http://127.0.0.1:3101/__steam-library", {method:"GET"});
  if (url === "https://id.twitch.tv/oauth2/token") return Promise.resolve(Response.json({ access_token: "fixture-provider-token", expires_in: 3600 }));
  if (url === "https://api.igdb.com/v4/games") return realFetch("http://127.0.0.1:3101/__provider-games", { ...init, headers: { "content-type": "text/plain" } });
  return realFetch(input, init);
};
