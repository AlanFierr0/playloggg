-- Run against the applied migration. Read-only verification; no personal rows change.
begin;
do $$
begin
  if has_function_privilege('anon', 'public.platform_game_scores()', 'execute')
    or has_function_privilege('authenticated', 'public.platform_game_scores()', 'execute')
    or not has_function_privilege('service_role', 'public.platform_game_scores()', 'execute')
    or (select prosecdef from pg_proc where oid='public.platform_game_scores()'::regprocedure)
  then raise exception 'Platform score access is incorrect'; end if;
  if exists (
    with expected as (
      select g.slug, avg(r.score)::double precision as average, count(*) as sample_count
      from public.ratings r join public.games g on g.id=r.game_id
      where r.score is not null group by g.id,g.slug
    ), actual as (select * from public.platform_game_scores())
    (select * from expected except select * from actual)
    union all (select * from actual except select * from expected)
  ) then raise exception 'Platform averages differ from all-profile ratings'; end if;
  if exists (
    with expected as (
      select r.game_id, count(*) as sample_count, round(avg(r.score),1) as average, stddev_pop(r.score) as deviation
      from public.ratings r join public.profiles p on p.id=r.profile_id
      where p.is_public and p.is_discoverable and r.score is not null group by r.game_id
    ), actual as (select * from public.community_game_scores())
    (select * from expected except select * from actual)
    union all (select * from actual except select * from expected)
  ) then raise exception 'Community averages differ from eligible ratings'; end if;
end $$;
rollback;
