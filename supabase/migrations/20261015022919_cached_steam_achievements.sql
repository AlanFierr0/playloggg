create table private.steam_achievement_cache (
 cache_key text primary key check(cache_key ~ '^[a-f0-9]{64}$'),
 owner_id uuid references auth.users(id) on delete cascade,
 data jsonb not null check(jsonb_typeof(data)='object' and octet_length(data::text)<=1048576),
 expires_at timestamptz not null
);
create index steam_achievement_cache_expiry on private.steam_achievement_cache(expires_at);
alter table private.steam_achievement_cache enable row level security;
revoke all on private.steam_achievement_cache from public,anon,authenticated;
grant select,insert,update,delete on private.steam_achievement_cache to service_role;

create function public.read_steam_achievement_cache(p_key text,p_owner uuid) returns jsonb language sql stable security invoker set search_path='' as $$
 select data from private.steam_achievement_cache where cache_key=p_key and owner_id is not distinct from p_owner and expires_at>now();
$$;
create function public.store_steam_achievement_cache(p_key text,p_owner uuid,p_data jsonb,p_seconds integer) returns void language plpgsql security invoker set search_path='' as $$
begin
 if p_seconds is null or p_seconds not in (900,86400) or (p_owner is not null and p_seconds<>900) then raise exception 'Invalid achievement cache lifetime';end if;
 delete from private.steam_achievement_cache where expires_at<=now();
 insert into private.steam_achievement_cache(cache_key,owner_id,data,expires_at)
 values(p_key,p_owner,p_data,now()+make_interval(secs=>p_seconds))
 on conflict(cache_key) do update set owner_id=excluded.owner_id,data=excluded.data,expires_at=excluded.expires_at;
end;$$;
revoke all on function public.read_steam_achievement_cache(text,uuid),public.store_steam_achievement_cache(text,uuid,jsonb,integer) from public,anon,authenticated;
grant execute on function public.read_steam_achievement_cache(text,uuid),public.store_steam_achievement_cache(text,uuid,jsonb,integer) to service_role;
