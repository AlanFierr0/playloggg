-- Isolated temporary identities; all data writes roll back.
begin;
create temporary table identity_context as select gen_random_uuid() as user_id,
  gen_random_uuid() as stranger_id, (select array_agg(id order by id) from public.games) as games;
alter table identity_context add column profile_id bigint;
grant select on identity_context to anon, authenticated;
insert into auth.users(id,aud,role,email)
select user_id,'authenticated','authenticated','identity-fixture@example.invalid' from identity_context;
insert into public.profiles(handle,display_name,owner_user_id,bio,location,platform_preference)
select 'identity_' || left(replace(user_id::text,'-',''),16),'Identity fixture',user_id,'Fixture bio','Fixture location','PC' from identity_context;
update identity_context set profile_id=(select id from public.profiles where owner_user_id=user_id);
set local role authenticated;
select set_config('request.jwt.claim.sub',user_id::text,true) from identity_context;
do $$ declare c record; begin
  select * into c from identity_context;
  perform public.set_profile_favorite(c.games[1],true,1);
  perform public.set_profile_favorite(c.games[2],true,1);
  if (select count(*) from public.profile_favorites where profile_id=c.profile_id) <> 2 then raise exception 'Displacement removed favorite'; end if;
  if not exists(select 1 from public.profile_favorites where profile_id=c.profile_id and game_id=c.games[1] and featured_slot is null) then raise exception 'Old slot not cleared'; end if;
  if exists(select 1 from public.ratings where profile_id=c.profile_id) then raise exception 'Favorite created rating'; end if;
  begin perform public.set_profile_favorite(c.games[1],true,5); raise exception 'Invalid slot accepted'; exception when invalid_parameter_value then null; end;
  begin perform public.set_profile_favorite(9223372036854775807,true,1); raise exception 'Unknown game accepted'; exception when foreign_key_violation then null; end;
  if not exists(select 1 from public.profile_favorites where profile_id=c.profile_id and game_id=c.games[2] and featured_slot=1) then raise exception 'Failed save changed featured slot'; end if;
  insert into public.ratings(profile_id,game_id,score,tier,status) values(c.profile_id,c.games[2],0,'S','completed');
  perform public.set_profile_favorite(c.games[2],false,null);
  if not exists(select 1 from public.ratings where profile_id=c.profile_id and game_id=c.games[2] and score=0 and tier='S' and status='completed') then raise exception 'Favorite removal changed rating'; end if;
end $$;
select set_config('request.jwt.claim.sub',stranger_id::text,true) from identity_context;
do $$ declare c record; changed integer; begin
  select * into c from identity_context;
  if exists(select 1 from public.profile_favorites where profile_id=c.profile_id) then raise exception 'Private favorite leaked'; end if;
  begin insert into public.profile_favorites(profile_id,game_id) values(c.profile_id,c.games[3]); raise exception 'Other owner insert accepted'; exception when insufficient_privilege then null; end;
  update public.profile_favorites set featured_slot=4 where profile_id=c.profile_id; get diagnostics changed=row_count;
  if changed <> 0 then raise exception 'Other owner update accepted'; end if;
  delete from public.profile_favorites where profile_id=c.profile_id; get diagnostics changed=row_count;
  if changed <> 0 then raise exception 'Other owner delete accepted'; end if;
  begin perform public.set_profile_favorite(c.games[1],true,1); raise exception 'Unowned RPC accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
  if exists(select 1 from public.profile_favorites where profile_id=(select profile_id from identity_context)) then raise exception 'Guest private favorite leaked'; end if;
  begin perform public.set_profile_favorite((select games[1] from identity_context),true,1); raise exception 'Guest RPC accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.profiles set is_public=true where id=(select profile_id from identity_context);
set local role anon;
do $$ begin
  if (select count(*) from public.profile_favorites where profile_id=(select profile_id from identity_context)) <> 1 then raise exception 'Published favorite unreadable'; end if;
  if not exists(select 1 from public.profiles where id=(select profile_id from identity_context) and bio='Fixture bio') then raise exception 'Published identity unreadable'; end if;
end $$;
reset role;
update public.profiles set is_public=false where id=(select profile_id from identity_context);
set local role anon;
do $$ begin
  if exists(select 1 from public.profile_favorites where profile_id=(select profile_id from identity_context)) then raise exception 'Unpublishing leaked favorite'; end if;
end $$;
reset role;
rollback;
