grant delete on private.steam_completion_skips to service_role;
create function public.restore_steam_completion_game(p_owner uuid,p_game bigint)
returns void language sql security invoker set search_path='' as $$
 delete from private.steam_completion_skips where owner_id=p_owner and game_id=p_game;
$$;
revoke all on function public.restore_steam_completion_game(uuid,bigint) from public,anon,authenticated;
grant execute on function public.restore_steam_completion_game(uuid,bigint) to service_role;
