-- Run with an administrative connection. Every test record/change is rolled back.
begin;
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
rollback;

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
begin;
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
rollback;
