begin;
do $$
declare owner_a uuid:=gen_random_uuid(); owner_b uuid:=gen_random_uuid(); profile_a bigint; object_prefix text:=gen_random_uuid()::text; result_count int;
begin
 if has_function_privilege('anon','public.account_deletion_objects(uuid)','EXECUTE')
 or has_function_privilege('authenticated','public.account_deletion_objects(uuid)','EXECUTE')
 or has_function_privilege('authenticated','public.clear_account_operation_limits(uuid)','EXECUTE')
 then raise exception 'Deletion RPC exposed'; end if;
 insert into auth.users(id,aud,role,email) values(owner_a,'authenticated','authenticated',object_prefix||'@deletion-test.invalid'),(owner_b,'authenticated','authenticated',object_prefix||'b@deletion-test.invalid');
 insert into public.profiles(owner_user_id,handle,display_name,is_public,is_discoverable) values(owner_a,'del_'||substr(replace(object_prefix,'-',''),1,15),'Rollback verification',false,false) returning id into profile_a;
 insert into storage.objects(bucket_id,name,owner_id) values('profile-pictures',object_prefix||'/a.webp',owner_a::text),('profile-pictures',object_prefix||'/b.webp',owner_b::text),('profile-pictures',profile_a::text||'/legacy.webp',null);
 select count(*) into result_count from public.account_deletion_objects(owner_a);
 if result_count<>2 then raise exception 'File ownership mismatch'; end if;
 perform public.consume_operation_limit(owner_a::text,'deletion-test',60,10);
 perform public.consume_operation_limit(owner_b::text,'deletion-test',60,10);
 begin
  perform public.clear_account_operation_limits(owner_a);
  raise exception 'Counter cleanup allowed with active profile';
 exception when raise_exception then
  if sqlerrm <> 'Remove owned profile before clearing account data' then raise; end if;
 end;
 perform public.delete_owned_profile(owner_a,'del_'||substr(replace(object_prefix,'-',''),1,15));
 perform public.clear_account_operation_limits(owner_a);
 if exists(select 1 from private.operation_limits where actor=owner_a::text)
 or not exists(select 1 from private.operation_limits where actor=owner_b::text)
 then raise exception 'Counter ownership mismatch'; end if;
end; $$;
set local role service_role;
select count(*) as server_can_enumerate from public.account_deletion_objects('00000000-0000-4000-8000-000000000000'::uuid);
rollback;
