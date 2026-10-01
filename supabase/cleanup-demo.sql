-- Prepared for the pending cleanup choice; NOT executed.
-- Recommended scope: remove invented unowned player/ratings, retain real games.
-- Run only after the new guest pages are deployed and this scope is confirmed.
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
  (select count(*) from public.games) as catalog_games;
delete from public.ratings where profile_id in
  (select id from public.profiles where is_sample and owner_user_id is null);
delete from public.profiles where is_sample and owner_user_id is null;
-- These are reviewed real IGDB titles, not invented player data.
update public.games set is_sample=false where is_sample;
do $$ declare before record; begin
  select * into before from cleanup_before;
  if (select count(*) from public.profiles where not is_sample) <> before.real_profiles
     or (select count(*) from public.ratings) <> before.real_ratings
     or (select count(*) from public.games) <> before.catalog_games then
    raise exception 'Cleanup changed real profiles/entries or catalog count';
  end if;
end $$;
commit;
