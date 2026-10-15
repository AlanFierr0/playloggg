create table private.steam_completion_skips (
 owner_id uuid not null references auth.users(id) on delete cascade,
 game_id bigint not null references public.games(id) on delete cascade,
 primary key(owner_id,game_id)
);
create index steam_completion_skips_game on private.steam_completion_skips(game_id);
alter table private.steam_completion_skips enable row level security;
revoke all on private.steam_completion_skips from public,anon,authenticated;
grant select,insert on private.steam_completion_skips to service_role;
create function public.read_steam_completion_skips(p_owner uuid) returns bigint[] language sql stable security invoker set search_path='' as $$
 select coalesce(array_agg(game_id),'{}'::bigint[]) from private.steam_completion_skips where owner_id=p_owner;
$$;
create function public.skip_steam_completion_game(p_owner uuid,p_game bigint) returns void language plpgsql security invoker set search_path='' as $$
begin
 if not exists(select 1 from public.ratings r join public.profiles p on p.id=r.profile_id where p.owner_user_id=p_owner and r.game_id=p_game and r.platform='pc') then raise exception 'Owned PC log required';end if;
 insert into private.steam_completion_skips(owner_id,game_id) values(p_owner,p_game) on conflict do nothing;
end;$$;
revoke all on function public.read_steam_completion_skips(uuid),public.skip_steam_completion_game(uuid,bigint) from public,anon,authenticated;
grant execute on function public.read_steam_completion_skips(uuid),public.skip_steam_completion_game(uuid,bigint) to service_role;
