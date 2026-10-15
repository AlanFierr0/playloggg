-- CI-only: run inside the fresh local Supabase container, never on production.
begin;
insert into auth.users(id,email,email_confirmed_at) values('33333333-3333-4333-8333-333333333333','sql-test@example.invalid',now());
insert into public.profiles(handle,display_name,owner_user_id,is_public,is_discoverable)
values('sql_test_owner','SQL test owner','33333333-3333-4333-8333-333333333333',false,false);
insert into public.games(slug,title,cover_url,released_on) values
('sql-test-game-one','SQL test game one','/icon.svg','2020-01-01'),
('sql-test-game-two','SQL test game two','/icon.svg','2020-01-01');
-- Run with an administrative connection. Every test record/change is rolled back.
do $$
declare p bigint; v bigint; g bigint; launch date; rejected boolean; reviewed timestamptz;
begin
  insert into public.profiles(handle,display_name,is_public,is_discoverable)
    values('rollback_audit_owner','Rollback audit',true,true) returning id into p;
  insert into public.profiles(handle,display_name,is_public,is_discoverable)
    values('rollback_audit_voter','Rollback audit',false,false) returning id into v;
  select id,released_on into g,launch from public.games where released_on is not null and released_on<current_date limit 1;
  insert into public.ratings(profile_id,game_id,score,review,hours_played) values(p,g,80,'Original rollback review',1);
  insert into public.review_votes(reviewer_profile_id,game_id,voter_profile_id,value) values(p,g,v,1);
  select review_updated_at into reviewed from public.ratings where profile_id=p and game_id=g;
  if reviewed is null then raise exception 'New review has no edit date'; end if;
  update public.ratings set score=81 where profile_id=p and game_id=g;
  if (select review_updated_at from public.ratings where profile_id=p and game_id=g) is distinct from reviewed then raise exception 'Score edit changed review date'; end if;
  if not exists(select 1 from public.review_votes where reviewer_profile_id=p) then raise exception 'Score edit cleared votes'; end if;
  update public.ratings set review='Revised rollback review' where profile_id=p and game_id=g;
  if (select review_updated_at from public.ratings where profile_id=p and game_id=g)<=reviewed then raise exception 'Review edit did not advance date'; end if;
  update public.ratings set review='' where profile_id=p and game_id=g;
  if (select review_updated_at from public.ratings where profile_id=p and game_id=g) is not null then raise exception 'Cleared review retained date'; end if;
  if exists(select 1 from public.review_votes where reviewer_profile_id=p) then raise exception 'Review edit retained votes'; end if;
  rejected=false;
  begin update public.ratings set completed_on=launch-1 where profile_id=p and game_id=g; exception when sqlstate '22023' then rejected=true; end;
  if not rejected then raise exception 'Prelaunch completion accepted'; end if;
  rejected=false;
  begin update public.ratings set hours_played=1e9 where profile_id=p and game_id=g; exception when sqlstate '22023' then rejected=true; end;
  if not rejected then raise exception 'Impossible playtime accepted'; end if;
  rejected=false;
  begin update public.ratings set completed_on=current_date+1 where profile_id=p and game_id=g; exception when sqlstate '22023' then rejected=true; end;
  if not rejected then raise exception 'Future completion accepted'; end if;
end $$;

-- Permission assertions after restrict_direct_rating_writes is applied.
do $$ begin
  if has_column_privilege('authenticated','public.ratings','score','UPDATE')
    or has_column_privilege('authenticated','public.ratings','review','INSERT')
    or has_function_privilege('anon','public.save_rating(bigint,jsonb,timestamptz)','EXECUTE') then
    raise exception 'Unrestricted entry write privilege';
  end if;
  if not has_column_privilege('authenticated','public.ratings','hours_played','UPDATE')
    or not has_column_privilege('authenticated','public.ratings','game_id','INSERT')
    or not has_function_privilege('authenticated','public.save_rating(bigint,jsonb,timestamptz)','EXECUTE') then
    raise exception 'Required owned write unavailable';
  end if;
end $$;

-- Verify actual authenticated writes and stale-edit protection; preserve all data.
do $$ declare actor uuid; begin
  select owner_user_id into actor from public.profiles where owner_user_id is not null and not is_public limit 1;
  if actor is null then raise exception 'Private test owner required'; end if;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',actor)::text,true);
end $$;
set local role authenticated;
do $$ declare owned bigint; g bigint; old_stamp timestamptz; stamp timestamptz; denied boolean; begin
  select id into owned from public.profiles where owner_user_id=auth.uid();
  select id into g from public.games where released_on<current_date-1 and not exists(select 1 from public.ratings where profile_id=owned and game_id=games.id) limit 1;
  insert into public.ratings(profile_id,game_id,platform,hours_played) values(owned,g,'pc',0) returning updated_at into old_stamp;
  update public.ratings set hours_played=1 where profile_id=owned and game_id=g returning updated_at into stamp;
  if stamp<=old_stamp then raise exception 'Narrow update did not advance revision'; end if;
  denied=false;
  begin perform public.save_rating(g,'{"score":80}'::jsonb,old_stamp); exception when sqlstate '40001' then denied=true; end;
  if not denied then raise exception 'Stale full edit undid a narrow patch'; end if;
  perform public.save_rating(g,'{"score":80,"hours_played":1}'::jsonb,stamp);
  denied=false;
  begin update public.ratings set score=90 where profile_id=owned and game_id=g; exception when insufficient_privilege then denied=true; end;
  if not denied then raise exception 'Direct score update accepted'; end if;
  denied=false;
  begin insert into public.ratings(profile_id,game_id,score) values(owned,g,90); exception when insufficient_privilege then denied=true; end;
  if not denied then raise exception 'Direct full-entry insert accepted'; end if;
end $$;

reset role;
-- Simulate historical values written before the date guard existed.
alter table public.ratings disable trigger validate_entry_dates;
insert into public.ratings(profile_id,game_id,score,hours_played,completed_on)
select p.id,g.id,80,1e9,'2099-01-01' from public.profiles p,public.games g
where p.handle='sql_test_owner' and g.slug='sql-test-game-two'
on conflict(profile_id,game_id) do update set hours_played=excluded.hours_played,completed_on=excluded.completed_on;
alter table public.ratings enable trigger validate_entry_dates;
set local role authenticated;
do $$ declare g bigint; stamp timestamptz; value jsonb; denied boolean; begin
  select id into g from public.games where slug='sql-test-game-two';
  select updated_at,to_jsonb(r) into stamp,value from public.ratings r where profile_id=(select id from public.profiles where owner_user_id=auth.uid()) and game_id=g;
  stamp:=public.save_rating(g,value || '{"score":95,"review":"Legacy fields preserved"}'::jsonb,stamp);
  if not exists(select 1 from public.ratings where game_id=g and hours_played=1e9 and completed_on='2099-01-01' and score=95) then raise exception 'Legacy fields changed or score edit failed'; end if;
  stamp:=public.save_rating(g,value || '{"hours_played":2}'::jsonb,stamp);
  denied=false;
  begin perform public.save_rating(g,value || '{"hours_played":1e9}'::jsonb,stamp); exception when sqlstate '22023' then denied=true; end;
  if not denied then raise exception 'New impossible hours accepted'; end if;
  denied=false;
  begin perform public.save_rating(g,value || '{"hours_played":2,"completed_on":"2100-01-01"}'::jsonb,stamp); exception when sqlstate '22023' then denied=true; end;
  if not denied then raise exception 'New future date accepted'; end if;
  stamp:=public.save_rating(g,value || '{"hours_played":2,"completed_on":"2021-01-01"}'::jsonb,stamp);
  denied=false;
  begin perform public.save_rating(g,value || '{"hours_played":2,"completed_on":"2019-01-01"}'::jsonb,stamp); exception when sqlstate '22023' then denied=true; end;
  if not denied then raise exception 'New prelaunch date accepted'; end if;
end $$;
reset role;
insert into public.games(slug,title,cover_url,released_on)
select 'sql-catalog-'||n,'SQL catalog '||lpad(n::text,3,'0'),'/icon.svg','2020-01-01' from generate_series(1,60) n;
do $$ declare filters jsonb; first_page jsonb; next_page jsonb; begin
  filters:='{"query":"SQL catalog","genre":"","tag":"","platform":"","year":"","library":"all","status":"all","tier":"all","rating":"all","minScore":"","maxScore":"","sort":"title","valid":true}'::jsonb;
  first_page:=public.catalog_page(null,filters,1);
  next_page:=public.catalog_page(null,filters||'{"batch":true}'::jsonb,2);
  if jsonb_array_length(first_page->'games')<>25 or jsonb_array_length(next_page->'games')<>25 or (next_page->>'offset')::integer<>25 then raise exception 'Catalog batch was not bounded'; end if;
  if exists(select 1 from jsonb_array_elements(first_page->'games') a,jsonb_array_elements(next_page->'games') b where a->>'slug'=b->>'slug') then raise exception 'Catalog batch repeated earlier cards'; end if;
  if jsonb_array_length(public.catalog_page(null,filters,2)->'games')<>50 then raise exception 'Cumulative refresh lost prior cards'; end if;
end $$;
-- Confirm removal is limited to the authenticated owner and the current revision.
do $$ declare owned bigint; g bigint; other_game bigint; begin
 select id into owned from public.profiles where handle='sql_test_owner';
 select id into g from public.games where slug='sql-test-game-two';
 select id into other_game from public.games where slug='sql-test-game-one';
 insert into public.ratings(profile_id,game_id,score) values(owned,other_game,80) on conflict do nothing;
 insert into public.review_votes(reviewer_profile_id,game_id,voter_profile_id,value) select owned,g,id,1 from public.profiles where handle='rollback_audit_voter';
 insert into public.profile_favorites(profile_id,game_id) values(owned,g);
 insert into public.profile_rankings(profile_id,game_ids,manual_positions) values(owned,array[g,other_game],jsonb_build_object(g::text,0,other_game::text,1));
 if has_function_privilege('anon','public.remove_rating(bigint,timestamptz)','EXECUTE') or has_table_privilege('authenticated','public.ratings','DELETE') then raise exception 'Unrestricted removal privilege'; end if;
end $$;
set local role authenticated;
do $$ declare owned bigint; g bigint; other_game bigint; stamp timestamptz; denied boolean; begin
 select id into owned from public.profiles where owner_user_id=auth.uid();
 select id into g from public.games where slug='sql-test-game-two';
 select id into other_game from public.games where slug='sql-test-game-one';
 select updated_at into stamp from public.ratings where profile_id=owned and game_id=g;
 denied=false;
 begin perform public.remove_rating(g,stamp-interval '1 second'); exception when sqlstate '40001' then denied=true; end;
 if not denied or not exists(select 1 from public.ratings where profile_id=owned and game_id=g) then raise exception 'Stale removal changed an entry'; end if;
 if not public.remove_rating(g,stamp) then raise exception 'Owned removal failed'; end if;
 if exists(select 1 from public.ratings where profile_id=owned and game_id=g) then raise exception 'Owned rating retained'; end if;
 if exists(select 1 from public.review_votes where reviewer_profile_id=owned and game_id=g) then raise exception 'Removed review votes retained'; end if;
 if not exists(select 1 from public.profile_favorites where profile_id=owned and game_id=g) then raise exception 'Independent favorite lost'; end if;
 if not exists(select 1 from public.profile_rankings where profile_id=owned and game_ids=array[other_game] and manual_positions=jsonb_build_object(other_game::text,0) and revision=2) then raise exception 'Ranking not cleaned and shifted'; end if;
 if public.remove_rating(g,stamp) then raise exception 'Missing entry removed twice'; end if;
end $$;
reset role;
-- An Auth identity without a profile cannot remove anybody's entry.
select set_config('request.jwt.claims','{"sub":"44444444-4444-4444-8444-444444444444"}',true);
set local role authenticated;
do $$ declare denied boolean=false; begin
 begin perform public.remove_rating((select id from public.games limit 1),now()); exception when insufficient_privilege then denied=true; end;
 if not denied then raise exception 'Unowned removal accepted'; end if;
end $$;
reset role;
-- Public review browsing stays scoped, bounded and visibility-aware.
insert into public.profiles(handle,display_name,is_public,is_discoverable)
select 'sql_review_'||lpad(n::text,2,'0'),'SQL Reviewer '||n,true,true from generate_series(1,30) n;
insert into public.ratings(profile_id,game_id,score,review)
select p.id,g.id,80,'SQL public review '||p.handle from public.profiles p,public.games g
where p.handle like 'sql_review_%' and g.slug='sql-test-game-one';
insert into public.review_votes(reviewer_profile_id,game_id,voter_profile_id,value)
select p.id,g.id,v.id,1 from public.profiles p,public.profiles v,public.games g
where p.handle='sql_review_01' and v.handle='rollback_audit_voter' and g.slug='sql-test-game-one';
set local role anon;
do $$ declare g bigint; first_author text; total integer; begin
 select id into g from public.games where slug='sql-test-game-one';
 select count(*) into total from public.game_reviews(g,0);
 if total<>25 then raise exception 'Review page was not bounded'; end if;
 select handle into first_author from public.game_reviews(g,0) limit 1;
 if first_author<>'sql_review_01' then raise exception 'Helpfulness ordering lost'; end if;
 if exists(select 1 from public.game_reviews(g,0) r join public.profiles p on p.id=r.profile_id where not p.is_public or not p.is_discoverable) then raise exception 'Ineligible review exposed'; end if;
 if exists(select 1 from (select profile_id from public.game_reviews(g,0) limit 24) a join public.game_reviews(g,24) b using(profile_id)) then raise exception 'Review batch repeated earlier authors'; end if;
end $$;
reset role;
update public.profiles set is_public=false,is_discoverable=false where handle='sql_review_01';
set local role anon;
do $$ declare g bigint; begin
 select id into g from public.games where slug='sql-test-game-one';
 if exists(select 1 from public.game_reviews(g,0) where handle='sql_review_01') then raise exception 'Unpublished review retained'; end if;
end $$;
reset role;
-- Translation caches are server-only, revision-aware and deleted with reviews.
do $$ declare p bigint;g bigint;begin
 select id into p from public.profiles where handle='sql_test_owner';
 select id into g from public.games where slug='sql-test-game-one';
 update public.ratings set review='Cache original' where profile_id=p and game_id=g;
 if has_function_privilege('anon','public.read_review_translation(bigint,bigint,text,text)','EXECUTE') or has_function_privilege('authenticated','public.store_review_translation(bigint,bigint,text,text,text,text,text)','EXECUTE') then raise exception 'Translation cache exposed';end if;
 if has_table_privilege('anon','private.review_translations','SELECT') then raise exception 'Translation table exposed';end if;
 insert into private.translation_usage(period_start,characters) values(date_trunc('month',now() at time zone 'UTC')::date,499990);
end $$;
set local role service_role;
do $$ declare p bigint;g bigint;value jsonb;begin
 select id into p from public.profiles where handle='sql_test_owner';select id into g from public.games where slug='sql-test-game-one';
 if public.reserve_review_translation(20) then raise exception 'Translation budget exceeded';end if;
 if not public.reserve_review_translation(10) or public.reserve_review_translation(1) then raise exception 'Translation budget inaccurate';end if;
 if not public.store_review_translation(p,g,repeat('a',64),'ES','Cache original','Traducción','EN') then raise exception 'Current cache rejected';end if;
 value:=public.read_review_translation(p,g,repeat('a',64),'ES');
 if value->>'text'<>'Traducción' then raise exception 'Cache text lost';end if;
 if public.read_review_translation(p,g,repeat('b',64),'ES') is not null then raise exception 'Stale hash accepted';end if;
end $$;
reset role;
update public.ratings set review='Cache revised' where profile_id=(select id from public.profiles where handle='sql_test_owner') and game_id=(select id from public.games where slug='sql-test-game-one');
set local role service_role;
do $$ declare p bigint;g bigint;begin
 select id into p from public.profiles where handle='sql_test_owner';select id into g from public.games where slug='sql-test-game-one';
 if public.read_review_translation(p,g,repeat('a',64),'ES') is not null then raise exception 'Review edit retained translation';end if;
 if public.store_review_translation(p,g,repeat('a',64),'ES','Cache original','Old translation','EN') then raise exception 'Outdated original cached';end if;
 perform public.store_review_translation(p,g,repeat('b',64),'ES','Cache revised','Updated translation','EN');
end $$;
reset role;
delete from public.ratings where profile_id=(select id from public.profiles where handle='sql_test_owner') and game_id=(select id from public.games where slug='sql-test-game-one');
do $$ begin
 if exists(select 1 from private.review_translations where profile_id=(select id from public.profiles where handle='sql_test_owner')) then raise exception 'Removed review retained translation';end if;
end $$;
rollback;

-- AI classifications contain only public game/achievement IDs and are server-only.
begin;
do $$begin
 if has_function_privilege('authenticated','public.read_steam_completion_classification(bigint,text)','execute')
 or has_function_privilege('anon','public.store_steam_completion_classification(bigint,text,jsonb)','execute') then raise exception 'AI cache exposed to public roles';end if;
end;$$;
set local role service_role;
do $$declare saved jsonb;begin
 perform public.store_steam_completion_classification(4294967000,repeat('a',64),'["ENDING"]'::jsonb);
 saved:=public.read_steam_completion_classification(4294967000,repeat('a',64));
 if saved is distinct from '["ENDING"]'::jsonb then raise exception 'AI cache did not persist';end if;
 if public.read_steam_completion_classification(4294967000,repeat('b',64)) is not null then raise exception 'AI cache ignored schema hash';end if;
 perform public.store_steam_completion_classification(4294967000,repeat('b',64),'[]'::jsonb);
 if public.read_steam_completion_classification(4294967000,repeat('b',64)) is distinct from '[]'::jsonb then raise exception 'Empty classification was not cached';end if;
 begin
  perform public.store_steam_completion_classification(4294967000,repeat('a',64),'["ENDING","ENDING"]'::jsonb);
  raise exception 'Duplicate classification IDs accepted';
 exception when raise_exception then
  if sqlerrm<>'Invalid achievement IDs' then raise;end if;
 end;
end;$$;
rollback;
-- Durable Steam reads are server-only, bounded and deleted with the owner.
begin;
insert into auth.users(id,email,email_confirmed_at) values('44444444-4444-4444-8444-444444444444','achievement-cache@example.invalid',now());
do $$begin
 if has_function_privilege('authenticated','public.read_steam_achievement_cache(text,uuid)','execute')
 or has_function_privilege('anon','public.store_steam_achievement_cache(text,uuid,jsonb,integer)','execute')
 or has_table_privilege('authenticated','private.steam_achievement_cache','select') then raise exception 'Achievement data exposed';end if;
end;$$;
set local role service_role;
do $$declare owner uuid:='44444444-4444-4444-8444-444444444444';begin
 perform public.store_steam_achievement_cache(repeat('e',64),owner,'{"playerstats":{"achievements":[]}}',900);
 if public.read_steam_achievement_cache(repeat('e',64),owner) is null then raise exception 'Private results not saved';end if;
 if public.read_steam_achievement_cache(repeat('e',64),null) is not null
 or public.read_steam_achievement_cache(repeat('e',64),'55555555-5555-4555-8555-555555555555') is not null then raise exception 'Owner isolation failed';end if;
 update private.steam_achievement_cache set expires_at=now()-interval '1 second' where cache_key=repeat('e',64);
 if public.read_steam_achievement_cache(repeat('e',64),owner) is not null then raise exception 'Expired data returned';end if;
 perform public.store_steam_achievement_cache(repeat('f',64),null,'{"game":{"achievements":[]}}',86400);
 if exists(select 1 from private.steam_achievement_cache where cache_key=repeat('e',64)) then raise exception 'Expired data not cleaned';end if;
 perform public.store_steam_achievement_cache(repeat('e',64),owner,'{"updated":true}',900);
 if public.read_steam_achievement_cache(repeat('e',64),owner) is distinct from '{"updated":true}'::jsonb then raise exception 'Refresh did not replace results';end if;
 begin
  perform public.store_steam_achievement_cache(repeat('e',64),owner,'{}',86400);
  raise exception 'Private lifetime accepted';
 exception when raise_exception then if sqlerrm<>'Invalid achievement cache lifetime' then raise;end if;end;
end;$$;
reset role;
delete from auth.users where id='44444444-4444-4444-8444-444444444444';
do $$begin
 if exists(select 1 from private.steam_achievement_cache where cache_key=repeat('e',64)) then raise exception 'Deleted owner retained achievements';end if;
end;$$;
rollback;
-- Completion skips are private preferences, never rating edits.
begin;
insert into auth.users(id,email,email_confirmed_at) values
('55555555-5555-4555-8555-555555555555','skip-owner@example.invalid',now()),
('66666666-6666-4666-8666-666666666666','skip-other@example.invalid',now());
insert into public.profiles(handle,display_name,owner_user_id,is_public,is_discoverable)
 values('sql_skip_owner','Skip owner','55555555-5555-4555-8555-555555555555',false,false);
insert into public.games(slug,title,cover_url,released_on) values('sql-skip-game','Skip game','/icon.svg','2000-01-01');
insert into public.ratings(profile_id,game_id,score,status,platform,review)
 select p.id,g.id,83,'backlog','pc','Keep this review' from public.profiles p cross join public.games g where p.handle='sql_skip_owner' and g.slug='sql-skip-game';
do $$begin
 if has_function_privilege('authenticated','public.read_steam_completion_skips(uuid)','execute')
 or has_function_privilege('anon','public.skip_steam_completion_game(uuid,bigint)','execute')
 or has_table_privilege('authenticated','private.steam_completion_skips','select') then raise exception 'Skip preferences exposed';end if;
end;$$;
set local role service_role;
do $$declare g bigint;original jsonb;begin
 select id into g from public.games where slug='sql-skip-game';
 select to_jsonb(r) into original from public.ratings r join public.profiles p on p.id=r.profile_id where p.handle='sql_skip_owner' and r.game_id=g;
 perform public.skip_steam_completion_game('55555555-5555-4555-8555-555555555555',g);
 perform public.skip_steam_completion_game('55555555-5555-4555-8555-555555555555',g);
 if public.read_steam_completion_skips('55555555-5555-4555-8555-555555555555') is distinct from array[g] then raise exception 'Skip not persisted idempotently';end if;
 if public.read_steam_completion_skips('66666666-6666-4666-8666-666666666666') is distinct from '{}'::bigint[] then raise exception 'Skip leaked to another owner';end if;
 if (select to_jsonb(r) from public.ratings r join public.profiles p on p.id=r.profile_id where p.handle='sql_skip_owner' and r.game_id=g) is distinct from original then raise exception 'Skipping edited rating';end if;
 begin
  perform public.skip_steam_completion_game('66666666-6666-4666-8666-666666666666',g);
  raise exception 'Unowned log accepted';
 exception when raise_exception then if sqlerrm<>'Owned PC log required' then raise;end if;end;
end;$$;
reset role;
rollback;
