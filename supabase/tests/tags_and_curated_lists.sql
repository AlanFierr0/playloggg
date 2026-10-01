-- Administrative verification in isolated fixtures; every write rolls back.
begin;
create temporary table collection_context as select gen_random_uuid() as user_id,
  gen_random_uuid() as stranger_id, (select array_agg(id order by id) from public.games) as games;
alter table collection_context add column profile_id bigint;
alter table collection_context add column list_id bigint;
grant select, update on collection_context to authenticated, anon;
insert into auth.users(id,aud,role,email) select user_id,'authenticated','authenticated','collections@example.invalid' from collection_context;
insert into public.profiles(handle,display_name,owner_user_id)
  select 'test_' || left(replace(user_id::text,'-',''),16),'Collections test',user_id from collection_context;
update collection_context set profile_id=(select id from public.profiles where owner_user_id=user_id);
set local role authenticated;
select set_config('request.jwt.claim.sub',user_id::text,true) from collection_context;
do $$
declare c record; result jsonb; invalid text[];
begin
  select * into c from collection_context;
  insert into public.ratings(profile_id,game_id,score,tags) values(c.profile_id,c.games[1],null,array['Favorites','Steam Deck']);
  foreach invalid slice 1 in array array[array['','bad'],array['x','X'],array[' padded','bad'],array[E'new\nline','bad']] loop
    begin update public.ratings set tags=invalid where profile_id=c.profile_id; raise exception 'Invalid tags accepted'; exception when check_violation then null; end;
  end loop;
  begin update public.ratings set tags=array_fill('x'::text,array[21]) where profile_id=c.profile_id; raise exception 'Too many tags accepted'; exception when check_violation then null; end;
  begin update public.ratings set tags=array[repeat('x',49)] where profile_id=c.profile_id; raise exception 'Long tag accepted'; exception when check_violation then null; end;
  begin update public.ratings set tags=array[null::text] where profile_id=c.profile_id; raise exception 'Null tag accepted'; exception when check_violation then null; end;
  update public.ratings set tags='{}' where profile_id=c.profile_id;
  if not exists(select 1 from public.ratings where profile_id=c.profile_id and tags='{}' and score is null) then raise exception 'Clear tags failed'; end if;
  result:=public.save_curated_list(c.profile_id,null,'Favorites',array[c.games[2],c.games[1]],null);
  update collection_context set list_id=(result->>'id')::bigint;
  c.list_id:=(result->>'id')::bigint;
  if (select array_agg(game_id order by position) from public.curated_list_items where list_id=c.list_id) <> array[c.games[2],c.games[1]] then raise exception 'Custom order lost'; end if;
  if (select count(*) from public.ratings where profile_id=c.profile_id) <> 1 then raise exception 'List created a rating'; end if;
  result:=public.save_curated_list(c.profile_id,c.list_id,'Renamed',array[c.games[1],c.games[3]],1);
  if (result->>'revision')::int <> 2 then raise exception 'Revision missing'; end if;
  begin perform public.save_curated_list(c.profile_id,c.list_id,'Stale','{}',1); raise exception 'Stale draft accepted'; exception when serialization_failure then null; end;
  begin perform public.save_curated_list(c.profile_id,c.list_id,'Invalid game',array[9223372036854775807],2); raise exception 'Invalid game accepted'; exception when foreign_key_violation then null; end;
  begin perform public.save_curated_list(c.profile_id,c.list_id,'Duplicate',array[c.games[1],c.games[1]],2); raise exception 'Duplicate game accepted'; exception when invalid_parameter_value then null; end;
  begin perform public.save_curated_list(c.profile_id,null,'renamed','{}',null); raise exception 'Duplicate name accepted'; exception when unique_violation then null; end;
  if not exists(select 1 from public.curated_lists where id=c.list_id and name='Renamed' and revision=2) or
    (select array_agg(game_id order by position) from public.curated_list_items where list_id=c.list_id) <> array[c.games[1],c.games[3]] then raise exception 'Failed save changed saved list'; end if;
end $$;
select set_config('request.jwt.claim.sub',stranger_id::text,true) from collection_context;
do $$
declare c record; changed int;
begin
  select * into c from collection_context;
  update public.ratings set tags=array['Stolen'] where profile_id=c.profile_id; get diagnostics changed=row_count; if changed<>0 then raise exception 'Cross-owner tags update accepted'; end if;
  if exists(select 1 from public.curated_lists where id=c.list_id) or exists(select 1 from public.curated_list_items where list_id=c.list_id) then raise exception 'Private list leaked to stranger'; end if;
  begin perform public.save_curated_list(c.profile_id,c.list_id,'Stolen','{}',2); raise exception 'Cross-owner RPC accepted'; exception when insufficient_privilege then null; end;
  begin insert into public.curated_list_items values(c.list_id,c.games[4],3); raise exception 'Cross-owner insert accepted'; exception when insufficient_privilege then null; end;
  update public.curated_lists set name='Stolen' where id=c.list_id; get diagnostics changed=row_count; if changed<>0 then raise exception 'Cross-owner update accepted'; end if;
  delete from public.curated_lists where id=c.list_id; get diagnostics changed=row_count; if changed<>0 then raise exception 'Cross-owner delete accepted'; end if;
end $$;
set local role anon;
do $$ begin
  if exists(select 1 from public.curated_lists where id=(select list_id from collection_context)) or exists(select 1 from public.curated_list_items where list_id=(select list_id from collection_context)) then raise exception 'Private list leaked to anonymous'; end if;
  begin perform public.save_curated_list(1,null,'Anonymous','{}',null); raise exception 'Anonymous RPC accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.profiles set is_public=true where id=(select profile_id from collection_context);
set local role anon;
do $$ begin
  if (select count(*) from public.curated_lists where id=(select list_id from collection_context))<>1 or (select count(*) from public.curated_list_items where list_id=(select list_id from collection_context))<>2 then raise exception 'Published lists unreadable'; end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub',stranger_id::text,true) from collection_context;
do $$ begin
  begin perform public.save_curated_list((select profile_id from collection_context),null,'Cross-owner write','{}',null); raise exception 'Cross-owner write accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub',user_id::text,true) from collection_context;
delete from public.curated_lists where id=(select list_id from collection_context) and revision=2;
do $$ begin
  if exists(select 1 from public.curated_list_items where list_id=(select list_id from collection_context)) then raise exception 'Delete did not cascade items'; end if;
  if (select count(*) from public.ratings where profile_id=(select profile_id from collection_context))<>1 then raise exception 'Delete changed ratings'; end if;
end $$;
reset role;
select 'Tags, custom order, atomic rollback, stale drafts, profile visibility and owner isolation passed' as verification;
rollback;
