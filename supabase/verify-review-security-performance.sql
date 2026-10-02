-- Run in a transaction and roll back all quota probes. No personal data is changed.
begin;
do $$
begin
 if has_function_privilege('anon','public.consume_operation_limit(text,text,integer,integer)','EXECUTE')
 or has_function_privilege('authenticated','public.consume_operation_limit(text,text,integer,integer)','EXECUTE') then
   raise exception 'Browser role can consume server quota';
 end if;
 if has_table_privilege('anon','private.operation_limits','SELECT')
 or has_table_privilege('authenticated','private.operation_limits','SELECT') then
   raise exception 'Browser role can read quota identities';
 end if;
 if not has_function_privilege('service_role','public.consume_operation_limit(text,text,integer,integer)','EXECUTE') then
   raise exception 'Server cannot consume quota';
 end if;
 if to_regclass('public.profile_activity_game_id_idx') is null then raise exception 'Missing activity index'; end if;
end; $$;
set local role service_role;
do $$
declare actor text := 'verification-' || gen_random_uuid()::text;
begin
 if public.consume_operation_limit(actor,'probe',86400,2) <> 0 then raise exception 'First request rejected'; end if;
 if public.consume_operation_limit(actor,'probe',86400,2) <> 0 then raise exception 'Second request rejected'; end if;
 if public.consume_operation_limit(actor,'probe',86400,2) <= 0 then raise exception 'Over-limit request allowed'; end if;
end; $$;
set local role anon;
select game_id,sample_count from public.community_game_scores() where sample_count < 5;
rollback;
