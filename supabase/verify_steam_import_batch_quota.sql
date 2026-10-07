-- Runnable quota-boundary verification. All synthetic counters roll back.
begin;
set local role service_role;
do $$
declare quota_actor text:='codex-quota-check-'||gen_random_uuid()::text; result record; bad integer;
begin
 if has_function_privilege('anon','public.consume_operation_limit_batch(text,text,integer,integer,integer)','EXECUTE')
    or has_function_privilege('authenticated','public.consume_operation_limit_batch(text,text,integer,integer,integer)','EXECUTE') then
   raise exception 'Batch quotas must be server-only';
 end if;
 select * into result from public.consume_operation_limit_batch(quota_actor,'minute_test',2,3,10);
 if result.allowed_count<>2 or result.retry_after<>0 then raise exception 'Initial batch was not charged'; end if;
 select * into result from public.consume_operation_limit_batch(quota_actor,'minute_test',2,3,10);
 if result.allowed_count<>1 or result.retry_after<=0 then raise exception 'Minute limit was exceeded'; end if;
 if (select used from private.operation_limits where operation='minute_test' and period_seconds=60 and operation_limits.actor=quota_actor)<>3
    or (select used from private.operation_limits where operation='minute_test' and period_seconds=86400 and operation_limits.actor=quota_actor)<>3 then
   raise exception 'Each admitted game must consume both counters';
 end if;
 if public.consume_operation_limit(quota_actor,'minute_test',60,3)<=0 then raise exception 'Single-game calls must share the batch counter'; end if;
 select * into result from public.consume_operation_limit_batch(quota_actor,'day_test',2,100,3);
 select * into result from public.consume_operation_limit_batch(quota_actor,'day_test',2,100,3);
 if result.allowed_count<>1 or result.retry_after<=0 then raise exception 'Daily limit was exceeded'; end if;
 select * into result from public.consume_operation_limit_batch(quota_actor,'full_batch',25,120,1500);
 if result.allowed_count<>25 or result.retry_after<>0 then raise exception 'Bounded full batch failed'; end if;
 if (select used from private.operation_limits where operation='full_batch' and period_seconds=86400 and operation_limits.actor=quota_actor)<>25 then raise exception 'Batch was undercharged'; end if;
 foreach bad in array array[0,26,null] loop
   begin
     perform * from public.consume_operation_limit_batch(quota_actor,'invalid_test',bad,120,1500);
     raise exception 'Invalid batch accepted';
   exception when raise_exception then
     if sqlerrm<>'Invalid quota' then raise; end if;
   end;
 end loop;
end;$$;
rollback;
