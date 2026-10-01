-- One-time user-authorized deletion of all profile records on 2026-10-01.
-- This also deletes dependent portfolio data. Auth accounts and games are retained.
-- Manual administrative execution only; never run from builds or seeds.
begin;
lock table public.profiles, public.ratings, public.curated_lists,
  public.curated_list_items, public.profile_favorites, public.games in share row exclusive mode;
do $delete_profiles$
declare
  game_count bigint;
  game_hash text;
  auth_ids text;
begin
  -- Storage files must be removed through the Storage API, never SQL.
  -- Inspection found no profile pictures; stop if that changes before execution.
  if exists (select 1 from storage.objects where bucket_id='profile-pictures') then
    raise exception 'Profile pictures exist; remove through Storage API before deleting profiles';
  end if;
  select count(*), md5(coalesce(string_agg(to_jsonb(g)::text, '' order by id), ''))
    into game_count, game_hash from public.games g;
  select md5(coalesce(string_agg(id::text, '' order by id), '')) into auth_ids from auth.users;

  delete from public.curated_list_items
    where list_id in (select id from public.curated_lists);
  delete from public.curated_lists;
  delete from public.profile_favorites;
  delete from public.ratings;
  delete from public.profiles;

  if exists(select 1 from public.profiles)
    or exists(select 1 from public.ratings)
    or exists(select 1 from public.curated_lists)
    or exists(select 1 from public.curated_list_items)
    or exists(select 1 from public.profile_favorites) then
    raise exception 'Profile data deletion incomplete';
  end if;
  if (select count(*) from public.games) <> game_count
    or (select md5(coalesce(string_agg(to_jsonb(g)::text, '' order by id), '')) from public.games g) <> game_hash
    or (select md5(coalesce(string_agg(id::text, '' order by id), '')) from auth.users) <> auth_ids then
    raise exception 'Catalog or sign-in accounts changed; rolling back profile deletion';
  end if;
end $delete_profiles$;
commit;
