-- Administrative verification after the optional-score/status migration.
-- All fixtures are isolated from the real owner and rolled back.
begin;
create temporary table status_test_context as
  select gen_random_uuid() as user_id,
    (select id from public.games order by id limit 1) as game_id;
grant select on status_test_context to authenticated, anon;
insert into auth.users (id, aud, role, email)
  select user_id, 'authenticated', 'authenticated', 'status-owner@example.invalid' from status_test_context;
insert into public.profiles (handle, display_name, owner_user_id)
  select 'test-' || user_id, 'Status test owner', user_id from status_test_context;
alter table status_test_context add column profile_id bigint;
update status_test_context set profile_id = (select id from public.profiles where owner_user_id = user_id);

set local role authenticated;
select set_config('request.jwt.claim.sub', user_id::text, true),
  set_config('request.jwt.claims', json_build_object('sub', user_id, 'role', 'authenticated')::text, true)
  from status_test_context;
do $$
declare c record;
begin
  select * into c from status_test_context;
  insert into public.ratings (profile_id, game_id, score, tier, status, review, updated_at)
    values (c.profile_id, c.game_id, null, 'B', 'backlog', 'Unrated review', now());
  if not exists (select 1 from public.ratings where profile_id = c.profile_id and score is null and status = 'backlog' and tier = 'B') then raise exception 'Unrated backlog insert failed'; end if;
  insert into public.ratings (profile_id, game_id, score, tier, status, review, updated_at)
    values (c.profile_id, c.game_id, null, 'B', 'playing', 'Unrated review', now())
    on conflict (profile_id, game_id) do update set profile_id = excluded.profile_id,
      game_id = excluded.game_id, score = excluded.score, tier = excluded.tier,
      status = excluded.status, review = excluded.review, updated_at = excluded.updated_at;
  if not exists (select 1 from public.ratings where profile_id = c.profile_id and score is null and status = 'playing') then raise exception 'Status upsert failed'; end if;
  update public.ratings set score = 0, status = 'completed' where profile_id = c.profile_id;
  if not exists (select 1 from public.ratings where profile_id = c.profile_id and score = 0) then raise exception 'Score zero lost'; end if;
  update public.ratings set score = null, status = null where profile_id = c.profile_id;
  if not exists (select 1 from public.ratings where profile_id = c.profile_id and score is null and status is null and tier = 'B') then raise exception 'Clear score/status changed independent tier'; end if;
  begin
    update public.ratings set status = 'invalid' where profile_id = c.profile_id;
    raise exception 'Invalid status accepted';
  exception when check_violation then null; end;
  begin
    update public.ratings set score = 101 where profile_id = c.profile_id;
    raise exception 'Invalid score accepted';
  exception when check_violation then null; end;
end $$;
set local role anon;
do $$
begin
  if exists (select 1 from public.ratings where profile_id = (select profile_id from status_test_context)) then raise exception 'Private unscored entry leaked'; end if;
  begin
    update public.ratings set status = 'backlog';
    raise exception 'Anonymous status update accepted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'Null-score backlog/playing saves, zero-score transition, clear status, constraints and anonymous isolation passed' as verification;
rollback;
