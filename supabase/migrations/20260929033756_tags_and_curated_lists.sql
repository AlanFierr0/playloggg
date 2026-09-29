-- Personal labels stay on ratings; independently ordered lists belong to profiles.
create function public.valid_rating_tags(value text[]) returns boolean
language sql immutable security invoker set search_path = '' as $$
  select value is not null and coalesce(array_ndims(value), 1) = 1
    and cardinality(value) <= 20
    and not exists (select 1 from unnest(value) tag where tag is null or tag <> btrim(tag)
      or length(tag) not between 1 and 48 or tag ~ '[[:cntrl:]]')
    and (select count(*) from unnest(value) tag) = (select count(distinct lower(tag)) from unnest(value) tag);
$$;
revoke all on function public.valid_rating_tags(text[]) from public, anon, authenticated;
grant execute on function public.valid_rating_tags(text[]) to anon, authenticated;
alter table public.ratings add column tags text[] not null default '{}' check (public.valid_rating_tags(tags));
grant insert (tags), update (tags) on public.ratings to authenticated;

create table public.curated_lists (
  id bigint generated always as identity primary key,
  profile_id bigint not null references public.profiles(id) on delete restrict,
  name text not null check (name = btrim(name) and length(name) between 1 and 80 and name !~ '[[:cntrl:]]'),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index curated_lists_profile_name_idx on public.curated_lists(profile_id, lower(name));
create table public.curated_list_items (
  list_id bigint not null references public.curated_lists(id) on delete cascade,
  game_id bigint not null references public.games(id) on delete restrict,
  position integer not null check (position between 1 and 500),
  primary key (list_id, game_id),
  unique (list_id, position)
);
create index curated_list_items_game_idx on public.curated_list_items(game_id);
alter table public.curated_lists enable row level security;
alter table public.curated_list_items enable row level security;
revoke all on public.curated_lists, public.curated_list_items from public, anon, authenticated;
revoke all on sequence public.curated_lists_id_seq from public, anon, authenticated;
grant select on public.curated_lists, public.curated_list_items to anon, authenticated;
grant insert (profile_id, name), update (name, revision, updated_at), delete on public.curated_lists to authenticated;
grant insert (list_id, game_id, position), delete on public.curated_list_items to authenticated;
grant usage on sequence public.curated_lists_id_seq to authenticated;

create policy published_lists_read on public.curated_lists for select to anon, authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.is_public));
create policy owner_lists_read on public.curated_lists for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.owner_user_id = (select auth.uid()) and not p.is_sample));
create policy owner_lists_insert on public.curated_lists for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.owner_user_id = (select auth.uid()) and not p.is_sample));
create policy owner_lists_update on public.curated_lists for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.owner_user_id = (select auth.uid()) and not p.is_sample))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.owner_user_id = (select auth.uid()) and not p.is_sample));
create policy owner_lists_delete on public.curated_lists for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.owner_user_id = (select auth.uid()) and not p.is_sample));
create policy published_list_items_read on public.curated_list_items for select to anon, authenticated
  using (exists (select 1 from public.curated_lists l join public.profiles p on p.id = l.profile_id where l.id = list_id and p.is_public));
create policy owner_list_items_read on public.curated_list_items for select to authenticated
  using (exists (select 1 from public.curated_lists l join public.profiles p on p.id = l.profile_id where l.id = list_id and p.owner_user_id = (select auth.uid()) and not p.is_sample));
create policy owner_list_items_insert on public.curated_list_items for insert to authenticated
  with check (exists (select 1 from public.curated_lists l join public.profiles p on p.id = l.profile_id where l.id = list_id and p.owner_user_id = (select auth.uid()) and not p.is_sample));
create policy owner_list_items_delete on public.curated_list_items for delete to authenticated
  using (exists (select 1 from public.curated_lists l join public.profiles p on p.id = l.profile_id where l.id = list_id and p.owner_user_id = (select auth.uid()) and not p.is_sample));

-- A single invoker transaction replaces membership/order, retaining RLS throughout.
-- Revision checks prevent a stale browser draft overwriting a newer save.
create function public.save_curated_list(p_profile_id bigint, p_list_id bigint, p_name text, p_game_ids bigint[], p_expected_revision integer)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare saved public.curated_lists;
begin
  if not exists (select 1 from public.profiles p where p.id = p_profile_id and p.owner_user_id = (select auth.uid()) and not p.is_sample) then
    raise exception 'Owner access required' using errcode = '42501';
  end if;
  if p_name is null or p_name <> btrim(p_name) or length(p_name) not between 1 and 80 or p_name ~ '[[:cntrl:]]'
    or p_game_ids is null or coalesce(array_ndims(p_game_ids), 1) <> 1 or cardinality(p_game_ids) > 500
    or exists (select 1 from unnest(p_game_ids) id where id is null or id <= 0)
    or cardinality(p_game_ids) <> (select count(distinct id) from unnest(p_game_ids) id) then
    raise exception 'Invalid list draft' using errcode = '22023';
  end if;
  if p_list_id is null then
    if p_expected_revision is not null then raise exception 'Unexpected revision' using errcode = '22023'; end if;
    insert into public.curated_lists(profile_id, name) values (p_profile_id, p_name) returning * into saved;
  else
    select * into saved from public.curated_lists where id = p_list_id and profile_id = p_profile_id for update;
    if not found then raise exception 'Owner access required' using errcode = '42501'; end if;
    if p_expected_revision is null or saved.revision <> p_expected_revision then
      raise exception 'List changed; reload before saving' using errcode = '40001';
    end if;
    update public.curated_lists set name = p_name, revision = revision + 1, updated_at = now()
      where id = saved.id returning * into saved;
    delete from public.curated_list_items where list_id = saved.id;
  end if;
  insert into public.curated_list_items(list_id, game_id, position)
    select saved.id, game_id, ordinality::integer from unnest(p_game_ids) with ordinality as entries(game_id, ordinality);
  return jsonb_build_object('id', saved.id, 'name', saved.name, 'revision', saved.revision);
end;
$$;
revoke all on function public.save_curated_list(bigint, bigint, text, bigint[], integer) from public, anon, authenticated;
grant execute on function public.save_curated_list(bigint, bigint, text, bigint[], integer) to authenticated;
comment on table public.curated_lists is 'Profile-owned lists; visibility follows the profile. Membership does not create ratings.';
comment on table public.curated_list_items is 'One occurrence per shared game per list; custom order is independent of score/tier.';
