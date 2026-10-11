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
