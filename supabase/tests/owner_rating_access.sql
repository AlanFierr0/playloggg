-- Run administratively after the owner migration. All fixtures are rolled back.
begin;
create temporary table owner_test_context as
  select gen_random_uuid() as owner_a, gen_random_uuid() as owner_b,
    (select id from public.games order by id limit 1) as game_a,
    (select id from public.games order by id offset 1 limit 1) as game_b,
    (select id from public.profiles where is_sample and is_public limit 1) as sample_profile;
grant select on owner_test_context to authenticated, anon;
insert into auth.users (id, aud, role, email)
  select owner_a, 'authenticated', 'authenticated', 'owner-a@example.invalid' from owner_test_context
  union all select owner_b, 'authenticated', 'authenticated', 'owner-b@example.invalid' from owner_test_context;
insert into public.profiles (handle, display_name, owner_user_id)
  select 'test-' || owner_a, 'Owner A', owner_a from owner_test_context
  union all select 'test-' || owner_b, 'Owner B', owner_b from owner_test_context;
alter table owner_test_context add column profile_a bigint, add column profile_b bigint;
update owner_test_context set
  profile_a = (select id from public.profiles where owner_user_id = owner_a),
  profile_b = (select id from public.profiles where owner_user_id = owner_b);
insert into public.ratings (profile_id, game_id, score, tier)
  select profile_b, game_a, 75, 'S' from owner_test_context;

set local role authenticated;
select set_config('request.jwt.claim.sub', owner_a::text, true),
  set_config('request.jwt.claims', json_build_object('sub', owner_a, 'role', 'authenticated')::text, true)
  from owner_test_context;
do $$
declare c record; affected integer;
begin
  select * into c from owner_test_context;
  if (select count(*) from public.profiles where id = c.profile_a) <> 1 then raise exception 'Owner cannot read private profile'; end if;
  if exists (select 1 from public.profiles where id = c.profile_b) then raise exception 'Other private profile leaked'; end if;
  if exists (select 1 from public.ratings where profile_id = c.profile_b) then raise exception 'Other private ratings leaked'; end if;
  insert into public.ratings (profile_id, game_id, score, tier, review, updated_at)
    values (c.profile_a, c.game_a, 0, null, 'Saved review', now());
  insert into public.ratings (profile_id, game_id, score, tier, review, updated_at)
    values (c.profile_a, c.game_a, 95, 'B', null, now())
    on conflict (profile_id, game_id) do update set
      profile_id = excluded.profile_id, game_id = excluded.game_id, score = excluded.score,
      tier = excluded.tier, review = excluded.review, updated_at = excluded.updated_at;
  if not exists (select 1 from public.ratings where profile_id = c.profile_a and score = 95 and tier = 'B' and review is null) then raise exception 'Upsert failed'; end if;
  begin
    insert into public.ratings (profile_id, game_id, score) values (c.profile_b, c.game_b, 1);
    raise exception 'Other profile insert allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.ratings (profile_id, game_id, score) values (c.sample_profile, c.game_a, 1);
    raise exception 'Sample profile insert allowed';
  exception when insufficient_privilege then null; end;
  update public.ratings set score = 1 where profile_id = c.profile_b;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Other profile update allowed'; end if;
  begin
    update public.ratings set profile_id = c.profile_b where profile_id = c.profile_a;
    raise exception 'Ownership reassignment allowed';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.ratings where profile_id = c.profile_a;
    raise exception 'Deletion allowed';
  exception when insufficient_privilege then null; end;
  begin
    update public.profiles set owner_user_id = c.owner_a where id = c.sample_profile;
    raise exception 'Profile claiming allowed';
  exception when insufficient_privilege then null; end;
  begin
    update public.games set title = 'Forged' where id = c.game_a;
    raise exception 'Catalog editing allowed';
  exception when insufficient_privilege then null; end;
end $$;

set local role anon;
select set_config('request.jwt.claim.sub', '', true), set_config('request.jwt.claims', '{}', true);
do $$
declare c record;
begin
  select * into c from owner_test_context;
  if exists (select 1 from public.profiles where id in (c.profile_a, c.profile_b)) then raise exception 'Anonymous private profile leak'; end if;
  if exists (select 1 from public.ratings where profile_id in (c.profile_a, c.profile_b)) then raise exception 'Anonymous private rating leak'; end if;
  if not exists (select 1 from public.profiles where id = c.sample_profile) then raise exception 'Public sample reads broken'; end if;
  begin
    insert into public.ratings (profile_id, game_id, score) values (c.profile_a, c.game_a, 1);
    raise exception 'Anonymous write allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform owner_user_id from public.profiles;
    raise exception 'Anonymous ownership IDs exposed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'Owner insert/upsert, private reads, cross-owner isolation, sample protection, anonymous denial and catalog protection passed' as verification;
rollback;
