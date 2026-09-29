-- Owner identity is assigned administratively. Application roles cannot claim profiles.
alter table public.profiles
  add column owner_user_id uuid unique references auth.users(id) on delete restrict,
  add constraint sample_profiles_have_no_owner check (not is_sample or owner_user_id is null);

comment on column public.profiles.owner_user_id is 'Administrator-assigned owner; never derive from user-editable metadata. Sample profiles cannot have owners.';

create policy owner_profile_read on public.profiles
  for select to authenticated using (owner_user_id = (select auth.uid()));

create policy owner_ratings_read on public.ratings
  for select to authenticated using (exists (
    select 1 from public.profiles
    where profiles.id = ratings.profile_id
      and profiles.owner_user_id = (select auth.uid()) and not profiles.is_sample
  ));

create policy owner_ratings_insert on public.ratings
  for insert to authenticated with check (exists (
    select 1 from public.profiles
    where profiles.id = ratings.profile_id
      and profiles.owner_user_id = (select auth.uid()) and not profiles.is_sample
  ));

create policy owner_ratings_update on public.ratings
  for update to authenticated
  using (exists (
    select 1 from public.profiles
    where profiles.id = ratings.profile_id
      and profiles.owner_user_id = (select auth.uid()) and not profiles.is_sample
  ))
  with check (exists (
    select 1 from public.profiles
    where profiles.id = ratings.profile_id
      and profiles.owner_user_id = (select auth.uid()) and not profiles.is_sample
  ));

-- PostgREST upsert updates the submitted key columns as well as rating values.
grant insert (profile_id, game_id, score, tier, review, updated_at),
  update (profile_id, game_id, score, tier, review, updated_at)
  on public.ratings to authenticated;

-- Anonymous readers need the public profile shape, not auth identifiers.
revoke select on public.profiles from anon;
grant select (id, handle, display_name, avatar_url, is_public, is_sample, created_at, updated_at)
  on public.profiles to anon;

-- No application writes to profiles or games; no rating deletion or anonymous writes.
