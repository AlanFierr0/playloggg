begin;
do $$ declare p bigint; g bigint; begin
 select id into p from public.profiles where handle='sql_recovery_owner';
 select id into g from public.games where slug='sql-recovery-game';
 if not exists(select 1 from auth.users where id='55555555-5555-4555-8555-555555555555') then raise exception 'Auth identity missing'; end if;
 if not exists(select 1 from public.profiles where id=p and not is_public and not is_discoverable and tier_ranges->'S'='[90,100]'::jsonb) then raise exception 'Identity, ranges or privacy lost'; end if;
 if not exists(select 1 from public.ratings where profile_id=p and game_id=g and score=0 and hours_played=0 and completed_on='2022-01-01' and review='Recovery review with zero score' and tags=array['Recovery']) then raise exception 'Log data lost'; end if;
 if not exists(select 1 from public.ratings r join public.games g on g.id=r.game_id where r.profile_id=p and g.slug='sql-recovery-unknown' and score is null and hours_played is null and completed_on is null) then raise exception 'Unknown fields changed'; end if;
 if not exists(select 1 from public.profile_favorites where profile_id=p and game_id=g and featured_slot=1) then raise exception 'Favorite lost'; end if;
 if not exists(select 1 from public.profile_rankings where profile_id=p and game_ids=array[g] and manual_positions=jsonb_build_object(g::text,0)) then raise exception 'Ranking anchor lost'; end if;
 if not exists(select 1 from storage.objects o join public.profiles p on p.avatar_url=o.name where p.handle='sql_recovery_owner' and o.bucket_id='profile-pictures') then raise exception 'Picture metadata lost'; end if;
end $$;
set local role anon;
do $$ begin
 if exists(select 1 from public.profiles where handle='sql_recovery_owner') or exists(select 1 from public.ratings r join public.games g on g.id=r.game_id where g.slug='sql-recovery-game') then raise exception 'Restored private data became public'; end if;
 if has_function_privilege('anon','public.save_rating(bigint,jsonb,timestamptz)','EXECUTE') then raise exception 'Restored anonymous write grant'; end if;
end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"55555555-5555-4555-8555-555555555555"}',true);
set local role authenticated;
do $$ begin
 if not exists(select 1 from public.ratings r join public.games g on g.id=r.game_id where g.slug='sql-recovery-game' and score=0) then raise exception 'Restored owner cannot read the entry'; end if;
end $$;
reset role;
rollback;
