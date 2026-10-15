-- Administrative post-migration verification; fixtures roll back.
begin;
create temporary table details_test_context as
  select gen_random_uuid() as user_id,
    (select id from public.games order by id limit 1) as game_id;
grant select on details_test_context to authenticated, anon;
insert into auth.users (id, aud, role, email)
  select user_id, 'authenticated', 'authenticated', 'details-owner@example.invalid' from details_test_context;
insert into public.profiles (handle, display_name, owner_user_id, is_public, is_discoverable)
  select 'test_' || left(replace(user_id::text,'-',''),16), 'Details test owner', user_id, false, false from details_test_context;
alter table details_test_context add column profile_id bigint;
update details_test_context set profile_id = (select id from public.profiles where owner_user_id = user_id);
set local role authenticated;
select set_config('request.jwt.claim.sub', user_id::text, true),
  set_config('request.jwt.claims', json_build_object('sub', user_id, 'role', 'authenticated')::text, true)
  from details_test_context;
do $$
declare c record; invalid_hours double precision; changed integer; console_platform text;
begin
  select * into c from details_test_context;
  insert into public.ratings (profile_id, game_id, score, tier, status, platform, hours_played, completed_on)
    values (c.profile_id, c.game_id, null, 'B', 'playing', 'steam_deck', 78.45, '2024-02-29');
  if not exists (select 1 from public.ratings where profile_id = c.profile_id and score is null
    and status = 'playing' and platform = 'steam_deck' and hours_played = 78.45
    and completed_on = '2024-02-29') then raise exception 'Play details insert/independent date failed'; end if;
  insert into public.ratings (profile_id, game_id, score, platform, hours_played, completed_on)
    values (c.profile_id, c.game_id, null, 'pc', 0, null)
    on conflict (profile_id, game_id) do update set platform = excluded.platform,
      hours_played = excluded.hours_played, completed_on = excluded.completed_on;
  if not exists (select 1 from public.ratings where profile_id = c.profile_id and platform = 'pc'
    and hours_played = 0 and completed_on is null and tier = 'B' and status = 'playing')
    then raise exception 'Upsert lost zero hours or changed independent fields'; end if;
  foreach console_platform in array array['ps1','ps2','ps3','ps4','ps5','psp','ps_vita','xbox','xbox_360','xbox_one','xbox_series_x','xbox_series_s'] loop
    update public.ratings set platform=console_platform where profile_id=c.profile_id;
    if not exists(select 1 from public.ratings where profile_id=c.profile_id and platform=console_platform) then
      raise exception 'Console platform did not persist';
    end if;
  end loop;
  update public.ratings set platform = null, hours_played = null, completed_on = null where profile_id = c.profile_id;
  if not exists (select 1 from public.ratings where profile_id = c.profile_id and platform is null
    and hours_played is null and completed_on is null) then raise exception 'Clear play details failed'; end if;
  begin
    update public.ratings set platform = 'invalid' where profile_id = c.profile_id;
    raise exception 'Invalid platform accepted';
  exception when check_violation then null; end;
  foreach invalid_hours in array array[-1::double precision, 'Infinity'::double precision, '-Infinity'::double precision, 'NaN'::double precision] loop
    begin
      update public.ratings set hours_played = invalid_hours where profile_id = c.profile_id;
      raise exception 'Invalid hours accepted';
    exception when check_violation then null; end;
  end loop;
  begin
    update public.ratings set completed_on = 'infinity' where profile_id = c.profile_id;
    raise exception 'Infinite date accepted';
  exception when check_violation then null; end;
  begin
    update public.ratings set completed_on = '10000-01-01' where profile_id = c.profile_id;
    raise exception 'Out-of-range date accepted';
  exception when check_violation then null; end;
  begin
    update public.ratings set completed_on = '2023-02-29' where profile_id = c.profile_id;
    raise exception 'Impossible date accepted';
  exception when datetime_field_overflow then null; end;
end $$;
select set_config('request.jwt.claim.sub', gen_random_uuid()::text, true),
  set_config('request.jwt.claims', '{"role":"authenticated"}', true);
do $$
declare changed integer;
begin
  if exists (select 1 from public.ratings where profile_id = (select profile_id from details_test_context)) then raise exception 'Cross-owner private details leaked'; end if;
  update public.ratings set platform = 'xbox_series_x' where profile_id = (select profile_id from details_test_context);
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'Cross-owner details update accepted'; end if;
end $$;
set local role anon;
do $$
begin
  if exists (select 1 from public.ratings where profile_id = (select profile_id from details_test_context)) then raise exception 'Anonymous private details leaked'; end if;
  begin
    update public.ratings set hours_played = 0;
    raise exception 'Anonymous details update accepted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'Optional play details, decimal/zero hours, independent dates, clearing, constraints and owner isolation passed' as verification;
rollback;
