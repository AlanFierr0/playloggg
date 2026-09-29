import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const demo = JSON.parse(fs.readFileSync(path.join(root, "supabase/demo-data.json"), "utf8"));
const literal = (value) => `'${value.replaceAll("'", "''")}'`;
const json = (value) => `${literal(JSON.stringify(value))}::jsonb`;
const profile = demo.profile;
const sql = `-- Generated from demo-data.json. Rebuild with node scripts/generate-demo-seed.mjs.
-- Sample data only. Existing records are never overwritten.
begin;

do $seed_guard$
begin
  if exists (select 1 from public.profiles where handle = ${literal(profile.handle)} and not is_sample) then
    raise exception 'Demo profile handle belongs to a non-sample profile; seed refused';
  end if;
  if exists (
    select 1 from public.games g
    join jsonb_to_recordset(${json(demo.games)}) as d(slug text) on d.slug = g.slug
    where not g.is_sample
  ) then
    raise exception 'Demo catalog overlaps non-sample games; seed refused';
  end if;
end
$seed_guard$;

insert into public.profiles (handle, display_name, avatar_url, is_public, is_sample)
values (${literal(profile.handle)}, ${literal(profile.display_name)}, ${profile.avatar_url === null ? "null" : literal(profile.avatar_url)}, true, true)
on conflict (handle) do nothing;

insert into public.games (slug, title, cover_url, release_year, search_keywords, is_sample)
select slug, title, cover_url, release_year, search_keywords, true
from jsonb_to_recordset(${json(demo.games)})
  as d(slug text, title text, cover_url text, release_year smallint, search_keywords text)
on conflict (slug) do nothing;

insert into public.ratings (profile_id, game_id, score, tier, review)
select p.id, g.id, d.score, d.tier, d.review
from jsonb_to_recordset(${json(demo.ratings)})
  as d(game_slug text, score smallint, tier text, review text)
join public.games g on g.slug = d.game_slug
join public.profiles p on p.handle = ${literal(profile.handle)}
on conflict (profile_id, game_id) do nothing;

commit;
`;

const target = path.join(root, "supabase/seed.sql");
if (process.argv.includes("--check")) {
  if (!fs.existsSync(target) || fs.readFileSync(target, "utf8").replaceAll("\r\n", "\n") !== sql) {
    throw new Error("seed.sql differs from demo-data.json; regenerate it before applying.");
  }
  console.log("Demo seed matches its versioned source.");
} else {
  fs.writeFileSync(target, sql);
  console.log(`Generated seed: ${demo.games.length} games and ${demo.ratings.length} ratings.`);
}
