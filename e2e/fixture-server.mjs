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
let ratingsDelay = 0;
let failSave;
let showTrending=false;
let steamMode="public";
let requestCounts={};
let quotaMode="allow";
let accountDeleted=false;let failAuthDelete=false;let failStorageDelete=false;
let profileDeleted=false;
let steamMinutes=90;
let favorites;
let rankings=[];let curated=[];let listItems=[];let follows=[];let blocks=[];let likes=[];
let pictures = new Map();
// Shared catalog imports persist between tests, like the application cache; personal data resets.
function reset() { ratingsDelay=0; showTrending=false; accountDeleted=false;failAuthDelete=false;failStorageDelete=false; quotaMode="allow";user.app_metadata={};steamMode="public";rankings=[];follows=[];blocks=[];likes=[];curated=[{id:10,profile_id:3,name:"Public fixture list",revision:1,description:"Fixture description",is_public:true,is_ranked:true}];listItems=[{list_id:10,game_id:1,position:0}];pictures.clear(); Object.assign(profiles[1], {handle:"fixture_owner",display_name:"Fixture Owner",is_public:false,is_discoverable:false,bio:null,location:null,platform_preference:null,avatar_url:null}); favorites=[{profile_id:3,game_id:1,featured_slot:1,created_at:"2026-09-29T12:00:00Z"}]; ratings = [{ profile_id: 2, game_id: 2, score: 80, tier: "B", status: "playing", review: "Private fixture review", tags: [], hours_played: null, platform: null, completed_on: null }, { profile_id: 1, game_id: 1, score: 90, tier: "A", status: "completed", review: "Sample review", tags: [], hours_played: null, platform: null, completed_on: null }, { profile_id: 3, game_id: 1, score: 0, tier: "S", status: "backlog", review: "Public fixture review", tags: [], hours_played: 0, platform: null, completed_on: null } ];
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
      if(url.pathname==="/__slow-ratings" && req.method==="POST"){ratingsDelay=4000;return reply(200,{ok:true});}
      if(url.pathname==="/__reset-request-counts"){requestCounts={};return reply(200,{ok:true});}
      if(!url.pathname.startsWith("/__") || ["/__provider-games","/__steam-library"].includes(url.pathname)){const key=`${req.method} ${url.pathname}`;requestCounts[key]=(requestCounts[key]??0)+1;}
      if(url.pathname==="/__quota-partial-imports"&&req.method==="POST"){quotaMode="partial";games=games.filter(game=>![9005,9006].includes(game.igdb_id));return reply(200,{ok:true});}
      if (url.pathname === "/__quota-denied" && req.method === "POST") {quotaMode="deny";return reply(200,{ok:true});}
      if (url.pathname === "/__quota-unavailable" && req.method === "POST") {quotaMode="unavailable";return reply(200,{ok:true});}
      if (url.pathname === "/__quota-allow" && req.method === "POST") {quotaMode="allow";return reply(200,{ok:true});}
      if (url.pathname === "/__platform-scores" && req.method === "POST") {
        ratings = ratings.filter(row => ![1,2,3,4].includes(row.game_id));
        for (let profile_id = 1; profile_id <= 5; profile_id++) for (const game_id of [1,2,3,4]) {
          ratings.push({profile_id, game_id, score: game_id === 1 ? (profile_id-1)*25 : game_id === 2 ? 80 : game_id === 3 ? (profile_id === 5 ? null : 100) : 0, tier:null,status:null,review:null,tags:[],platform:null,hours_played:null,completed_on:null});
        }
        return reply(200,{ok:true});
      }
      if (url.pathname === "/__ranking-scroll" && req.method === "POST") {
        ratings = ratings.filter(row => row.profile_id !== 3);
        ratings.push(...games.slice(0, 20).map((game, index) => ({profile_id:3,game_id:game.id,score:100-index,tier:null,status:null,review:null,tags:[],hours_played:null,platform:null,completed_on:null})));
        return reply(200,{ok:true});
      }
      if (url.pathname === "/__trending" && req.method === "POST") {showTrending=true;return reply(200,{ok:true});}
      if (url.pathname === "/__health") return reply(200, { fixture: true });
      if (url.pathname === "/__steam-user" && req.method === "POST") {user.app_metadata={playlogg_steam_id:"76561198000000000"};return reply(200,{ok:true});}
      if (url.pathname === "/__steam-private" && req.method === "POST") {steamMode="private";return reply(200,{ok:true});}
      if (url.pathname === "/__steam-playtime" && req.method === "POST") {steamMinutes=180;return reply(200,{ok:true});}
      if (url.pathname === "/__steam-sync-entry" && req.method === "POST") {Object.assign(ratings.find(row=>row.profile_id===2&&row.game_id===2),{platform:"pc",hours_played:1,tags:["keep"],completed_on:"2026-09-01"});return reply(200,{ok:true});}
      if (url.pathname === "/__steam-reviews") {
        if(url.searchParams.get("appId")==="103")return reply(503,{success:0});
        return reply(200,{success:1,query_summary:{review_score_desc:"Mostly Positive",total_positive:80,total_reviews:100}});
      }
      if (url.pathname === "/__steam-library") {
        if(steamMode==="private")return reply(200,{response:{}});
        return reply(200,{response:{game_count:128,games:[{appid:101,name:"Hades",playtime_forever:steamMinutes},{appid:102,name:"Elden Ring",playtime_forever:300},{appid:103,name:"Steam Fixture Adventure",playtime_forever:0},{appid:104,name:"Unmatched Fixture",playtime_forever:45},...Array.from({length:124},(_,index)=>({appid:200+index,name:"ZZZ Fixture "+index,playtime_forever:index===123?6000:0}))]}});
      }
      if (url.pathname === "/__provider-games") {
        let body=""; for await (const part of req) body+=part;
        const candidate={id:9001,name:"Unified Fixture Adventure",slug:"unified-fixture-adventure",first_release_date:1577836800,platforms:[{name:"PC"}],genres:[{name:"Adventure"}]};
        if(body.includes("external_games.uid"))return reply(200,[{...candidate,id:1,name:"Hades",slug:"hades",genres:[{name:"RPG"}],external_games:[{uid:"101",external_game_source:1}]},{id:2,external_games:[{uid:"102",external_game_source:1}]},{...candidate,id:9004,name:"Steam Fixture Adventure",slug:"steam-fixture-adventure",genres:[{name:"Adventure"}],external_games:[{uid:"103",external_game_source:1}]},...Array.from({length:2},(_,index)=>({...candidate,id:9005+index,name:"ZZZ Fixture "+index,slug:"zzz-fixture-"+index,external_games:[{uid:String(200+index),external_game_source:1}]}))]);
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
      if (url.pathname === "/__state") return reply(200, { requestCounts, accountDeleted, pictures:[...pictures.keys()], ratings, favorites, games, profiles:profiles.filter(row=>!profileDeleted||row.id!==2) });
      if(url.pathname==="/__fail-auth-delete"&&req.method==="POST"){failAuthDelete=true;return reply(200,{ok:true});}
      if(url.pathname==="/__fail-storage-delete"&&req.method==="POST"){failStorageDelete=true;return reply(200,{ok:true});}
      if(url.pathname==="/__profileless"&&req.method==="POST"){profileDeleted=true;return reply(200,{ok:true});}
      if(url.pathname==="/__deletion-pictures"&&req.method==="POST"){pictures.set("2/11111111-1111-4111-8111-111111111111.webp",Buffer.from("own"));pictures.set("3/22222222-2222-4222-8222-222222222222.webp",Buffer.from("other"));return reply(200,{ok:true});}
      const admin = req.headers.authorization === `Bearer ${fixtureAdminKey}`;
      const authenticated = !accountDeleted && req.headers.authorization === `Bearer ${token}`;
      if(url.pathname===`/auth/v1/admin/users/${ownerId}`&&req.method==="DELETE"){if(!admin)return reply(403,{message:"Server only"});if(failAuthDelete){failAuthDelete=false;return reply(503,{message:"Controlled auth failure"});}if(!profileDeleted||[...pictures.keys()].some(path=>path.startsWith("2/")))return reply(409,{message:"Owned data remains"});accountDeleted=true;return reply(200,user);}
      if (url.pathname === "/auth/v1/user" && req.method === "GET") return authenticated ? reply(200, user) : reply(401, { message: "Fixture session required" });
      if (url.pathname === "/auth/v1/logout" && req.method === "POST") return authenticated ? reply(200,{}) : reply(401,{message:"Unauthorized"});
      if (url.pathname === "/auth/v1/token" && req.method === "POST") {
        let body=""; for await (const part of req) body+=part; const input=JSON.parse(body);
        return !accountDeleted && input.email===user.email && input.password==="fixture-password-123" ? reply(200,session) : reply(400,{error_code:"invalid_credentials",msg:"Invalid login credentials"});
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
          if(failStorageDelete){failStorageDelete=false;return reply(503,{message:"Controlled storage failure"});}
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
      if(resource==="ratings" && req.method==="GET" && ratingsDelay) await new Promise(resolve=>setTimeout(resolve,ratingsDelay));
      if(resource==="games"&&req.method==="POST"){
        if(!admin)return reply(403,{message:"Trusted imports only"});
        let body="";for await(const part of req)body+=part;const input=JSON.parse(body);
        const created=[];
        for(const game of Array.isArray(input)?input:[input])if(!games.some(row=>row.igdb_id===game.igdb_id)){const row={...game,id:Math.max(...games.map(game=>game.id))+1};games.push(row);created.push(row);}
        return reply(201,url.searchParams.has("select")?created:null);
      }
      const visibleProfiles = profiles.filter(profile=>(!profileDeleted||profile.id!==2)&&(admin || profile.is_public || (authenticated && profile.owner_user_id === ownerId)));
      if(resource==="rpc/platform_game_scores") {
        if(!admin)return reply(403,{message:"Server only"});
        const groups=new Map();
        for(const row of ratings) if(row.score!==null) {
          const group=groups.get(row.game_id)??[];group.push(row.score);groups.set(row.game_id,group);
        }
        const rows=[...groups].flatMap(([id,scores])=>scores.length>0 ? [{slug:games.find(game=>game.id===id).slug,average:scores.reduce((sum,value)=>sum+value,0)/scores.length,sample_count:scores.length}] : []).sort((a,b)=>a.slug.localeCompare(b.slug));
        return reply(200,rows.slice(Number(url.searchParams.get("offset")??0),Number(url.searchParams.get("offset")??0)+Number(url.searchParams.get("limit")??1000)));
      }
      if(resource==="rpc/community_trending_games")return reply(200,showTrending?[{game_id:1,sample_count:2},{game_id:2,sample_count:1}]:[]);
      if(resource==="rpc/community_game_scores"){
        let body="";for await(const part of req)body+=part;const input=body ? JSON.parse(body) : {};
        const groups=new Map();
        for(const row of ratings){const profile=profiles.find(p=>p.id===row.profile_id);if(!profile?.is_public||!profile.is_discoverable||row.score==null||(input.p_ids&&!input.p_ids.includes(row.game_id)))continue;const values=groups.get(row.game_id)??[];values.push(row.score);groups.set(row.game_id,values);}
        return reply(200,[...groups].filter(([,values])=>values.length>=Number(url.searchParams.get("sample_count")?.replace("gte.","")??1)).map(([game_id,values])=>{const average=values.reduce((a,b)=>a+b,0)/values.length;return {game_id,sample_count:values.length,average:Math.round(average*10)/10,deviation:Math.sqrt(values.reduce((sum,value)=>sum+(value-average)**2,0)/values.length)};}));
      }
      if(resource==="rpc/consume_operation_limit_batch"&&req.method==="POST"){
        if(!admin)return reply(403,{message:"Server only"});
        let body="";for await(const part of req)body+=part;const input=JSON.parse(body);
        if(!Number.isInteger(input.p_count)||input.p_count<1||input.p_count>25)return reply(400,{message:"Invalid quota"});
        return quotaMode==="unavailable" ? reply(503,{message:"Unavailable"}) : reply(200,[{allowed_count:quotaMode==="deny" ? 0 : quotaMode==="partial" ? Math.min(1,input.p_count) : input.p_count,retry_after:quotaMode==="deny" || quotaMode==="partial"&&input.p_count>1 ? 60 : 0}]);
      }
      if(resource==="rpc/consume_operation_limit"&&req.method==="POST") {
        if(req.headers.authorization!==`Bearer ${fixtureAdminKey}`)return reply(403,{message:"Server only"});
        return quotaMode==="unavailable" ? reply(503,{message:"Unavailable"}) : reply(200,quotaMode==="deny" ? 60 : 0);
      }
      if(resource==="rpc/account_deletion_objects"&&req.method==="POST"){
        let body="";for await(const part of req)body+=part;const input=JSON.parse(body);
        if(!admin||input.p_owner!==ownerId)return reply(403,{message:"Server only"});
        return reply(200,[...pictures.keys()].filter(path=>path.startsWith("2/")).map(object_name=>({bucket_id:"profile-pictures",object_name})));
      }
      if(resource==="rpc/clear_account_operation_limits"&&req.method==="POST"){
        let body="";for await(const part of req)body+=part;const input=JSON.parse(body);
        return admin&&input.p_owner===ownerId&&profileDeleted ? reply(200,null) : reply(403,{message:"Remove profile first"});
      }
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
        if(Object.keys(patch).some(key=>!["hours_played","status","platform","tier","score","updated_at"].includes(key)))return reply(400,{message:"Unsupported entry fields"});
        if(failSave){failSave=false;return reply(503,{message:"Controlled save failure"});}
        const matches=ratings.filter(row=>[...url.searchParams].filter(([key])=>key!=="select").every(([key,value])=>value.startsWith("eq.")?String(row[key])===value.slice(3):value.startsWith("in.(")?value.slice(4,-1).split(",").includes(String(row[key])):value==="is.null"&&row[key]===null));
        matches.forEach(row=>Object.assign(row,patch,{updated_at:new Date().toISOString()}));
        return reply(200,matches.map(row=>({game_id:row.game_id})));
      }
      if (resource === "ratings" && req.method === "POST") {
        let body = ""; for await (const part of req) body += part;
        const input = JSON.parse(body);
        const rows=Array.isArray(input)?input:[input];
        if (!authenticated || rows.some(rating=>rating.profile_id !== 2 || !games.some(game=>game.id===rating.game_id))) return reply(403, { message: "Fixture ownership denied" });
        if (failSave) { failSave = false; return reply(503, { message: "Controlled save failure" }); }
        const saved=[];
        for(const rating of rows){
          if(req.headers.prefer?.includes("resolution=ignore-duplicates")&&ratings.some(row=>row.profile_id===rating.profile_id&&row.game_id===rating.game_id))continue;
          ratings=ratings.filter(row=>row.profile_id!==rating.profile_id||row.game_id!==rating.game_id);
          const row={...rating,updated_at:new Date().toISOString()};ratings.push(row);saved.push(row);
        }
        return reply(201,url.searchParams.has("select")?saved.map(row=>({game_id:row.game_id,updated_at:row.updated_at})):undefined);
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
      if(resource==="rpc/save_preference_ranking"&&req.method==="POST"){let body="";for await(const part of req)body+=part;const input=JSON.parse(body);if(!authenticated||input.p_ids.some(id=>!ratings.some(row=>row.profile_id===2&&row.game_id===id)))return reply(403,{message:"Not owned"});if(failSave){failSave=false;return reply(503,{message:"Controlled ranking save failure"});}const existing=rankings.find(row=>row.profile_id===2);if((existing?.revision??null)!==input.p_revision)return reply(409,{code:"40001",message:"Stale ranking"});const row={profile_id:2,game_ids:input.p_ids,revision:(existing?.revision??0)+1};rankings=[row];return reply(200,row.revision);}
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
