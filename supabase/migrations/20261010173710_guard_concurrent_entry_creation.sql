create or replace function public.save_rating(p_game_id bigint, p_values jsonb, p_expected_updated_at timestamptz)
returns timestamptz language plpgsql security invoker set search_path = '' as $$
declare owner_id bigint; previous public.ratings; entry public.ratings; stamp timestamptz;
begin
  select id into owner_id from public.profiles where owner_user_id = (select auth.uid());
  if owner_id is null then raise exception 'Owned profile required' using errcode = '42501'; end if;
  perform pg_catalog.pg_advisory_xact_lock(owner_id);
  select * into previous from public.ratings where profile_id = owner_id and game_id = p_game_id for update;
  if previous.updated_at is distinct from p_expected_updated_at or (previous.game_id is null and p_expected_updated_at is not null) then
    raise exception 'Entry changed' using errcode = '40001';
  end if;
  entry := jsonb_populate_record(null::public.ratings, p_values);
  if entry.completed_on > (now() at time zone 'UTC')::date then
    raise exception 'Completion date cannot be in the future' using errcode = '22023';
  end if;
  insert into public.ratings(profile_id, game_id, score, tier, tier_manual, status, platform, tags, hours_played, completed_on, review, updated_at)
  values(owner_id, p_game_id, entry.score, entry.tier, coalesce(entry.tier_manual, false), entry.status, entry.platform, coalesce(entry.tags, '{}'), entry.hours_played, entry.completed_on, entry.review, clock_timestamp())
  on conflict(profile_id, game_id) do update set score = excluded.score, tier = excluded.tier,
    tier_manual = excluded.tier_manual, status = excluded.status, platform = excluded.platform,
    tags = excluded.tags, hours_played = excluded.hours_played, completed_on = excluded.completed_on,
    review = excluded.review, updated_at = excluded.updated_at
    where public.ratings.updated_at is not distinct from p_expected_updated_at returning updated_at into stamp;
  if stamp is null then raise exception 'Entry changed' using errcode = '40001'; end if;
  return stamp;
end;
$$;
