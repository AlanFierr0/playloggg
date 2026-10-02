import { createServer } from "node:http";

export const fixtureAdminKey = "loopback-only-fixture-admin";
export const fixtureOrigin = "http://127.0.0.1:3101";
const ownerId = "11111111-1111-4111-8111-111111111111";
const user = { id: ownerId, aud: "authenticated", role: "authenticated", email: "owner@fixture.test", email_confirmed_at: "2026-01-01T00:00:00Z", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" };
const token = [Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"), Buffer.from(JSON.stringify({ sub: ownerId, aud: "authenticated", role: "authenticated", exp: 4102444800, iat: 1767225600 })).toString("base64url"), Buffer.from("only-valid-in-local-fixture").toString("base64url")].join(".");
const session = { access_token: token, refresh_token: "local-fixture-refresh", token_type: "bearer", expires_in: 3600, expires_at: 4102444800, user };
export const authCookie = { name: "sb-127-auth-token", value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`, url: "http://127.0.0.1:3100" };
const profiles = [
  { id: 1, handle: "alexvance", display_name: "Unavailable Fixture", is_public: false, is_discoverable:false, owner_user_id: null },
  { id: 2, handle: "fixture_owner", display_name: "Fixture Owner", is_public: false, is_discoverable:false, owner_user_id: ownerId },
  { id: 3, handle: "fixture_public", display_name: "Published Fixture", is_public: true, is_discoverable:true, owner_user_id: null },
];
profiles.push({id:4,handle:"fixture_peer",display_name:"Published Peer",is_public:true,owner_user_id:null});
profiles.push({id:5,handle:"fixture_empty",display_name:"Empty Profile",is_public:true,owner_user_id:null});
const titles = [["hades", "Hades", "Roguelike"], ["elden-ring-shadow-of-the-erdtree", "Elden Ring: Shadow of the Erdtree", "Action RPG"], ...Array.from({ length: 120 }, (_, i) => [`fixture-game-${i}`, `Fixture Game ${String(i).padStart(2, "0")}`, "Adventure"])];
const initialGames = titles.map(([slug, title, genre], index) => ({ id: index + 1, igdb_id: index + 1, slug, title, cover_url: "/icon.svg", release_year: 2020, released_on: "2020-01-01", genres: [genre], artwork_image_ids: [], screenshot_image_ids: [], search_keywords: title.toLowerCase(), igdb_metadata: { platforms: index === 0 ? ["PC (Microsoft Windows)", "Android"] : index === 1 ? ["PlayStation 5", "Xbox Series X|S", "Nintendo Switch 2"] : index === 2 ? ["Dreamcast"] : ["PC"], summary: "Deterministic test catalog entry." }, igdb_url: null }));
let games = structuredClone(initialGames);
let ratings;
let failSave;
let steamMode="public";
let profileDeleted=false;
let steamMinutes=90;
let favorites;
let rankings=[];let curated=[];let listItems=[];let follows=[];let blocks=[];let likes=[];
let pictures = new Map();
// Shared catalog imports persist between tests, like the application cache; personal data resets.
function reset() { user.app_metadata={};steamMode="public";rankings=[];follows=[];blocks=[];likes=[];curated=[{id:10,profile_id:3,name:"Public fixture list",revision:1,description:"Fixture description",is_public:true,is_ranked:true}];listItems=[{list_id:10,game_id:1,position:0}];pictures.clear(); Object.assign(profiles[1], {handle:"fixture_owner",display_name:"Fixture Owner",is_public:false,is_discoverable:false,bio:null,location:null,platform_preference:null,avatar_url:null}); favorites=[{profile_id:3,game_id:1,featured_slot:1,created_at:"2026-09-29T12:00:00Z"}]; ratings = [{ profile_id: 2, game_id: 2, score: 80, tier: "B", status: "playing", review: "Private fixture review", tags: [], hours_played: null, platform: null, completed_on: null }, { profile_id: 1, game_id: 1, score: 90, tier: "A", status: "completed", review: "Sample review", tags: [], hours_played: null, platform: null, completed_on: null }, { profile_id: 3, game_id: 1, score: 0, tier: "S", status: "backlog", review: "Public fixture review", tags: [], hours_played: 0, platform: null, completed_on: null } ];
 for (const game_id of [3,4,5,6]) ratings.push({profile_id:3,game_id,score:50,tier:null,status:"playing",review:null,tags:[],hours_played:null,platform:null,completed_on:null});
 for (const game_id of [1,3,4,5,6]) ratings.push({profile_id:4,game_id,score:game_id===1 ? 10 : 40,tier:"A",status:"completed",review:null,tags:[],hours_played:null,platform:null,completed_on:null});
 ratings.push({profile_id:3,game_id:7,score:null,tier:"S",status:"backlog",review:null,tags:[],hours_played:null,platform:null,completed_on:null});
 ratings.push({profile_id:4,game_id:7,score:0,tier:null,status:"playing",review:null,tags:[],hours_played:null,platform:null,completed_on:null});
 for (const game_id of Array.from({length:19},(_,i)=>i+8)) for (const profile_id of [3,4]) ratings.push({profile_id,game_id,score:profile_id===3 ? 50 : 40,tier:null,status:"playing",review:null,tags:[],hours_played:null,platform:null,completed_on:null});
 ratings.forEach(row=>row.updated_at="2026-09-29T12:00:00Z");
 failSave = false;steamMinutes=90;profileDeleted=false; }
reset();

// Deliberately limited contract double, not an implementation/proof of Supabase RLS.
export async function startFixtureServer() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, fixtureOrigin);
    function reply(status, data) { res.writeHead(status, { "Content-Type": "application/json" }); res.end(data === undefined ? undefined : JSON.stringify(data)); }
    try {
      if (url.pathname === "/__health") return reply(200, { fixture: true });
      if (url.pathname === "/__steam-user" && req.method === "POST") {user.app_metadata={playlogg_steam_id:"76561198000000000"};return reply(200,{ok:true});}
      if (url.pathname === "/__steam-private" && req.method === "POST") {steamMode="private";return reply(200,{ok:true});}
      if (url.pathname === "/__steam-playtime" && req.method === "POST") {steamMinutes=180;return reply(200,{ok:true});}
      if (url.pathname === "/__steam-sync-entry" && req.method === "POST") {Object.assign(ratings.find(row=>row.profile_id===2&&row.game_id===2),{platform:"pc",hours_played:1,tags:["keep"],completed_on:"2026-09-01"});return reply(200,{ok:true});}
      if (url.pathname === "/__steam-library") {
        if(steamMode==="private")return reply(200,{response:{}});
        return reply(200,{response:{game_count:128,games:[{appid:101,name:"Hades",playtime_forever:steamMinutes},{appid:102,name:"Elden Ring",playtime_forever:300},{appid:103,name:"Steam Fixture Adventure",playtime_forever:0},{appid:104,name:"Unmatched Fixture",playtime_forever:45},...Array.from({length:124},(_,index)=>({appid:200+index,name:"ZZZ Fixture "+index,playtime_forever:index===123?6000:0}))]}});
      }
      if (url.pathname === "/__provider-games") {
        let body=""; for await (const part of req) body+=part;
        const candidate={id:9001,name:"Unified Fixture Adventure",slug:"unified-fixture-adventure",first_release_date:1577836800,platforms:[{name:"PC"}],genres:[{name:"Adventure"}]};
        if(body.includes("external_games.uid"))return reply(200,[{id:1,external_games:[{uid:"101",external_game_source:1}]},{id:2,external_games:[{uid:"102",external_game_source:1}]},{id:9004,external_games:[{uid:"103",external_game_source:1}]}]);
        if(body.includes("where id = 9004"))return reply(200,[{...candidate,id:9004,name:"Steam Fixture Adventure",slug:"steam-fixture-adventure"}]);
        const mobileCandidate={...candidate,id:9003,name:"Unified Mobile Adventure",slug:"unified-mobile-adventure"};
        if(body.includes("where id = 9001"))return reply(200,[candidate]);
        if(body.includes("where id = 9003"))return reply(200,[mobileCandidate]);
        if(body.includes('search "Unavailable"'))return reply(503,{message:"Controlled provider failure"});
        if(body.includes('search "Slow"')){await new Promise(resolve=>setTimeout(resolve,1000));return reply(200,[{...candidate,id:9002,name:"Stale Query Candidate"}]);}
        if(body.toLowerCase().includes('search "hades"'))return reply(200,[{...candidate,id:1,name:"Hades"}]);
        if(body.includes('search "Unified Mobile'))return reply(200,[mobileCandidate]);
        if(body.includes('search "Unified'))return reply(200,[candidate]);
        return reply(200,[]);
      }
      if (url.pathname === "/__reset" && req.method === "POST") { reset(); return reply(200, { ok: true }); }
      if (url.pathname === "/__fail-save" && req.method === "POST") { failSave = true; return reply(200, { ok: true }); }
      if (url.pathname === "/__state") return reply(200, { ratings, favorites, games, profiles:profiles.filter(row=>!profileDeleted||row.id!==2) });
      const admin = req.headers.authorization === `Bearer ${fixtureAdminKey}`;
      const authenticated = req.headers.authorization === `Bearer ${token}`;
      if (url.pathname === "/auth/v1/user" && req.method === "GET") return authenticated ? reply(200, user) : reply(401, { message: "Fixture session required" });
      if (url.pathname === "/auth/v1/logout" && req.method === "POST") return authenticated ? reply(200,{}) : reply(401,{message:"Unauthorized"});
      if (url.pathname === "/auth/v1/token" && req.method === "POST") {
        let body=""; for await (const part of req) body+=part; const input=JSON.parse(body);
        return input.email===user.email && input.password==="fixture-password-123" ? reply(200,session) : reply(400,{error_code:"invalid_credentials",msg:"Invalid login credentials"});
      }
      if (["/auth/v1/signup","/auth/v1/recover","/auth/v1/otp"].includes(url.pathname) && req.method === "POST") return reply(200,{});
      if (url.pathname === "/auth/v1/verify" && req.method === "POST") {
        let body=""; for await (const part of req) body+=part; const input=JSON.parse(body);
        return input.token_hash==="fixture-email-link" && input.type==="email" ? reply(200,session) : reply(400,{error_code:"otp_expired",msg:"Invalid or expired link"});
      }
      if (url.pathname === "/auth/v1/user" && req.method === "PUT") return authenticated ? reply(200,user) : reply(401,{message:"Unauthorized"});
      if (url.pathname.startsWith("/storage/v1/object/")) {
        const path=url.pathname.replace(/^\/storage\/v1\/object\/(?:authenticated\/)?profile-pictures\/?/, "");
        if(req.method==="POST") {
          if(!authenticated || !path.startsWith("2/"))return reply(403,{message:"Fixture ownership denied"});
          const parts=[];for await(const part of req)parts.push(part); pictures.set(path,Buffer.concat(parts));return reply(200,{Key:path});
        }
        if(req.method==="DELETE") {
          if(!authenticated&&!admin)return reply(403,{message:"Fixture ownership denied"});
          let body="";for await(const part of req)body+=part;const input=JSON.parse(body);
          for(const key of input.prefixes??[])if(key.startsWith("2/"))pictures.delete(key);
          return reply(200,[]);
        }
        if(req.method==="GET") {
          if(!admin && !authenticated)return reply(403,{message:"Private bucket"});
          const bytes=pictures.get(path);if(!bytes)return reply(404,{message:"Missing picture"});
          res.writeHead(200,{"Content-Type":"image/webp"});return res.end(bytes);
        }
      }
      const resource = url.pathname.replace("/rest/v1/", "");
      if(resource==="games"&&req.method==="POST"){
        if(!admin)return reply(403,{message:"Trusted imports only"});
        let body="";for await(const part of req)body+=part;const input=JSON.parse(body);
        if(!games.some(game=>game.igdb_id===input.igdb_id))games.push({...input,id:Math.max(...games.map(game=>game.id))+1});
        return reply(201,null);
      }
      const visibleProfiles = profiles.filter(profile=>(!profileDeleted||profile.id!==2)&&(admin || profile.is_public || (authenticated && profile.owner_user_id === ownerId)));
      if(resource==="rpc/delete_owned_profile"&&req.method==="POST") {
        let body="";for await(const part of req)body+=part;const input=JSON.parse(body);
        if(!admin||input.p_owner!==ownerId||input.p_handle!==profiles[1].handle||profileDeleted)return reply(403,{message:"Not owned"});
        if(failSave){failSave=false;return reply(503,{message:"Controlled delete failure"});}
        const ids=curated.filter(row=>row.profile_id===2).map(row=>row.id);
        ratings=ratings.filter(row=>row.profile_id!==2);favorites=favorites.filter(row=>row.profile_id!==2);rankings=rankings.filter(row=>row.profile_id!==2);
        curated=curated.filter(row=>row.profile_id!==2);listItems=listItems.filter(row=>!ids.includes(row.list_id));
        follows=follows.filter(row=>row.follower_id!==2&&row.followed_id!==2);blocks=blocks.filter(row=>row.blocker_id!==2&&row.blocked_id!==2);likes=likes.filter(row=>row.profile_id!==2&&!ids.includes(row.list_id));
        profileDeleted=true;return reply(200,{id:2,avatar:profiles[1].avatar_url});
      }
      if (resource === "ratings" && req.method === "PATCH") {
        if(!authenticated || url.searchParams.get("profile_id")!=="eq.2")return reply(403,{message:"Fixture ownership denied"});
        let body="";for await(const part of req)body+=part;const patch=JSON.parse(body);
        if(Object.keys(patch).some(key=>key!=="hours_played"))return reply(400,{message:"Only playtime may be synced"});
        if(failSave){failSave=false;return reply(503,{message:"Controlled save failure"});}
        const matches=ratings.filter(row=>[...url.searchParams].filter(([key])=>key!=="select").every(([key,value])=>value.startsWith("eq.")?String(row[key])===value.slice(3):value==="is.null"&&row[key]===null));
        matches.forEach(row=>Object.assign(row,patch,{updated_at:new Date().toISOString()}));
        return reply(200,matches.map(row=>({game_id:row.game_id})));
      }
      if (resource === "ratings" && req.method === "POST") {
        let body = ""; for await (const part of req) body += part;
        const rating = JSON.parse(body);
        if (!authenticated || rating.profile_id !== 2 || !games.some((game) => game.id === rating.game_id)) return reply(403, { message: "Fixture ownership denied" });
        if (failSave) { failSave = false; return reply(503, { message: "Controlled save failure" }); }
        if(req.headers.prefer?.includes("resolution=ignore-duplicates")&&ratings.some(row=>row.profile_id===rating.profile_id&&row.game_id===rating.game_id))return reply(201,[]);
        ratings = ratings.filter((row) => row.profile_id !== rating.profile_id || row.game_id !== rating.game_id);
        ratings.push({...rating,updated_at:new Date().toISOString()}); return reply(201,url.searchParams.has("select")?[{game_id:rating.game_id}]:undefined);
      }
      if (resource === "profiles" && req.method === "PATCH") {
        if (!admin || url.searchParams.get("id") !== "eq.2" || url.searchParams.get("owner_user_id") !== `eq.${ownerId}`) return reply(403, {message:"Fixture ownership denied"});
        let body=""; for await (const part of req) body+=part;
        const patch=JSON.parse(body);
        if(Object.keys(patch).some(key=>!["handle","display_name","is_public","updated_at","bio","location","platform_preference","avatar_url","is_discoverable"].includes(key))) return reply(400,{message:"Unsupported fixture field"});
        Object.assign(profiles[1],patch);
        const result={id:2,handle:profiles[1].handle,is_public:profiles[1].is_public};
        return reply(200,req.headers.accept?.includes("application/vnd.pgrst.object+json") ? result : [result]);
      }
      if (resource === "rpc/set_profile_favorite" && req.method === "POST") {
        if(!authenticated) return reply(403,{message:"Fixture ownership denied"});
        let body="";for await(const part of req)body+=part;const input=JSON.parse(body);
        const slot=input.p_featured_slot ?? null;
        if(typeof input.p_favorite!=="boolean" || !games.some(g=>g.id===input.p_game_id) || slot!==null && ![1,2,3,4].includes(slot)) return reply(400,{message:"Invalid favorite"});
        if(failSave){failSave=false;return reply(503,{message:"Controlled favorite failure"});}
        if(!input.p_favorite){favorites=favorites.filter(f=>f.profile_id!==2 || f.game_id!==input.p_game_id);return reply(200,null);}
        if(slot!==null) favorites.forEach(f=>{if(f.profile_id===2&&f.featured_slot===slot)f.featured_slot=null;});
        const existing=favorites.find(f=>f.profile_id===2&&f.game_id===input.p_game_id);
        if(existing)existing.featured_slot=slot;else favorites.push({profile_id:2,game_id:input.p_game_id,featured_slot:slot,created_at:new Date().toISOString()});
        return reply(200,null);
      }
      if(resource==="rpc/save_preference_ranking"&&req.method==="POST"){let body="";for await(const part of req)body+=part;const input=JSON.parse(body);if(!authenticated||input.p_ids.some(id=>!ratings.some(row=>row.profile_id===2&&row.game_id===id)))return reply(403,{message:"Not owned"});const existing=rankings.find(row=>row.profile_id===2);if((existing?.revision??null)!==input.p_revision)return reply(409,{code:"40001",message:"Stale ranking"});const row={profile_id:2,game_ids:input.p_ids,revision:(existing?.revision??0)+1};rankings=[row];return reply(200,row.revision);}
      if(resource==="rpc/save_curated_list_v2"&&req.method==="POST"){let body="";for await(const part of req)body+=part;const input=JSON.parse(body);if(!authenticated||input.p_profile_id!==2)return reply(403,{message:"Not owned"});const existing=curated.find(row=>row.id===input.p_list_id);if(existing&&existing.revision!==input.p_expected_revision)return reply(409,{code:"40001",message:"Stale list"});const row={id:existing?.id??11,profile_id:2,name:input.p_name,description:input.p_description,is_public:input.p_public,is_ranked:input.p_ranked,revision:(existing?.revision??0)+1};curated=curated.filter(item=>item.id!==row.id);curated.push(row);listItems=listItems.filter(item=>item.list_id!==row.id);input.p_game_ids.forEach((game_id,position)=>listItems.push({list_id:row.id,game_id,position}));return reply(200,row);}
      if(["profile_follows","profile_blocks","list_likes"].includes(resource)&&["POST","DELETE"].includes(req.method)){if(!authenticated)return reply(403,{message:"Not owned"});let rows=resource==="profile_follows"?follows:resource==="profile_blocks"?blocks:likes;if(req.method==="POST"){let body="";for await(const part of req)body+=part;rows.push(JSON.parse(body));}else rows=rows.filter(row=>![...url.searchParams].every(([key,value])=>String(row[key])===value.slice(3)));if(resource==="profile_follows")follows=rows;else if(resource==="profile_blocks")blocks=rows;else likes=rows;return reply(200,null);}
      if(resource==="rpc/public_list_like_counts")return reply(200,[]);
      if (req.method !== "GET") return reply(405, { message: "Unsupported fixture mutation" });
      let rows;
      if (resource === "games") rows = games;
      else if (resource === "profiles") rows = visibleProfiles;
      else if (resource === "ratings") rows = ratings.filter((rating) => visibleProfiles.some((profile) => profile.id === rating.profile_id));
      else if (resource === "profile_favorites") rows = favorites.filter(f=>visibleProfiles.some(p=>p.id===f.profile_id)).map(f=>({...f,games:{slug:games.find(g=>g.id===f.game_id).slug}}));
      else if (resource === "curated_lists") rows = curated.filter(row=>row.profile_id===2?authenticated:(row.is_public&&visibleProfiles.some(profile=>profile.id===row.profile_id)));
      else if (resource === "curated_list_items") rows = listItems;
      else if(resource==="profile_rankings")rows=rankings.filter(row=>visibleProfiles.some(profile=>profile.id===row.profile_id));
      else if(resource==="profile_follows")rows=authenticated?follows:[];
      else if(resource==="profile_blocks")rows=authenticated?blocks:[];
      else if(resource==="list_likes")rows=authenticated?likes:[];
      else if(resource==="profile_activity")rows=[];
      else return reply(404, { message: `Unsupported fixture endpoint ${url.pathname}` });
      if(url.searchParams.get("select")?.includes("profiles!inner"))rows=rows.map(row=>({...row,profiles:profiles.find(profile=>profile.id===row.profile_id),curated_list_items:listItems.filter(item=>item.list_id===row.id)}));
      for (const [key, value] of url.searchParams) {
        if (key === "or") {
          const alternatives = value.slice(1,-1).split(",");
          rows = rows.filter(row => alternatives.some(term => { const [field,operator,...parts] = term.split("."); const needle = parts.join(".").replace(/^%|%$/g, "").replace(/\\_/g, "_").toLowerCase(); return operator === "ilike" && String(row[field] ?? "").toLowerCase().includes(needle); }));
        } else if(value.startsWith("not.in.(")){const excluded=value.slice(8,-1).split(",");rows=rows.filter(row=>!excluded.includes(String(row[key])));
        } else if (value.startsWith("eq.")) {
          const expected = value.slice(3);
          if (key.startsWith("profiles.")) rows = rows.filter((row) => visibleProfiles.some((profile) => profile.id === row.profile_id && String(profile[key.slice(9)]) === expected));
          else rows = rows.filter((row) => String(row[key]) === expected);
        } else if(value.startsWith("in.(")){const expected=value.slice(4,-1).split(",");rows=rows.filter(row=>expected.includes(String(row[key])));}

      }
      rows = rows.slice(Number(url.searchParams.get("offset") || 0), Number(url.searchParams.get("offset") || 0) + Number(url.searchParams.get("limit") || 500));
      if (req.headers.accept?.includes("application/vnd.pgrst.object+json")) return rows.length === 1 ? reply(200, rows[0]) : reply(406, { code: "PGRST116", details: `The result contains ${rows.length} rows`, message: "JSON object requested, multiple (or no) rows returned" });
      return reply(200, rows);
    } catch { return reply(500, { message: "Fixture handler failed" }); }
  });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(3101, "127.0.0.1", resolve); });
  return server;
}
