create or replace function private.save_rating(p_game_id bigint, p_values jsonb, p_expected_updated_at timestamptz)
returns timestamptz language plpgsql security definer set search_path = '' as $$
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
  if entry.completed_on is distinct from previous.completed_on and entry.completed_on > (now() at time zone 'UTC')::date then
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

create or replace function private.validate_entry_dates() returns trigger language plpgsql security invoker set search_path='' as $$
declare launched date; previous public.ratings;
begin
  -- Check each changed field independently; historical values stay untouched.
  if TG_OP='UPDATE' then previous:=old;
  else select * into previous from public.ratings where profile_id=new.profile_id and game_id=new.game_id;
  end if;
  select released_on into launched from public.games where id=new.game_id;
  if new.completed_on is distinct from previous.completed_on and
    (new.completed_on > (clock_timestamp() at time zone 'UTC')::date or (launched is not null and new.completed_on < launched)) then
    raise exception 'Completion date must be between release and today' using errcode='22023';
  end if;
  if new.hours_played is distinct from previous.hours_played and launched is not null and
    new.hours_played > greatest(0,extract(epoch from (clock_timestamp()-(launched::timestamp at time zone 'UTC')))/3600) then
    raise exception 'Playtime cannot exceed elapsed hours since release' using errcode='22023';
  end if;
  return new;
end; $$;
