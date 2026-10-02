-- Trusted server only: enumerate owned files before removing Auth.
create function public.account_deletion_objects(p_owner uuid)
returns table(bucket_id text, object_name text)
language sql stable security invoker set search_path='' as $$
 select o.bucket_id, o.name from storage.objects o
 where o.owner_id=p_owner::text
 or (o.bucket_id='profile-pictures' and exists (
   select 1 from public.profiles p where p.owner_user_id=p_owner
   and split_part(o.name,'/',1)=p.id::text
 ));
$$;
revoke all on function public.account_deletion_objects(uuid) from public,anon,authenticated;
grant execute on function public.account_deletion_objects(uuid) to service_role;

grant delete on private.operation_limits to service_role;
create function public.clear_account_operation_limits(p_owner uuid)
returns void language plpgsql security invoker set search_path='' as $$
begin
 if p_owner is null or exists(select 1 from public.profiles where owner_user_id=p_owner)
 then raise exception 'Remove owned profile before clearing account data'; end if;
 delete from private.operation_limits where actor=p_owner::text;
end;
$$;
revoke all on function public.clear_account_operation_limits(uuid) from public,anon,authenticated;
grant execute on function public.clear_account_operation_limits(uuid) to service_role;
