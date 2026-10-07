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
  group by g.id, g.slug
  having count(*) >= 5;
$$;
revoke all on function public.platform_game_scores() from public, anon, authenticated;
grant execute on function public.platform_game_scores() to service_role;
commit;
