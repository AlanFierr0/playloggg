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
declare p bigint; v bigint; g bigint; launch date; rejected boolean;
begin
  insert into public.profiles(handle,display_name,is_public,is_discoverable)
    values('rollback_audit_owner','Rollback audit',true,true) returning id into p;
  insert into public.profiles(handle,display_name,is_public,is_discoverable)
    values('rollback_audit_voter','Rollback audit',false,false) returning id into v;
  select id,released_on into g,launch from public.games where released_on is not null and released_on<current_date limit 1;
  insert into public.ratings(profile_id,game_id,score,review,hours_played) values(p,g,80,'Original rollback review',1);
  insert into public.review_votes(reviewer_profile_id,game_id,voter_profile_id,value) values(p,g,v,1);
  update public.ratings set score=81 where profile_id=p and game_id=g;
  if not exists(select 1 from public.review_votes where reviewer_profile_id=p) then raise exception 'Score edit cleared votes'; end if;
  update public.ratings set review='Revised rollback review' where profile_id=p and game_id=g;
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
rollback;
