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

revoke all on function private.save_rating(bigint,jsonb,timestamptz) from public,anon;
grant execute on function private.save_rating(bigint,jsonb,timestamptz) to authenticated;
create or replace function public.save_rating(p_game_id bigint,p_values jsonb,p_expected_updated_at timestamptz)
returns timestamptz language sql security invoker set search_path='' as $$
  select private.save_rating(p_game_id,p_values,p_expected_updated_at);
$$;
revoke all on function public.save_rating(bigint,jsonb,timestamptz) from public,anon;
grant execute on function public.save_rating(bigint,jsonb,timestamptz) to authenticated;

create function private.validate_entry_dates() returns trigger language plpgsql security invoker set search_path='' as $$
declare launched date;
begin
  -- Validate changed values, without rewriting or blocking unrelated edits to legacy entries.
  if TG_OP='UPDATE' and new.hours_played is not distinct from old.hours_played and new.completed_on is not distinct from old.completed_on then return new; end if;
  if TG_OP='INSERT' and exists(select 1 from public.ratings r where r.profile_id=new.profile_id and r.game_id=new.game_id and r.hours_played is not distinct from new.hours_played and r.completed_on is not distinct from new.completed_on) then return new; end if;
  select released_on into launched from public.games where id=new.game_id;
  if new.completed_on > (clock_timestamp() at time zone 'UTC')::date or (launched is not null and new.completed_on < launched) then
    raise exception 'Completion date must be between release and today' using errcode='22023';
  end if;
  if launched is not null and new.hours_played > greatest(0,extract(epoch from (clock_timestamp()-(launched::timestamp at time zone 'UTC')))/3600) then
    raise exception 'Playtime cannot exceed elapsed hours since release' using errcode='22023';
  end if;
  return new;
end; $$;
revoke all on function private.validate_entry_dates() from public,anon,authenticated;
create trigger validate_entry_dates before insert or update of hours_played,completed_on on public.ratings
for each row execute function private.validate_entry_dates();

create function private.invalidate_review_votes() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.review is distinct from old.review then
    delete from public.review_votes where reviewer_profile_id=new.profile_id and game_id=new.game_id;
  end if;
  return new;
end; $$;
revoke all on function private.invalidate_review_votes() from public,anon,authenticated;
create trigger invalidate_review_votes after update of review on public.ratings
for each row execute function private.invalidate_review_votes();
