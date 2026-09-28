-- Run through authenticated administration. All test mutations are rolled back.
begin;

do $verify$
declare
  role_name text;
  table_name text;
  profile_id_value bigint;
  game_id_value bigint;
begin
  foreach role_name in array array['anon', 'authenticated'] loop
    foreach table_name in array array['profiles', 'games', 'ratings'] loop
      if not has_table_privilege(role_name, 'public.' || table_name, 'SELECT') then
        raise exception '% cannot read %', role_name, table_name;
      end if;
      if has_table_privilege(role_name, 'public.' || table_name, 'INSERT')
        or has_table_privilege(role_name, 'public.' || table_name, 'UPDATE')
        or has_table_privilege(role_name, 'public.' || table_name, 'DELETE')
        or has_table_privilege(role_name, 'public.' || table_name, 'TRUNCATE') then
        raise exception '% has unexpected write privileges on %', role_name, table_name;
      end if;
      if not (select relrowsecurity from pg_class where oid = ('public.' || table_name)::regclass) then
        raise exception 'RLS is disabled on %', table_name;
      end if;
    end loop;
  end loop;

  select p.id, g.id into strict profile_id_value, game_id_value
  from public.profiles p cross join public.games g
  where p.handle = 'alexvance' and g.slug = 'cyberpunk-2077';

  begin
    update public.ratings set score = 101
    where profile_id = profile_id_value and game_id = game_id_value;
    raise exception 'Out-of-range score was accepted';
  exception when check_violation then null;
  end;
  begin
    update public.ratings set score = -1
    where profile_id = profile_id_value and game_id = game_id_value;
    raise exception 'Negative score was accepted';
  exception when check_violation then null;
  end;
  begin
    update public.ratings set tier = 'Z'
    where profile_id = profile_id_value and game_id = game_id_value;
    raise exception 'Invalid tier was accepted';
  exception when check_violation then null;
  end;
  begin
    insert into public.ratings (profile_id, game_id, score)
    values (profile_id_value, game_id_value, 50);
    raise exception 'Duplicate rating was accepted';
  exception when unique_violation then null;
  end;
  begin
    insert into public.ratings (profile_id, game_id, score)
    values (profile_id_value, -1, 50);
    raise exception 'Missing game foreign key was accepted';
  exception when foreign_key_violation then null;
  end;

  -- This valid score/tier combination proves tier does not follow score.
  update public.ratings set score = 0, tier = 'S'
  where profile_id = profile_id_value and game_id = game_id_value;
  if not exists (select 1 from public.ratings
    where profile_id = profile_id_value and game_id = game_id_value
      and score = 0 and tier = 'S') then
    raise exception 'Score and tier are not independent';
  end if;
end
$verify$;

-- Create an unpublished profile only within this rolled-back test transaction.
insert into public.profiles (handle, display_name, is_sample)
values ('verification-private-' || txid_current(), 'Private verification sample', true);
insert into public.ratings (profile_id, game_id, score)
select p.id, g.id, 50 from public.profiles p cross join public.games g
where p.handle = 'verification-private-' || txid_current() and g.slug = 'elden-ring';

set local role anon;
do $verify$
begin
  if exists (select 1 from public.profiles where not is_public) then
    raise exception 'Anonymous reader can see an unpublished profile';
  end if;
  if exists (select 1 from public.ratings r where not exists
    (select 1 from public.profiles p where p.id = r.profile_id and p.is_public)) then
    raise exception 'Anonymous reader can see an unpublished profile rating';
  end if;
  if (select count(*) from public.games) <> 32
    or (select count(*) from public.profiles) <> 1
    or (select count(*) from public.ratings) <> 32 then
    raise exception 'Anonymous sample read counts are incorrect';
  end if;
end
$verify$;

set local role authenticated;
do $verify$
begin
  if exists (select 1 from public.profiles where not is_public)
    or (select count(*) from public.ratings) <> 32 then
    raise exception 'Authenticated role bypasses publication rules';
  end if;
end
$verify$;

reset role;
rollback;
