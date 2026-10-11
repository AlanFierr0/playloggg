-- Narrow patches must advance the revision too, so a stale full edit cannot undo them.
create function private.stamp_rating_update() returns trigger language plpgsql security invoker set search_path='' as $$
begin new.updated_at=clock_timestamp(); return new; end; $$;
revoke all on function private.stamp_rating_update() from public,anon,authenticated;
create trigger stamp_rating_update before update on public.ratings
for each row execute function private.stamp_rating_update();

-- Ordinary entry replacement must pass the owned timestamp guard. Narrow direct
-- writes remain available for blank Steam imports, tier patches and playtime sync.
revoke insert, update on public.ratings from authenticated;
do $$ declare column_name text; begin
  for column_name in select attname from pg_attribute where attrelid='public.ratings'::regclass and attnum>0 and not attisdropped loop
    execute format('revoke insert (%I), update (%I) on public.ratings from authenticated',column_name,column_name);
  end loop;
end $$;
grant insert (profile_id,game_id,platform,hours_played) on public.ratings to authenticated;
grant update (tier,tier_manual,hours_played,updated_at) on public.ratings to authenticated;

