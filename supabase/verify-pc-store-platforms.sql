-- Copy the live constraint to a temporary table; never modify personal entries.
begin;
do $$
declare rule text; value text;
begin
 select pg_get_constraintdef(oid) into strict rule from pg_constraint
 where conrelid='public.ratings'::regclass and conname='ratings_platform_check';
 execute 'create temporary table verify_platform_values (platform text '||rule||') on commit drop';
 foreach value in array array['pc','pc_battlenet','pc_gog','pc_epic','pc_ea',
  'pc_ubisoft','pc_xbox','pc_other','ps5','xbox_series_x','steam_deck',null]
 loop insert into verify_platform_values values(value); end loop;
 begin
  insert into verify_platform_values values('forged_platform');
  raise exception 'Invalid platform accepted';
 exception when check_violation then null; end;
 if not (select relrowsecurity from pg_class where oid='public.ratings'::regclass)
 then raise exception 'Ratings RLS disabled'; end if;
end $$;
rollback;
