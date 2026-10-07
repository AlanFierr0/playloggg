-- Reuse the existing atomic counters in one bounded server RPC.
-- No new quota storage, Auth/RLS policies, or application-role write grants.
create function public.consume_operation_limit_batch(
 p_actor text,p_operation text,p_count integer,p_minute_limit integer,p_daily_limit integer
) returns table(allowed_count integer,retry_after integer)
language plpgsql security invoker set search_path='' as $$
begin
 if p_count is null or p_count not between 1 and 25
    or p_minute_limit is null or p_minute_limit not between 1 and 5000
    or p_daily_limit is null or p_daily_limit not between 1 and 5000 then
   raise exception 'Invalid quota';
 end if;
 allowed_count:=0; retry_after:=0;
 for i in 1..p_count loop
   retry_after:=public.consume_operation_limit(p_actor,p_operation,60,p_minute_limit);
   if retry_after>0 then return next; return; end if;
   retry_after:=public.consume_operation_limit(p_actor,p_operation,86400,p_daily_limit);
   if retry_after>0 then return next; return; end if;
   allowed_count:=allowed_count+1;
 end loop;
 return next;
end;$$;
revoke all on function public.consume_operation_limit_batch(text,text,integer,integer,integer) from public,anon,authenticated;
grant execute on function public.consume_operation_limit_batch(text,text,integer,integer,integer) to service_role;
