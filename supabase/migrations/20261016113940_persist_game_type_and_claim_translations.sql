alter table public.ratings add column play_style text check(play_style in ('campaign','ongoing'));
comment on column public.ratings.play_style is 'Owner-selected game type; null retains legacy detection/status fallback.';

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
  if not (p_values ? 'play_style') then entry.play_style:=previous.play_style; end if;
  if entry.completed_on is distinct from previous.completed_on and entry.completed_on > (now() at time zone 'UTC')::date then
    raise exception 'Completion date cannot be in the future' using errcode = '22023';
  end if;
  insert into public.ratings(profile_id, game_id, score, tier, tier_manual, status, play_style, platform, tags, hours_played, completed_on, review, updated_at)
  values(owner_id, p_game_id, entry.score, entry.tier, coalesce(entry.tier_manual, false), entry.status, entry.play_style, entry.platform, coalesce(entry.tags, '{}'), entry.hours_played, entry.completed_on, entry.review, clock_timestamp())
  on conflict(profile_id, game_id) do update set score = excluded.score, tier = excluded.tier,
    tier_manual = excluded.tier_manual, status = excluded.status, play_style = excluded.play_style, platform = excluded.platform,
    tags = excluded.tags, hours_played = excluded.hours_played, completed_on = excluded.completed_on,
    review = excluded.review, updated_at = excluded.updated_at
    where public.ratings.updated_at is not distinct from p_expected_updated_at returning updated_at into stamp;
  if stamp is null then raise exception 'Entry changed' using errcode = '40001'; end if;
  return stamp;
end;
$$;


-- A lease survives cold instances and is released only by its current worker.
create table private.review_translation_claims (
 profile_id bigint not null, game_id bigint not null, target text not null check(target in ('EN','ES')),
 content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'), token uuid not null, expires_at timestamptz not null,
 primary key(profile_id,game_id,target,content_hash),
 foreign key(profile_id,game_id) references public.ratings(profile_id,game_id) on delete cascade
);
alter table private.review_translation_claims enable row level security;
revoke all on private.review_translation_claims from public,anon,authenticated;
grant select,insert,update,delete on private.review_translation_claims to service_role;
create function public.claim_review_translation(p_profile_id bigint,p_game_id bigint,p_hash text,p_target text,p_token uuid)
returns boolean language plpgsql security invoker set search_path='' as $$
declare claimed uuid;
begin
 delete from private.review_translation_claims where expires_at < clock_timestamp();
 if exists(select 1 from private.review_translations where profile_id=p_profile_id and game_id=p_game_id and target=p_target and content_hash=p_hash) then return false; end if;
 insert into private.review_translation_claims(profile_id,game_id,target,content_hash,token,expires_at)
 values(p_profile_id,p_game_id,p_target,p_hash,p_token,clock_timestamp()+interval '60 seconds')
 on conflict do nothing returning token into claimed;
 return claimed is not null;
end; $$;
create function public.release_review_translation(p_profile_id bigint,p_game_id bigint,p_hash text,p_target text,p_token uuid)
returns void language sql security invoker set search_path='' as $$
 delete from private.review_translation_claims where profile_id=p_profile_id and game_id=p_game_id and target=p_target and content_hash=p_hash and token=p_token;
$$;
revoke all on function public.claim_review_translation(bigint,bigint,text,text,uuid),public.release_review_translation(bigint,bigint,text,text,uuid) from public,anon,authenticated;
grant execute on function public.claim_review_translation(bigint,bigint,text,text,uuid),public.release_review_translation(bigint,bigint,text,text,uuid) to service_role;
