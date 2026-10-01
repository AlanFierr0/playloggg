import { createServer } from "node:http";

export const fixtureAdminKey = "loopback-only-fixture-admin";
export const fixtureOrigin = "http://127.0.0.1:3101";
const ownerId = "11111111-1111-4111-8111-111111111111";
const user = { id: ownerId, aud: "authenticated", role: "authenticated", email: "owner@fixture.invalid", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" };
const token = [Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"), Buffer.from(JSON.stringify({ sub: ownerId, aud: "authenticated", role: "authenticated", exp: 4102444800, iat: 1767225600 })).toString("base64url"), Buffer.from("only-valid-in-local-fixture").toString("base64url")].join(".");
const session = { access_token: token, refresh_token: "local-fixture-refresh", token_type: "bearer", expires_in: 3600, expires_at: 4102444800, user };
export const authCookie = { name: "sb-127-auth-token", value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`, url: "http://127.0.0.1:3100" };
const profiles = [
  { id: 1, handle: "alexvance", display_name: "Sample Player", is_sample: true, is_public: true, owner_user_id: null },
  { id: 2, handle: "fixture_owner", display_name: "Fixture Owner", is_sample: false, is_public: false, owner_user_id: ownerId },
  { id: 3, handle: "fixture_public", display_name: "Published Fixture", is_sample: false, is_public: true, owner_user_id: null },
];
profiles.push({id:4,handle:"fixture_peer",display_name:"Published Peer",is_sample:false,is_public:true,owner_user_id:null});
profiles.push({id:5,handle:"fixture_empty",display_name:"Empty Profile",is_sample:false,is_public:true,owner_user_id:null});
const titles = [["hades", "Hades", "Roguelike"], ["elden-ring-shadow-of-the-erdtree", "Elden Ring: Shadow of the Erdtree", "Action RPG"], ...Array.from({ length: 24 }, (_, i) => [`fixture-game-${i}`, `Fixture Game ${String(i).padStart(2, "0")}`, "Adventure"])];
const games = titles.map(([slug, title, genre], index) => ({ id: index + 1, slug, title, cover_url: "/icon.svg", release_year: 2020, released_on: "2020-01-01", genres: [genre], artwork_image_ids: [], screenshot_image_ids: [], search_keywords: title.toLowerCase(), is_sample: index === 1, igdb_metadata: { platforms: ["PC"], summary: "Deterministic test catalog entry." }, igdb_url: null }));
let ratings;
let failSave;
function reset() { Object.assign(profiles[1], {handle:"fixture_owner",display_name:"Fixture Owner",is_public:false}); ratings = [{ profile_id: 2, game_id: 2, score: 80, tier: "B", status: "playing", review: "Private fixture review", tags: [], hours_played: null, platform: null, completed_on: null }, { profile_id: 1, game_id: 1, score: 90, tier: "A", status: "completed", review: "Sample review", tags: [], hours_played: null, platform: null, completed_on: null }, { profile_id: 3, game_id: 1, score: 0, tier: "S", status: "backlog", review: "Public fixture review", tags: [], hours_played: 0, platform: null, completed_on: null } ];
 for (const game_id of [3,4,5,6]) ratings.push({profile_id:3,game_id,score:50,tier:null,status:"playing",review:null,tags:[],hours_played:null,platform:null,completed_on:null});
 for (const game_id of [1,3,4,5,6]) ratings.push({profile_id:4,game_id,score:game_id===1 ? 10 : 40,tier:"A",status:"completed",review:null,tags:[],hours_played:null,platform:null,completed_on:null});
 ratings.push({profile_id:3,game_id:7,score:null,tier:"S",status:"backlog",review:null,tags:[],hours_played:null,platform:null,completed_on:null});
 ratings.push({profile_id:4,game_id:7,score:0,tier:null,status:"playing",review:null,tags:[],hours_played:null,platform:null,completed_on:null});
 for (const game_id of Array.from({length:19},(_,i)=>i+8)) for (const profile_id of [3,4]) ratings.push({profile_id,game_id,score:profile_id===3 ? 50 : 40,tier:null,status:"playing",review:null,tags:[],hours_played:null,platform:null,completed_on:null});
 failSave = false; }
reset();

// Deliberately limited contract double, not an implementation/proof of Supabase RLS.
export async function startFixtureServer() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, fixtureOrigin);
    function reply(status, data) { res.writeHead(status, { "Content-Type": "application/json" }); res.end(data === undefined ? undefined : JSON.stringify(data)); }
    try {
      if (url.pathname === "/__health") return reply(200, { fixture: true });
      if (url.pathname === "/__reset" && req.method === "POST") { reset(); return reply(200, { ok: true }); }
      if (url.pathname === "/__fail-save" && req.method === "POST") { failSave = true; return reply(200, { ok: true }); }
      if (url.pathname === "/__state") return reply(200, { ratings });
      const admin = req.headers.authorization === `Bearer ${fixtureAdminKey}`;
      const authenticated = req.headers.authorization === `Bearer ${token}`;
      if (url.pathname === "/auth/v1/user") return authenticated ? reply(200, user) : reply(401, { message: "Fixture session required" });
      const resource = url.pathname.replace("/rest/v1/", "");
      const visibleProfiles = profiles.filter((profile) => profile.is_public || (authenticated && profile.owner_user_id === ownerId));
      if (resource === "ratings" && req.method === "POST") {
        let body = ""; for await (const part of req) body += part;
        const rating = JSON.parse(body);
        if (!authenticated || rating.profile_id !== 2 || !games.some((game) => game.id === rating.game_id)) return reply(403, { message: "Fixture ownership denied" });
        if (failSave) { failSave = false; return reply(503, { message: "Controlled save failure" }); }
        ratings = ratings.filter((row) => row.profile_id !== rating.profile_id || row.game_id !== rating.game_id);
        ratings.push(rating); return reply(201);
      }
      if (resource === "profiles" && req.method === "PATCH") {
        if (!admin || url.searchParams.get("id") !== "eq.2" || url.searchParams.get("owner_user_id") !== `eq.${ownerId}` || url.searchParams.get("is_sample") !== "eq.false") return reply(403, {message:"Fixture ownership denied"});
        let body=""; for await (const part of req) body+=part;
        const patch=JSON.parse(body);
        if(Object.keys(patch).some(key=>!["handle","display_name","is_public","updated_at"].includes(key))) return reply(400,{message:"Unsupported fixture field"});
        Object.assign(profiles[1],patch);
        const result={handle:profiles[1].handle,is_public:profiles[1].is_public};
        return reply(200,req.headers.accept?.includes("application/vnd.pgrst.object+json") ? result : [result]);
      }
      if (req.method !== "GET") return reply(405, { message: "Unsupported fixture mutation" });
      let rows;
      if (resource === "games") rows = games;
      else if (resource === "profiles") rows = visibleProfiles;
      else if (resource === "ratings") rows = ratings.filter((rating) => visibleProfiles.some((profile) => profile.id === rating.profile_id));
      else if (resource === "curated_lists") rows = [{ id: 10, profile_id: 3, name: "Public fixture list", revision: 1 }];
      else if (resource === "curated_list_items") rows = [{ list_id: 10, game_id: 1, position: 0 }];
      else return reply(404, { message: `Unsupported fixture endpoint ${url.pathname}` });
      for (const [key, value] of url.searchParams) {
        if (value.startsWith("eq.")) {
          const expected = value.slice(3);
          if (key === "profiles.handle") rows = rows.filter((row) => visibleProfiles.some((profile) => profile.id === row.profile_id && profile.handle === expected));
          else rows = rows.filter((row) => String(row[key]) === expected);
        }
      }
      rows = rows.slice(Number(url.searchParams.get("offset") || 0), Number(url.searchParams.get("offset") || 0) + Number(url.searchParams.get("limit") || 500));
      if (req.headers.accept?.includes("application/vnd.pgrst.object+json")) return rows.length === 1 ? reply(200, rows[0]) : reply(406, { code: "PGRST116", details: `The result contains ${rows.length} rows`, message: "JSON object requested, multiple (or no) rows returned" });
      return reply(200, rows);
    } catch { return reply(500, { message: "Fixture handler failed" }); }
  });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(3101, "127.0.0.1", resolve); });
  return server;
}
