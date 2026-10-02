-- Remove the obsolete demo marker while retaining Auth ownership and visibility.
-- Deploy compatible application code before applying. No CASCADE or data deletion.
begin;
lock table public.profiles, public.ratings, public.curated_lists,
  public.curated_list_items, public.profile_favorites, public.games in access exclusive mode;
do $$ begin
  if exists (select 1 from public.profiles where is_sample) then
    raise exception 'Sample profiles remain; review before removing the marker';
  end if;
end $$;
create temporary table profile_flag_before on commit drop as
select 'profiles'::text as table_name, count(*) as row_count,
  md5(coalesce(string_agg((to_jsonb(r) - 'is_sample')::text, '' order by (to_jsonb(r) - 'is_sample')::text), '')) as contents_hash from public.profiles r
union all
select 'ratings'::text as table_name, count(*) as row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text, '' order by to_jsonb(r)::text), '')) as contents_hash from public.ratings r
union all
select 'curated_lists'::text as table_name, count(*) as row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text, '' order by to_jsonb(r)::text), '')) as contents_hash from public.curated_lists r
union all
select 'curated_list_items'::text as table_name, count(*) as row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text, '' order by to_jsonb(r)::text), '')) as contents_hash from public.curated_list_items r
union all
select 'profile_favorites'::text as table_name, count(*) as row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text, '' order by to_jsonb(r)::text), '')) as contents_hash from public.profile_favorites r
union all
select 'games'::text as table_name, count(*) as row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text, '' order by to_jsonb(r)::text), '')) as contents_hash from public.games r;

alter policy "owner_ratings_read" on "public"."ratings"
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = ratings.profile_id) AND (profiles.owner_user_id = ( SELECT auth.uid() AS uid))))));

alter policy "owner_ratings_insert" on "public"."ratings"
  with check ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = ratings.profile_id) AND (profiles.owner_user_id = ( SELECT auth.uid() AS uid))))));

alter policy "owner_ratings_update" on "public"."ratings"
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = ratings.profile_id) AND (profiles.owner_user_id = ( SELECT auth.uid() AS uid))))))
  with check ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = ratings.profile_id) AND (profiles.owner_user_id = ( SELECT auth.uid() AS uid))))));

alter policy "owner_list_items_insert" on "public"."curated_list_items"
  with check ((EXISTS ( SELECT 1
   FROM (curated_lists l
     JOIN profiles p ON ((p.id = l.profile_id)))
  WHERE ((l.id = curated_list_items.list_id) AND (p.owner_user_id = ( SELECT auth.uid() AS uid))))));

alter policy "owner_list_items_delete" on "public"."curated_list_items"
  using ((EXISTS ( SELECT 1
   FROM (curated_lists l
     JOIN profiles p ON ((p.id = l.profile_id)))
  WHERE ((l.id = curated_list_items.list_id) AND (p.owner_user_id = ( SELECT auth.uid() AS uid))))));

alter policy "owner_lists_read" on "public"."curated_lists"
  using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = curated_lists.profile_id) AND (p.owner_user_id = ( SELECT auth.uid() AS uid))))));

alter policy "owner_lists_insert" on "public"."curated_lists"
  with check ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = curated_lists.profile_id) AND (p.owner_user_id = ( SELECT auth.uid() AS uid))))));

alter policy "owner_lists_update" on "public"."curated_lists"
  using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = curated_lists.profile_id) AND (p.owner_user_id = ( SELECT auth.uid() AS uid))))))
  with check ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = curated_lists.profile_id) AND (p.owner_user_id = ( SELECT auth.uid() AS uid))))));

alter policy "owner_lists_delete" on "public"."curated_lists"
  using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = curated_lists.profile_id) AND (p.owner_user_id = ( SELECT auth.uid() AS uid))))));

alter policy "owner_list_items_read" on "public"."curated_list_items"
  using ((EXISTS ( SELECT 1
   FROM (curated_lists l
     JOIN profiles p ON ((p.id = l.profile_id)))
  WHERE ((l.id = curated_list_items.list_id) AND (p.owner_user_id = ( SELECT auth.uid() AS uid))))));

alter policy "owner_favorites_read" on "public"."profile_favorites"
  using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = profile_favorites.profile_id) AND (p.owner_user_id = ( SELECT auth.uid() AS uid))))));

alter policy "owner_favorites_insert" on "public"."profile_favorites"
  with check ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = profile_favorites.profile_id) AND (p.owner_user_id = ( SELECT auth.uid() AS uid))))));

alter policy "owner_favorites_update" on "public"."profile_favorites"
  using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = profile_favorites.profile_id) AND (p.owner_user_id = ( SELECT auth.uid() AS uid))))))
  with check ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = profile_favorites.profile_id) AND (p.owner_user_id = ( SELECT auth.uid() AS uid))))));

alter policy "owner_favorites_delete" on "public"."profile_favorites"
  using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = profile_favorites.profile_id) AND (p.owner_user_id = ( SELECT auth.uid() AS uid))))));

alter policy "Owners upload profile pictures" on "storage"."objects"
  with check (((bucket_id = 'profile-pictures'::text) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE (((profiles.id)::text = (storage.foldername(objects.name))[1]) AND (profiles.owner_user_id = ( SELECT auth.uid() AS uid)))))));

alter policy "Owners read profile picture objects" on "storage"."objects"
  using (((bucket_id = 'profile-pictures'::text) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE (((profiles.id)::text = (storage.foldername(objects.name))[1]) AND (profiles.owner_user_id = ( SELECT auth.uid() AS uid)))))));

alter policy "Owners remove profile pictures" on "storage"."objects"
  using (((bucket_id = 'profile-pictures'::text) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE (((profiles.id)::text = (storage.foldername(objects.name))[1]) AND (profiles.owner_user_id = ( SELECT auth.uid() AS uid)))))));

CREATE OR REPLACE FUNCTION public.save_curated_list(p_profile_id bigint, p_list_id bigint, p_name text, p_game_ids bigint[], p_expected_revision integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare saved public.curated_lists;
begin
  if not exists (select 1 from public.profiles p where p.id = p_profile_id and p.owner_user_id = (select auth.uid())) then
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
$function$;

CREATE OR REPLACE FUNCTION public.set_profile_favorite(p_game_id bigint, p_favorite boolean, p_featured_slot integer DEFAULT NULL::integer)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v_profile_id bigint;
begin
  select p.id into v_profile_id from public.profiles p
  where p.owner_user_id = (select auth.uid());
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
$function$;

alter table public.profiles drop constraint sample_profiles_have_no_owner;
alter table public.profiles drop column is_sample;

create temporary table profile_flag_after on commit drop as
select 'profiles'::text as table_name, count(*) as row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text, '' order by to_jsonb(r)::text), '')) as contents_hash from public.profiles r
union all
select 'ratings'::text as table_name, count(*) as row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text, '' order by to_jsonb(r)::text), '')) as contents_hash from public.ratings r
union all
select 'curated_lists'::text as table_name, count(*) as row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text, '' order by to_jsonb(r)::text), '')) as contents_hash from public.curated_lists r
union all
select 'curated_list_items'::text as table_name, count(*) as row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text, '' order by to_jsonb(r)::text), '')) as contents_hash from public.curated_list_items r
union all
select 'profile_favorites'::text as table_name, count(*) as row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text, '' order by to_jsonb(r)::text), '')) as contents_hash from public.profile_favorites r
union all
select 'games'::text as table_name, count(*) as row_count,
  md5(coalesce(string_agg(to_jsonb(r)::text, '' order by to_jsonb(r)::text), '')) as contents_hash from public.games r;
do $$ begin
  if exists (select * from profile_flag_before except select * from profile_flag_after)
    or exists (select * from profile_flag_after except select * from profile_flag_before) then
    raise exception 'Personal records or catalog changed while removing the sample marker';
  end if;
end $$;
commit;

