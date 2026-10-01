-- Policy verification only. Temporary metadata, identities and profiles roll back;
-- this does not create, read or delete any real Storage files.
begin;
create temporary table picture_context as select gen_random_uuid() as user_id,
  gen_random_uuid() as stranger_id, null::bigint as profile_id, null::text as object_name;
grant select on picture_context to authenticated, anon;
insert into auth.users(id,aud,role,email)
select user_id,'authenticated','authenticated','picture-fixture@example.invalid' from picture_context;
insert into public.profiles(handle,display_name,owner_user_id)
select 'picture_' || left(replace(user_id::text,'-',''),16),'Picture fixture',user_id from picture_context;
update picture_context set profile_id=(select id from public.profiles where owner_user_id=user_id);
update picture_context set object_name=profile_id::text || '/' || gen_random_uuid()::text || '.webp';
set local role authenticated;
select set_config('request.jwt.claim.sub',user_id::text,true) from picture_context;
insert into storage.objects(bucket_id,name) select 'profile-pictures',object_name from picture_context;
do $$ begin
  if not exists(select 1 from storage.objects where bucket_id='profile-pictures' and name=(select object_name from picture_context)) then raise exception 'Owner picture unreadable'; end if;
end $$;
select set_config('request.jwt.claim.sub',stranger_id::text,true) from picture_context;
do $$ begin
  if exists(select 1 from storage.objects where bucket_id='profile-pictures' and name=(select object_name from picture_context)) then raise exception 'Private picture leaked to another account'; end if;
  begin
    insert into storage.objects(bucket_id,name) select 'profile-pictures',profile_id::text || '/' || gen_random_uuid()::text || '.webp' from picture_context;
    raise exception 'Another account uploaded to owner folder';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.profiles set is_public=true where id=(select profile_id from picture_context);
set local role anon;
do $$ begin
  if exists(select 1 from storage.objects where bucket_id='profile-pictures' and name=(select object_name from picture_context)) then raise exception 'Public profile exposed raw private bucket'; end if;
end $$;
reset role;
rollback;
