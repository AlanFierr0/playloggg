-- All-profile averages are read on the server; individual private ratings remain private.
begin;
create or replace function public.platform_game_scores()
returns table (slug text, average double precision, sample_count bigint)
language sql stable security invoker set search_path = ''
as $$
  select g.slug, avg(r.score)::double precision, count(*)
  from public.ratings r
  join public.games g on g.id = r.game_id
  where r.score is not null
  group by g.id, g.slug;
$$;
revoke all on function public.platform_game_scores() from public, anon, authenticated;
grant execute on function public.platform_game_scores() to service_role;

-- Preserve community visibility and discovery consent; remove only the count cutoff.
create or replace function public.community_game_scores(p_ids bigint[] default null)
returns table(game_id bigint,sample_count bigint,average numeric,deviation numeric)
language sql stable security invoker set search_path='' as $$
  select r.game_id, count(*), round(avg(r.score),1), stddev_pop(r.score)
  from public.ratings r join public.profiles p on p.id=r.profile_id
  where p.is_public and p.is_discoverable and r.score is not null
  and (p_ids is null or r.game_id=any(p_ids))
  group by r.game_id;
$$;
commit;
