-- Profile identity is optional; existing profiles keep their data and visibility.
alter table public.profiles
  add column bio text check (bio is null or char_length(bio) <= 500),
  add column location text check (location is null or char_length(location) <= 80),
  add column platform_preference text check (platform_preference is null or char_length(platform_preference) <= 80);

-- Favorites are independent of ratings. A slot is a position in the featured Top 4.
create table public.profile_favorites (
  profile_id bigint not null references public.profiles(id) on delete cascade,
  game_id bigint not null references public.games(id) on delete cascade,
  featured_slot integer check (featured_slot between 1 and 4),
  created_at timestamptz not null default now(),
  primary key (profile_id, game_id),
  unique (profile_id, featured_slot)
);
create index profile_favorites_game_id_idx on public.profile_favorites(game_id);
alter table public.profile_favorites enable row level security;
revoke all on public.profile_favorites from anon, authenticated;
grant select on public.profile_favorites to anon;
grant select, insert, update, delete on public.profile_favorites to authenticated;

create policy published_favorites_read on public.profile_favorites
for select to anon, authenticated using (
  exists (select 1 from public.profiles p where p.id = profile_id and p.is_public)
);
create policy owner_favorites_read on public.profile_favorites
for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = profile_id and p.owner_user_id = (select auth.uid()) and not p.is_sample)
);
create policy owner_favorites_insert on public.profile_favorites
for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id = profile_id and p.owner_user_id = (select auth.uid()) and not p.is_sample)
);
create policy owner_favorites_update on public.profile_favorites
for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = profile_id and p.owner_user_id = (select auth.uid()) and not p.is_sample)
) with check (
  exists (select 1 from public.profiles p where p.id = profile_id and p.owner_user_id = (select auth.uid()) and not p.is_sample)
);
create policy owner_favorites_delete on public.profile_favorites
for delete to authenticated using (
  exists (select 1 from public.profiles p where p.id = profile_id and p.owner_user_id = (select auth.uid()) and not p.is_sample)
);

-- Invoker privileges/RLS remain in force. No submitted profile ID or admin client.
-- Serialize one owner's slot edits and displace a former featured favorite without
-- removing that favorite. Failure rolls the whole operation back.
create function public.set_profile_favorite(p_game_id bigint, p_favorite boolean, p_featured_slot integer default null)
returns void language plpgsql security invoker set search_path = '' as $$
declare v_profile_id bigint;
begin
  select p.id into v_profile_id from public.profiles p
  where p.owner_user_id = (select auth.uid()) and not p.is_sample;
  if v_profile_id is null then raise exception 'Owned profile required' using errcode = '42501'; end if;
  if p_favorite is null or (p_featured_slot is not null and p_featured_slot not between 1 and 4) then
    raise exception 'Invalid favorite' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('playlogg-favorites:' || v_profile_id::text, 0));
  if not p_favorite then
    delete from public.profile_favorites where profile_id = v_profile_id and game_id = p_game_id;
    return;
  end if;
  if p_featured_slot is not null then
    update public.profile_favorites set featured_slot = null
    where profile_id = v_profile_id and featured_slot = p_featured_slot and game_id <> p_game_id;
  end if;
  insert into public.profile_favorites(profile_id, game_id, featured_slot)
  values (v_profile_id, p_game_id, p_featured_slot)
  on conflict (profile_id, game_id) do update set featured_slot = excluded.featured_slot;
end;
$$;
revoke all on function public.set_profile_favorite(bigint, boolean, integer) from public, anon;
grant execute on function public.set_profile_favorite(bigint, boolean, integer) to authenticated;
