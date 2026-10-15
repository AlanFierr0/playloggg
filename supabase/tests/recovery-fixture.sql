-- Local CI database only; all records are unmistakable recovery fixtures.
insert into auth.users(id,email,email_confirmed_at) values('55555555-5555-4555-8555-555555555555','recovery-test@example.invalid',now());
insert into public.profiles(handle,display_name,owner_user_id,is_public,is_discoverable,tier_ranges)
values('sql_recovery_owner','SQL recovery fixture','55555555-5555-4555-8555-555555555555',false,false,'{"S":[90,100],"A":[80,89],"B":[70,79],"C":[60,69],"D":[50,59],"F":[0,49]}');
insert into public.games(slug,title,cover_url,released_on) values('sql-recovery-game','SQL recovery game','/icon.svg','2020-01-01');
insert into public.ratings(profile_id,game_id,score,review,hours_played,completed_on,tags)
select p.id,g.id,0,'Recovery review with zero score',0,'2022-01-01',array['Recovery'] from public.profiles p,public.games g
where p.handle='sql_recovery_owner' and g.slug='sql-recovery-game';
insert into public.games(slug,title,cover_url,released_on) values('sql-recovery-unknown','SQL recovery unknown','/icon.svg','2020-01-01');
insert into public.ratings(profile_id,game_id,status) select p.id,g.id,'backlog' from public.profiles p,public.games g where p.handle='sql_recovery_owner' and g.slug='sql-recovery-unknown';
insert into public.profile_favorites(profile_id,game_id,featured_slot)
select p.id,g.id,1 from public.profiles p,public.games g where p.handle='sql_recovery_owner' and g.slug='sql-recovery-game';
insert into public.profile_rankings(profile_id,game_ids,manual_positions)
select p.id,array[g.id],jsonb_build_object(g.id::text,0) from public.profiles p,public.games g where p.handle='sql_recovery_owner' and g.slug='sql-recovery-game';
update public.profiles set avatar_url=id||'/55555555-5555-4555-8555-555555555555.webp' where handle='sql_recovery_owner';
