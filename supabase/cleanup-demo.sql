-- User-approved cleanup: remove invented unowned player/ratings, retain real games.
-- The guest pages no longer depend on sample data. Safe to rerun after completion.
begin;
lock table public.profiles, public.ratings, public.games in share row exclusive mode;
do $$ begin
  if exists(select 1 from public.profiles where is_sample and owner_user_id is not null) then
    raise exception 'A sample profile has an Auth owner; review before deleting';
  end if;
  if exists(select 1 from public.curated_lists l join public.profiles p on p.id=l.profile_id where p.is_sample)
     or exists(select 1 from public.profile_favorites f join public.profiles p on p.id=f.profile_id where p.is_sample) then
    raise exception 'Unexpected sample lists/favorites; review the cleanup scope';
  end if;
end $$;
create temporary table cleanup_before as select
  (select count(*) from public.profiles where not is_sample) as real_profiles,
  (select count(*) from public.ratings r join public.profiles p on p.id=r.profile_id where not p.is_sample) as real_ratings,
  (select count(*) from public.games) as catalog_games,
  (select md5(coalesce(string_agg(row_to_json(p)::text, '' order by p.id), '')) from public.profiles p where not is_sample) as real_profiles_hash,
  (select md5(coalesce(string_agg(row_to_json(r)::text, '' order by r.profile_id,r.game_id), '')) from public.ratings r join public.profiles p on p.id=r.profile_id where not p.is_sample) as real_ratings_hash;
delete from public.ratings where profile_id in
  (select id from public.profiles where is_sample and owner_user_id is null);
delete from public.profiles where is_sample and owner_user_id is null;
-- Catalog titles are retained. Their sample flag was removed by migration
-- 20261001184236_remove_game_sample_and_timestamps; no game update is needed.
do $$ declare before record; begin
  select * into before from cleanup_before;
  if (select count(*) from public.profiles where not is_sample) <> before.real_profiles
     or (select count(*) from public.ratings) <> before.real_ratings
     or (select count(*) from public.games) <> before.catalog_games
     or (select md5(coalesce(string_agg(row_to_json(p)::text, '' order by p.id), '')) from public.profiles p where not is_sample) <> before.real_profiles_hash
     or (select md5(coalesce(string_agg(row_to_json(r)::text, '' order by r.profile_id,r.game_id), '')) from public.ratings r) <> before.real_ratings_hash then
    raise exception 'Cleanup changed real profiles/entries or catalog count';
  end if;
end $$;
commit;
