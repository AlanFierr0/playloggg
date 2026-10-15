create table private.steam_completion_classifications (
 app_id bigint primary key check(app_id between 1 and 4294967295),
 content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),
 achievement_ids jsonb not null check(jsonb_typeof(achievement_ids)='array' and jsonb_array_length(achievement_ids)<=32),
 updated_at timestamptz not null default now()
);
alter table private.steam_completion_classifications enable row level security;
revoke all on private.steam_completion_classifications from public,anon,authenticated;
grant usage on schema private to service_role;
grant select,insert,update on private.steam_completion_classifications to service_role;
create function public.read_steam_completion_classification(p_app_id bigint,p_hash text) returns jsonb language sql stable security invoker set search_path='' as $$
 select achievement_ids from private.steam_completion_classifications where app_id=p_app_id and content_hash=p_hash;
$$;
create function public.store_steam_completion_classification(p_app_id bigint,p_hash text,p_ids jsonb) returns void language plpgsql security invoker set search_path='' as $$
begin
 if p_ids is null or jsonb_typeof(p_ids)<>'array' then raise exception 'Invalid achievement IDs';end if;
 if jsonb_array_length(p_ids)>32 or exists(select 1 from jsonb_array_elements(p_ids) value where jsonb_typeof(value)<>'string' or length(value#>>'{}') not between 1 and 256)
 or (select count(distinct value) from jsonb_array_elements(p_ids) value)<>jsonb_array_length(p_ids) then raise exception 'Invalid achievement IDs';end if;
 insert into private.steam_completion_classifications(app_id,content_hash,achievement_ids) values(p_app_id,p_hash,p_ids)
 on conflict(app_id) do update set content_hash=excluded.content_hash,achievement_ids=excluded.achievement_ids,updated_at=now();
end;$$;
revoke all on function public.read_steam_completion_classification(bigint,text),public.store_steam_completion_classification(bigint,text,jsonb) from public,anon,authenticated;
grant execute on function public.read_steam_completion_classification(bigint,text),public.store_steam_completion_classification(bigint,text,jsonb) to service_role;
