-- Keep cumulative initial/deep-link loads; subsequent scrolling asks for one bounded batch.
create or replace function public.catalog_page(p_profile_id bigint, p_filters jsonb, p_page integer)
returns jsonb language sql stable security invoker set search_path = '' as $$
with scores as (
  select game_id, avg(score) as average, count(*) as votes from public.ratings where score is not null group by game_id
), entries as (
  select g.id, g.slug, g.title, g.cover_url as cover, g.release_year as release_year, g.released_on,
    g.genres, g.search_keywords, g.igdb_metadata, r.score, r.tier, r.status, coalesce(r.tags, '{}') as tags,
    r.game_id is not null as logged, s.average as platform_score, coalesce(s.votes, 0) as platform_rating_count
  from public.games g left join public.ratings r on r.game_id = g.id and r.profile_id = p_profile_id
  left join scores s on s.game_id = g.id
), filtered as (
  select e.* from entries e where coalesce((p_filters->>'valid')::boolean, true)
    and not exists(select 1 from regexp_split_to_table(lower(trim(coalesce(p_filters->>'query',''))), '\s+') word
      where word <> '' and strpos(lower(e.title || ' ' || e.search_keywords || ' ' || array_to_string(e.genres,' ')), word) = 0)
    and (coalesce(p_filters->>'genre','') = '' or p_filters->>'genre' = any(e.genres))
    and (coalesce(p_filters->>'tag','') = '' or (e.logged and exists(select 1 from unnest(e.tags) tag where lower(tag) = lower(p_filters->>'tag'))))
    and (coalesce(p_filters->>'platform','') = '' or exists(select 1 from jsonb_array_elements(coalesce(e.igdb_metadata->'platforms','[]')) item
      where (case when p_filters->>'platform' = any(array['PC','PlayStation','Xbox','Nintendo','Other'])
        then public.catalog_platform_family(coalesce(item->>'name',item#>>'{}')) else coalesce(item->>'name',item#>>'{}') end) = p_filters->>'platform'))
    and (coalesce(p_filters->>'year','') = '' or case when p_filters->>'year' = 'unknown' then e.release_year is null else e.release_year = (p_filters->>'year')::integer end)
    and (p_filters->>'library' = 'all' or case when p_filters->>'library' = 'logged' then e.logged else not e.logged end)
    and (p_filters->>'status' = 'all' or (e.logged and case when p_filters->>'status' = 'unset' then e.status is null else e.status = p_filters->>'status' end))
    and (p_filters->>'tier' = 'all' or case when p_filters->>'tier' = 'unset' then e.tier is null else e.tier = p_filters->>'tier' end)
    and (p_filters->>'rating' = 'all' or case when p_filters->>'rating' = 'rated' then e.score is not null else e.score is null end)
    and (coalesce(p_filters->>'minScore','') = '' or e.score >= nullif(p_filters->>'minScore','')::numeric)
    and (coalesce(p_filters->>'maxScore','') = '' or e.score <= nullif(p_filters->>'maxScore','')::numeric)
), counts as (
  select count(*) as matched, greatest(1, ceil(count(*) / 25.0))::integer as pages from filtered
), bounds as (
  select matched, pages, least(greatest(p_page,1), pages) as page from counts
), limited as (
  select e.* from filtered e order by
    case when p_filters->>'sort' = 'platform-desc' then platform_score end desc nulls last,
    case when p_filters->>'sort' = 'platform-asc' then platform_score end asc nulls last,
    case when p_filters->>'sort' = 'score-desc' then score end desc nulls last,
    case when p_filters->>'sort' = 'score-asc' then score end asc nulls last,
    case when p_filters->>'sort' = 'newest' then coalesce(released_on, make_date(release_year,1,1)) end desc nulls last,
    case when p_filters->>'sort' = 'oldest' then coalesce(released_on, make_date(release_year,1,1)) end asc nulls last,
    lower(title) collate "C", slug limit (select case when coalesce((p_filters->>'batch')::boolean,false) then 25 else page * 25 end from bounds)
  offset (select case when coalesce((p_filters->>'batch')::boolean,false) then (page-1)*25 else 0 end from bounds)
)
select jsonb_build_object(
  'games', coalesce((select jsonb_agg(jsonb_build_object('slug',slug,'title',title,'cover',cover,'year',release_year,'score',score,
    'platformScore',platform_score,'platformRatingCount',platform_rating_count,'tier',tier,'status',status,'logged',logged,'genres',genres,'tags',tags,'keywords','')) from limited), '[]'),
  'filters', p_filters - 'valid', 'total',(select count(*) from public.games), 'matched',matched,
  'page',page,'pageCount',pages,'pageSize',25,'offset',case when coalesce((p_filters->>'batch')::boolean,false) then (page-1)*25 else 0 end,
  'genres',coalesce((select jsonb_agg(genre order by genre) from (select distinct unnest(genres) genre from public.games) x),'[]'),
  'years',coalesce((select jsonb_agg(release_year order by release_year desc) from (select distinct release_year from public.games where release_year is not null) x),'[]'),
  'platforms',jsonb_build_array('PC','PlayStation','Xbox','Nintendo','Other'),
  'tags',coalesce((select jsonb_agg(tag order by lower(tag)) from (select distinct on(lower(tag)) tag from (select unnest(tags) tag from public.ratings where profile_id = p_profile_id) x order by lower(tag),tag) y),'[]')
) from bounds;
$$;
