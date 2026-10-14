import { tasteNeighbors, tasteRecommendations } from "../src/lib/community-stats.ts";
import { gamesPage } from "../src/lib/games-page.ts";
import { createHash } from "node:crypto";
import { defaultTierRanges, tierForScore, parseTierRanges } from "../src/lib/tier-ranges.ts";
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
const initialGames = titles.map(([slug, title, genre], index) => ({ id: index + 1, igdb_id: index + 1, slug, title, cover_url: "/icon.svg", release_year: 2020, released_on: "2020-01-01", genres: [genre], artwork_image_ids: [], screenshot_image_ids: [], search_keywords: title.toLowerCase(), igdb_metadata: { publishers: index === 0 ? ["Fixture Publisher"] : [], developers: index === 0 ? [{ name: "Fixture Studio" }, null, 7] : [], platforms: index === 0 ? ["PC (Microsoft Windows)", "Android"] : index === 1 ? ["PlayStation 5", "Xbox Series X|S", "Nintendo Switch 2"] : index === 2 ? ["Dreamcast"] : ["PC"], summary: "Deterministic test catalog entry." }, igdb_url: null }));
let alternateToken;
let games = structuredClone(initialGames);
let ratings;
let catalogBatches=[];let reviewTranslations=[];let translateCalls=0;let translatedCharacters=0;let failTranslation=false;
let reviewVotes;
let ratingsDelay = 0;
let failSave;
let rankingDelay=0;let failHome=false;let failScore=false;
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
function reset() {reviewTranslations=[];translateCalls=0;translatedCharacters=0;failTranslation=false;for(let i=profiles.length-1;i>=0;i--)if(profiles[i].id>=1000)profiles.splice(i,1);catalogBatches=[];rankingDelay=0;failHome=false;failScore=false; alternateToken=undefined; reviewVotes=[]; ratingsDelay=0; showTrending=false; accountDeleted=false;failAuthDelete=false;failStorageDelete=false; quotaMode="allow";user.app_metadata={};steamMode="public";rankings=[];follows=[];blocks=[];likes=[];curated=[{id:10,profile_id:3,name:"Public fixture list",revision:1,description:"Fixture description",is_public:true,is_ranked:true}];listItems=[{list_id:10,game_id:1,position:0}];pictures.clear(); Object.assign(profiles[1], {handle:"fixture_owner",display_name:"Fixture Owner",is_public:false,is_discoverable:false,bio:null,location:null,platform_preference:null,avatar_url:null}); favorites=[{profile_id:3,game_id:1,featured_slot:1,created_at:"2026-09-29T12:00:00Z"}]; ratings = [{ profile_id: 2, game_id: 2, score: 80, tier: "B", status: "playing", review: "Private fixture review", tags: [], hours_played: null, platform: null, completed_on: null }, { profile_id: 1, game_id: 1, score: 90, tier: "A", status: "completed", review: "Sample review", tags: [], hours_played: null, platform: null, completed_on: null }, { profile_id: 3, game_id: 1, score: 0, tier: "S", status: "backlog", review: "Public fixture review", tags: [], hours_played: 0, platform: null, completed_on: null } ];
 for (const game_id of [3,4,5,6]) ratings.push({profile_id:3,game_id,score:50,tier:null,status:"playing",review:null,tags:[],hours_played:null,platform:null,completed_on:null});
 for (const game_id of [1,3,4,5,6]) ratings.push({profile_id:4,game_id,score:game_id===1 ? 10 : 40,tier:"A",status:"completed",review:null,tags:[],hours_played:null,platform:null,completed_on:null});
 ratings.push({profile_id:3,game_id:7,score:null,tier:"S",status:"backlog",review:null,tags:[],hours_played:null,platform:null,completed_on:null});
 ratings.push({profile_id:4,game_id:7,score:0,tier:null,status:"playing",review:null,tags:[],hours_played:null,platform:null,completed_on:null});
 for (const game_id of Array.from({length:19},(_,i)=>i+8)) for (const profile_id of [3,4]) ratings.push({profile_id,game_id,score:profile_id===3 ? 50 : 40,tier:null,status:"playing",review:null,tags:[],hours_played:null,platform:null,completed_on:null});
 profiles.forEach(p=>p.tier_ranges=structuredClone(defaultTierRanges));
 ratings.forEach(row=>{row.updated_at="2026-09-29T12:00:00Z";row.review_updated_at=row.review?.trim()?row.updated_at:null;row.tier_manual=Boolean(row.tier);if(!row.tier_manual)row.tier=tierForScore(row.score);});
 failSave = false;steamMinutes=90;profileDeleted=false; }
reset();

// Deliberately limited contract double, not an implementation/proof of Supabase RLS.
export async function startFixtureServer() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, fixtureOrigin);
    function reply(status, data) { res.writeHead(status, { "Content-Type": "application/json" }); res.end(data === undefined ? undefined : JSON.stringify(data)); }
    try {
      if(url.pathname==="/__tier-drag-board"){
        ratings=ratings.filter(r=>r.profile_id!==2);
        for(let i=1;i<=16;i++)ratings.push({profile_id:2,game_id:i,score:i<=8?93:90,tier:i<=8?"S":"A",tier_manual:true,status:null,review:null,review_updated_at:null,tags:[],hours_played:null,platform:null,completed_on:null,updated_at:"2026-09-29T12:00:00Z"});
        return reply(200,{ok:true});
      }
      if(url.pathname==="/__ranking-delay"){rankingDelay=600;return reply(200,{ok:true});}
      if(url.pathname==="/__community-failure"){failScore=true;return reply(200,{ok:true});}
      if(url.pathname==="/__home-failure"){failHome=true;return reply(200,{ok:true});}
      if(url.pathname==="/__ranking-edit"){
        ratings=ratings.filter(r=>r.profile_id!==2);
        for(const game_id of [1,2,3])ratings.push({profile_id:2,game_id,score:100-game_id*10,tier:null,tier_manual:false,status:null,review:null,tags:[],hours_played:null,platform:null,completed_on:null,updated_at:"2026-09-29T12:00:00Z"});
        return reply(200,{ok:true});
      }
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
      if (["/__ranking-scroll", "/__owner-ranking-scroll"].includes(url.pathname) && req.method === "POST") {
        const profileId = url.pathname === "/__owner-ranking-scroll" ? 2 : 3;
        ratings = ratings.filter(row => row.profile_id !== profileId);
        ratings.push(...games.slice(0, 20).map((game, index) => ({profile_id:profileId,game_id:game.id,score:100-index,tier:null,status:null,review:null,tags:[],hours_played:null,platform:null,completed_on:null})));
        return reply(200,{ok:true});
      }
      if(url.pathname==="/__review-dates"){
        ratings.find(r=>r.profile_id===3&&r.game_id===1).review_updated_at="2020-01-01T00:00:00Z";
        Object.assign(ratings.find(r=>r.profile_id===3&&r.game_id===3),{review:"Recent review",review_updated_at:"2025-01-01T00:00:00Z",updated_at:"2025-01-01T00:00:00Z"});
        reviewVotes.push({reviewer_profile_id:3,game_id:1,voter_profile_id:2,value:1});return reply(200,{ok:true});
      }
      if(url.pathname==="/__many-profiles"){
        for(let i=0;i<30;i++)profiles.push({id:1200+i,handle:`directory_${String(i).padStart(2,"0")}`,display_name:`Directory Player ${i}`,is_public:true,is_discoverable:true,owner_user_id:null});
        return reply(200,{ok:true});
      }
      if(url.pathname==="/__game-reviews"&&req.method==="POST"){
        for(let i=0;i<30;i++){
          profiles.push({id:1000+i,handle:`reviewer_${i}`,display_name:`Game Reviewer ${i}`,is_public:true,is_discoverable:true,owner_user_id:null,avatar_url:null});
          ratings.push({profile_id:1000+i,game_id:1,score:80,review:`Community review ${i}`,updated_at:"2026-10-01T00:00:00Z"});
        }
        for(const [id,is_public,is_discoverable,review] of [[1100,false,false,"Hidden community review"],[1101,true,false,"Link-only community review"]]){
          profiles.push({id,handle:`reviewer_${id}`,display_name:`Hidden Reviewer ${id}`,is_public,is_discoverable,owner_user_id:null});ratings.push({profile_id:id,game_id:1,score:50,review});
        }
        reviewVotes.push({reviewer_profile_id:1000,game_id:1,voter_profile_id:2,value:1},{reviewer_profile_id:1000,game_id:1,voter_profile_id:4,value:1});
        return reply(200,{ok:true});
      }
      if (url.pathname === "/__best-reviews" && req.method === "POST") {
        for (let game_id = 1; game_id <= 10; game_id++) {
          let rating=ratings.find(row=>row.profile_id===3&&row.game_id===game_id);
          if(!rating){rating={profile_id:3,game_id,score:80};ratings.push(rating);}
          Object.assign(rating,{review:`Carousel review ${game_id}`,updated_at:game_id===10 ? "2020-01-01T00:00:00Z" : "2026-09-29T12:00:00Z"});
        }
        reviewVotes=[...Array.from({length:5},(_,i)=>({reviewer_profile_id:3,game_id:10,voter_profile_id:100+i,value:1})),{reviewer_profile_id:3,game_id:10,voter_profile_id:105,value:-1},...Array.from({length:6},(_,i)=>({reviewer_profile_id:3,game_id:1,voter_profile_id:110+i,value:1})),...Array.from({length:5},(_,i)=>({reviewer_profile_id:3,game_id:1,voter_profile_id:120+i,value:-1}))];
        return reply(200,{ok:true});
      }
      if (url.pathname === "/__trending" && req.method === "POST") {showTrending=true;return reply(200,{ok:true});}
      if (url.pathname === "/__test-token" && req.method === "POST") {
        let body="";for await(const part of req)body+=part;
        alternateToken=JSON.parse(body).token;
        return reply(200,{ok:true});
      }
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
        if(body.includes("game_modes.name,keywords.name")){
          const id=Number(body.match(/where id = (\d+)/)?.[1]);
          return reply(200,[{id,game_modes:[{name:id===3?"Massively multiplayer online (MMO)":"Single player"},...(id===2?[{name:"Multiplayer"},{name:"Co-operative"}]:[])],keywords:[]}]);
        }
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
      if (url.pathname === "/__legacy-entry" && req.method === "POST") {Object.assign(ratings.find(row=>row.profile_id===2&&row.game_id===2),{hours_played:1e9,completed_on:"2099-01-01"});return reply(200,{ok:true});}
      if(url.pathname==="/__translation-failure"){failTranslation=true;return reply(200,{ok:true});}
      if(url.pathname==="/__translation-review"){ratings.find(row=>row.profile_id===3&&row.game_id===1).review="Review with sources\nhttps://www.youtube.com/watch?v=example&t=637s";return reply(200,{ok:true});}
      if(url.pathname==="/__translate"){
        translateCalls++;if(failTranslation)return reply(503,{message:"Controlled translation failure"});
        let body="";for await(const part of req)body+=part;const input=JSON.parse(body);
        return reply(200,{translations:input.text.map(text=>({detected_source_language:/Reseña|Texto español/.test(text)?"ES":"EN",text:input.target_lang==="ES"?({"Public fixture review":"Reseña pública de prueba","Private fixture review":"Reseña privada de prueba","Review with sources":"Reseña con fuentes"}[text]??`Traducción: ${text}`):text}))});
      }
      if (url.pathname === "/__source-review" && req.method === "POST") {ratings.find(row=>row.profile_id===3&&row.game_id===1).review="https://www.youtube.com/watch?v=example";return reply(200,{ok:true});}
      if (url.pathname === "/__reset" && req.method === "POST") { reset(); return reply(200, { ok: true }); }
      if (url.pathname === "/__fail-save" && req.method === "POST") { failSave = true; return reply(200, { ok: true }); }
      if (url.pathname === "/__state") return reply(200, { requestCounts, catalogBatches, reviewTranslations, translateCalls, translatedCharacters, rankings, accountDeleted, pictures:[...pictures.keys()], reviewVotes, ratings, favorites, games, profiles:profiles.filter(row=>!profileDeleted||row.id!==2) });
      if(url.pathname==="/__fail-auth-delete"&&req.method==="POST"){failAuthDelete=true;return reply(200,{ok:true});}
      if(url.pathname==="/__fail-storage-delete"&&req.method==="POST"){failStorageDelete=true;return reply(200,{ok:true});}
      if(url.pathname==="/__profileless"&&req.method==="POST"){profileDeleted=true;return reply(200,{ok:true});}
      if(url.pathname==="/__deletion-pictures"&&req.method==="POST"){pictures.set("2/11111111-1111-4111-8111-111111111111.webp",Buffer.from("own"));pictures.set("3/22222222-2222-4222-8222-222222222222.webp",Buffer.from("other"));return reply(200,{ok:true});}
      const admin = req.headers.authorization === `Bearer ${fixtureAdminKey}`;
      const authenticated = !accountDeleted && (req.headers.authorization === `Bearer ${token}` || alternateToken && req.headers.authorization === `Bearer ${alternateToken}`);
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
      if(resource==="rpc/game_reviews"){
        if(failHome)return reply(503,{message:"Controlled review failure"});
        let body="";for await(const part of req)body+=part;const input=JSON.parse(body);
        const rows=ratings.filter(r=>r.game_id===input.p_game_id&&r.review?.trim()&&profiles.some(p=>p.id===r.profile_id&&p.is_public&&p.is_discoverable)).map(r=>{
          const p=profiles.find(p=>p.id===r.profile_id),votes=reviewVotes.filter(v=>v.reviewer_profile_id===r.profile_id&&v.game_id===r.game_id);
          return {profile_id:r.profile_id,review:r.review,score:r.score??null,tier:r.tier??null,updated_at:r.review_updated_at??r.updated_at,handle:p.handle,display_name:p.display_name,avatar_url:p.avatar_url??null,upvotes:votes.filter(v=>v.value===1).length,downvotes:votes.filter(v=>v.value===-1).length,viewer_vote:authenticated?votes.find(v=>v.voter_profile_id===2)?.value??0:0};
        }).sort((a,b)=>(b.upvotes-b.downvotes)-(a.upvotes-a.downvotes)||String(b.updated_at??"").localeCompare(String(a.updated_at??""))||a.profile_id-b.profile_id);
        return reply(200,rows.slice(input.p_offset,input.p_offset+25));
      }
      if(resource==="rpc/home_reviews"){
        if(failHome)return reply(503,{message:"Controlled optional failure"});
        const rows=ratings.filter(r=>r.review?.trim()&&profiles.some(p=>p.id===r.profile_id&&p.is_public&&p.is_discoverable)).map(r=>{
          const p=profiles.find(p=>p.id===r.profile_id),votes=reviewVotes.filter(v=>v.reviewer_profile_id===r.profile_id&&v.game_id===r.game_id);
          return {profile_id:r.profile_id,game_id:r.game_id,review:r.review,updated_at:r.review_updated_at??r.updated_at,handle:p.handle,display_name:p.display_name,upvotes:votes.filter(v=>v.value===1).length,downvotes:votes.filter(v=>v.value===-1).length,viewer_vote:authenticated?votes.find(v=>v.voter_profile_id===2)?.value??0:0};
        }).sort((a,b)=>(b.upvotes-b.downvotes)-(a.upvotes-a.downvotes)||String(b.updated_at??"").localeCompare(String(a.updated_at??""))||a.profile_id-b.profile_id||a.game_id-b.game_id).slice(0,12);
        return reply(200,rows);
      }
      if(resource==="rpc/home_taste"){
        if(!authenticated)return reply(403,{message:"Not owned"});
        const own=ratings.filter(r=>r.profile_id===2),others=ratings.filter(r=>profiles.some(p=>p.id===r.profile_id&&p.is_public&&p.is_discoverable));
        return reply(200,{neighbors:tasteNeighbors(own,others,2).slice(0,6).map(n=>{const p=profiles.find(p=>p.id===n.profileId);return {...n,handle:p.handle,displayName:p.display_name,avatarUrl:p.avatar_url??null};}),recommendations:tasteRecommendations(own,others,2).slice(0,5)});
      }
      if(["rpc/catalog_page","rpc/search_catalog","rpc/discover_games","rpc/explore_games"].includes(resource)) {
        if(!admin)return reply(403,{message:"Server only"});
        let body="";for await(const part of req)body+=part;const input=JSON.parse(body);
        if(["rpc/discover_games","rpc/explore_games"].includes(resource)) return reply(200,games.filter(g=>resource!=="rpc/explore_games"||(g.genres.some(genre=>input.p_genres.includes(genre))&&!ratings.some(r=>r.profile_id===input.p_profile_id&&r.game_id===g.id))).sort((a,b)=>createHash("md5").update(`${input.p_seed}:${a.id}`).digest("hex").localeCompare(createHash("md5").update(`${input.p_seed}:${b.id}`).digest("hex"))).slice(0,input.p_amount));
        if(resource==="rpc/search_catalog") {
          const words=input.p_query.trim().toLowerCase().split(/\s+/).filter(Boolean);
          const results=games.filter(game=>{
            const rating=ratings.find(row=>row.profile_id===input.p_profile_id&&row.game_id===game.id);
            const content=`${game.title} ${game.search_keywords} ${game.genres.join(" ")} ${(rating?.tags??[]).join(" ")}`.toLowerCase();
            return (!input.p_hide_rated || rating?.score==null)&&words.every(word=>content.includes(word));
          }).sort((a,b)=>{
            if(!words.length&&!input.p_hide_rated)return a.id-b.id;
            const score=game=>ratings.find(row=>row.profile_id===input.p_profile_id&&row.game_id===game.id)?.score??-1;
            return score(b)-score(a)||a.slug.localeCompare(b.slug);
          });
          return reply(200,results.slice(input.p_offset,input.p_offset+25));
        }
        const mapped=games.map(game=>{
          const rating=ratings.find(row=>row.profile_id===input.p_profile_id&&row.game_id===game.id);
          const scores=ratings.filter(row=>row.game_id===game.id&&row.score!=null).map(row=>row.score);
          return {slug:game.slug,title:game.title,cover:game.cover_url,year:game.release_year,releasedOn:game.released_on,genres:game.genres,keywords:game.search_keywords,platforms:game.igdb_metadata.platforms,
            score:rating?.score??null,tier:rating?.tier??null,status:rating?.status??null,tags:rating?.tags??[],logged:Boolean(rating),
            platformScore:scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:null,platformRatingCount:scores.length};
        });
        const result=gamesPage(mapped,input.p_filters,input.p_page,25);if(input.p_filters.batch){result.offset=(result.page-1)*25;result.games=result.games.slice(result.offset);}catalogBatches.push({page:input.p_page,count:result.games.length,batch:Boolean(input.p_filters.batch)});
        if(input.p_filters.valid===false)Object.assign(result,{games:[],matched:0,page:1,pageCount:1});
        return reply(200,result);
      }
      if(resource==="rpc/remove_rating"){
        let body="";for await(const part of req)body+=part;const input=JSON.parse(body);
        if(!authenticated)return reply(403,{code:"42501",message:"Owned profile required"});
        const previous=ratings.find(row=>row.profile_id===2&&row.game_id===input.p_game_id);
        if(!previous)return reply(200,false);
        if(previous.updated_at!==input.p_expected_updated_at)return reply(409,{code:"40001",message:"Entry changed"});
        if(failSave){failSave=false;return reply(503,{message:"Controlled remove failure"});}
        for(const ranking of rankings.filter(row=>row.profile_id===2&&row.game_ids.includes(input.p_game_id))){
          const position=ranking.game_ids.indexOf(input.p_game_id);ranking.game_ids=ranking.game_ids.filter(id=>id!==input.p_game_id);
          ranking.manual_positions=Object.fromEntries(Object.entries(ranking.manual_positions).filter(([id])=>Number(id)!==input.p_game_id).map(([id,value])=>[id,value>position?value-1:value]));ranking.revision++;
        }
        reviewTranslations=reviewTranslations.filter(row=>row.profile_id!==2||row.game_id!==input.p_game_id);ratings=ratings.filter(row=>row!==previous);reviewVotes=reviewVotes.filter(v=>v.reviewer_profile_id!==2||v.game_id!==input.p_game_id);
        return reply(200,true);
      }
      if(resource==="rpc/save_rating") {
        if(!authenticated)return reply(403,{message:"Not owned"});
        let body="";for await(const part of req)body+=part;const input=JSON.parse(body);
        if(failSave){failSave=false;return reply(503,{message:"Controlled save failure"});}
        const previous=ratings.find(row=>row.profile_id===2&&row.game_id===input.p_game_id);
        if((previous?.updated_at??null)!==input.p_expected_updated_at)return reply(409,{code:"40001",message:"Entry changed"});
        const row={...input.p_values,profile_id:2,game_id:input.p_game_id,updated_at:new Date().toISOString()};
        row.review_updated_at=row.review?.trim()?(previous?.review===row.review?previous.review_updated_at:row.updated_at):null;
        if(!row.tier_manual)row.tier=tierForScore(row.score,profiles[1].tier_ranges);
        if(previous?.review!==row.review){reviewVotes=reviewVotes.filter(v=>v.reviewer_profile_id!==2||v.game_id!==input.p_game_id);reviewTranslations=reviewTranslations.filter(value=>value.profile_id!==2||value.game_id!==input.p_game_id);}
        ratings=ratings.filter(r=>!(r.profile_id===2&&r.game_id===input.p_game_id));ratings.push(row);
        return reply(200,row.updated_at);
      }
      if(resource==="rpc/platform_game_scores") {
        if(!admin)return reply(403,{message:"Server only"});
        const groups=new Map();
        for(const row of ratings) if(row.score!==null) {
          const group=groups.get(row.game_id)??[];group.push(row.score);groups.set(row.game_id,group);
        }
        const rows=[...groups].flatMap(([id,scores])=>scores.length>0 ? [{slug:games.find(game=>game.id===id).slug,average:scores.reduce((sum,value)=>sum+value,0)/scores.length,sample_count:scores.length}] : []).sort((a,b)=>a.slug.localeCompare(b.slug));
        return reply(200,rows.slice(Number(url.searchParams.get("offset")??0),Number(url.searchParams.get("offset")??0)+Number(url.searchParams.get("limit")??1000)));
      }
      if(resource==="rpc/community_trending_games")return reply(200,showTrending?Array.from({length:5},(_,index)=>({game_id:index+1,sample_count:5-index})):[]);
      if(resource==="rpc/community_game_scores" || resource==="rpc/anonymous_game_scores"){
        if(failScore)return reply(503,{message:"Controlled optional score failure"});
        if(resource==="rpc/anonymous_game_scores"&&!admin)return reply(403,{message:"Server only"});
        let body="";for await(const part of req)body+=part;const input=body ? JSON.parse(body) : {};
        const groups=new Map();
        for(const row of ratings){const profile=profiles.find(p=>p.id===row.profile_id);if((resource==="rpc/community_game_scores"&&(!profile?.is_public||!profile.is_discoverable))||row.score==null||(input.p_ids&&!input.p_ids.includes(row.game_id)))continue;const values=groups.get(row.game_id)??[];values.push(row.score);groups.set(row.game_id,values);}
        return reply(200,[...groups].filter(([,values])=>values.length>=Number(url.searchParams.get("sample_count")?.replace("gte.","")??1)).map(([game_id,values])=>{const average=values.reduce((a,b)=>a+b,0)/values.length;return {game_id,sample_count:values.length,average:Math.round(average*10)/10,deviation:Math.sqrt(values.reduce((sum,value)=>sum+(value-average)**2,0)/values.length)};}));
      }
      if(["rpc/read_review_translation","rpc/store_review_translation","rpc/reserve_review_translation"].includes(resource)){
        if(!admin)return reply(403,{message:"Server only"});
        let body="";for await(const part of req)body+=part;const input=JSON.parse(body);
        if(resource==="rpc/reserve_review_translation"){if(translatedCharacters+input.p_characters>500000)return reply(200,false);translatedCharacters+=input.p_characters;return reply(200,true);}
        if(resource==="rpc/read_review_translation")return reply(200,reviewTranslations.find(row=>row.profile_id===input.p_profile_id&&row.game_id===input.p_game_id&&row.hash===input.p_hash&&row.target===input.p_target)?.value??null);
        if(!ratings.some(row=>row.profile_id===input.p_profile_id&&row.game_id===input.p_game_id&&row.review===input.p_original))return reply(200,false);
        reviewTranslations=reviewTranslations.filter(row=>row.profile_id!==input.p_profile_id||row.game_id!==input.p_game_id||row.target!==input.p_target);
        reviewTranslations.push({profile_id:input.p_profile_id,game_id:input.p_game_id,hash:input.p_hash,target:input.p_target,value:{text:input.p_translation,sourceLanguage:input.p_source_language}});return reply(200,true);
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
      if(resource==="rpc/review_helpfulness") {
        let body="";for await(const part of req)body+=part;const {p_profile_id}=JSON.parse(body);
        const profile=profiles.find(p=>p.id===p_profile_id);
        return reply(200,!profile?.is_public ? [] : ratings.filter(r=>r.profile_id===p_profile_id&&r.review?.trim()&&(!url.searchParams.has("game_slug")||games.find(g=>g.id===r.game_id).slug===url.searchParams.get("game_slug").slice(3))).map(r=>{
          const votes=reviewVotes.filter(v=>v.reviewer_profile_id===r.profile_id&&v.game_id===r.game_id);
          return {game_slug:games.find(g=>g.id===r.game_id).slug,upvotes:votes.filter(v=>v.value===1).length,downvotes:votes.filter(v=>v.value===-1).length,viewer_vote:authenticated ? votes.find(v=>v.voter_profile_id===2)?.value??0 : 0};
        }));
      }
      if(resource==="review_votes") {
        if(!authenticated)return reply(403,{message:"Sign in"});
        if(failSave){failSave=false;return reply(503,{message:"Controlled vote save failure"});}
        if(req.method==="DELETE") {
          if(url.searchParams.get("voter_profile_id")!=="eq.2")return reply(403,{message:"Not owned"});
          reviewVotes=reviewVotes.filter(v=>!(String(v.reviewer_profile_id)===url.searchParams.get("reviewer_profile_id")?.slice(3)&&String(v.game_id)===url.searchParams.get("game_id")?.slice(3)&&v.voter_profile_id===2));
          return reply(204);
        }
        let body="";for await(const part of req)body+=part;const vote=JSON.parse(body);
        if(vote.voter_profile_id!==2||vote.reviewer_profile_id===2||![1,-1].includes(vote.value)||!profiles.find(p=>p.id===vote.reviewer_profile_id)?.is_public||!ratings.find(r=>r.profile_id===vote.reviewer_profile_id&&r.game_id===vote.game_id)?.review?.trim())return reply(403,{message:"Vote unavailable"});
        reviewVotes=reviewVotes.filter(v=>!(v.reviewer_profile_id===vote.reviewer_profile_id&&v.game_id===vote.game_id&&v.voter_profile_id===2));
        reviewVotes.push(vote);return reply(201);
      }
      if (resource === "ratings" && req.method === "PATCH") {
        if(!authenticated || url.searchParams.get("profile_id")!=="eq.2")return reply(403,{message:"Fixture ownership denied"});
        let body="";for await(const part of req)body+=part;const patch=JSON.parse(body);
        if(Object.keys(patch).some(key=>!["hours_played","tier","tier_manual","updated_at"].includes(key)))return reply(400,{message:"Unsupported entry fields"});
        if(failSave){failSave=false;return reply(503,{message:"Controlled save failure"});}
        const matches=ratings.filter(row=>[...url.searchParams].filter(([key])=>key!=="select").every(([key,value])=>value.startsWith("eq.")?String(row[key])===value.slice(3):value.startsWith("in.(")?value.slice(4,-1).split(",").includes(String(row[key])):value==="is.null"&&row[key]===null));
        matches.forEach(row=>{Object.assign(row,patch,{updated_at:new Date().toISOString()});if(!row.tier_manual)row.tier=tierForScore(row.score,profiles[1].tier_ranges);});
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
          const row={score:null,tier:null,status:null,review:null,tags:[],completed_on:null,tier_manual:false,...rating,updated_at:new Date().toISOString()};if(!row.tier_manual)row.tier=tierForScore(row.score,profiles[1].tier_ranges);ratings.push(row);saved.push(row);
        }
        return reply(201,url.searchParams.has("select")?saved.map(row=>({game_id:row.game_id,updated_at:row.updated_at})):undefined);
      }
      if (resource === "profiles" && req.method === "PATCH") {
        if (!admin || url.searchParams.get("id") !== "eq.2" || url.searchParams.get("owner_user_id") !== `eq.${ownerId}`) return reply(403, {message:"Fixture ownership denied"});
        let body=""; for await (const part of req) body+=part;
        const patch=JSON.parse(body);
        if(Object.keys(patch).some(key=>!["handle","display_name","is_public","updated_at","bio","location","platform_preference","avatar_url","is_discoverable","tier_ranges"].includes(key))) return reply(400,{message:"Unsupported fixture field"});
        if(patch.tier_ranges&&!parseTierRanges(patch.tier_ranges))return reply(400,{message:"Invalid ranges"});
        Object.assign(profiles[1],patch);
        if(patch.tier_ranges)ratings.filter(r=>r.profile_id===2&&!r.tier_manual).forEach(r=>r.tier=tierForScore(r.score,patch.tier_ranges));
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
      if(["rpc/save_preference_ranking","rpc/save_preference_ranking_v2"].includes(resource)&&req.method==="POST"){let body="";for await(const part of req)body+=part;const input=JSON.parse(body);if(!authenticated||input.p_ids.some(id=>!ratings.some(row=>row.profile_id===2&&row.game_id===id)))return reply(403,{message:"Not owned"});if(failSave){failSave=false;return reply(503,{message:"Controlled ranking save failure"});}if(rankingDelay)await new Promise(resolve=>setTimeout(resolve,rankingDelay));const existing=rankings.find(row=>row.profile_id===2);if((existing?.revision??null)!==input.p_revision)return reply(409,{code:"40001",message:"Stale ranking"});const row={profile_id:2,game_ids:input.p_ids,manual_positions:input.p_manual??{},revision:(existing?.revision??0)+1};rankings=[row];return reply(200,row.revision);}
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
      if(resource==="ratings" && url.searchParams.get("select")?.includes("profiles!inner"))return reply(300,{code:"PGRST201",message:"Specify ratings_profile_id_fkey; review_votes creates a second relationship"});
      if(url.searchParams.get("select")?.includes("profiles!ratings_profile_id_fkey!inner"))rows=rows.map(row=>({...row,profiles:profiles.find(profile=>profile.id===row.profile_id),curated_list_items:listItems.filter(item=>item.list_id===row.id)}));
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
