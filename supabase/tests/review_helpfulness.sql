-- Real RLS/grants, isolated identities and rollback-only writes.
begin;
create temporary table vote_context as select gen_random_uuid() voter_user, gen_random_uuid() author_user,
  (select id from public.games order by id limit 1) game_id;
alter table vote_context add column voter_id bigint;
alter table vote_context add column author_id bigint;
grant select on vote_context to anon,authenticated;
insert into auth.users(id,aud,role,email) select voter_user,'authenticated','authenticated','vote-fixture@example.invalid' from vote_context;
insert into auth.users(id,aud,role,email) select author_user,'authenticated','authenticated','review-fixture@example.invalid' from vote_context;
insert into public.profiles(handle,display_name,owner_user_id,is_public,is_discoverable)
select 'vote_'||left(replace(voter_user::text,'-',''),16),'Private voter',voter_user,false,false from vote_context;
insert into public.profiles(handle,display_name,owner_user_id,is_public,is_discoverable)
select 'review_'||left(replace(author_user::text,'-',''),16),'Public author',author_user,true,true from vote_context;
update vote_context set voter_id=(select id from public.profiles where owner_user_id=voter_user), author_id=(select id from public.profiles where owner_user_id=author_user);
insert into public.ratings(profile_id,game_id,score,review) select author_id,game_id,80,'Review fixture' from vote_context;
set local role authenticated;
select set_config('request.jwt.claim.sub',voter_user::text,true) from vote_context;
do $$ declare c record; s record; begin
  select * into c from vote_context;
  insert into public.review_votes values(c.author_id,c.game_id,c.voter_id,1);
  begin insert into public.review_votes values(c.author_id,c.game_id,c.voter_id,1); raise exception 'Duplicate vote accepted'; exception when unique_violation then null; end;
  select * into s from public.review_helpfulness(c.author_id);
  if s.upvotes<>1 or s.downvotes<>0 or s.viewer_vote<>1 then raise exception 'Upvote counts incorrect'; end if;
  insert into public.review_votes values(c.author_id,c.game_id,c.voter_id,-1)
    on conflict(reviewer_profile_id,game_id,voter_profile_id) do update set value=excluded.value;
  select * into s from public.review_helpfulness(c.author_id);
  if s.upvotes<>0 or s.downvotes<>1 or s.viewer_vote<>-1 then raise exception 'Switch duplicated vote'; end if;
  begin update public.review_votes set value=2; raise exception 'Invalid vote accepted'; exception when check_violation then null; end;
  begin insert into public.review_votes values(c.author_id,c.game_id,c.author_id,1); raise exception 'Forged voter accepted'; exception when insufficient_privilege or check_violation then null; end;
end $$;
select set_config('request.jwt.claim.sub',author_user::text,true) from vote_context;
do $$ declare c record; changed integer; begin
  select * into c from vote_context;
  if exists(select 1 from public.review_votes) then raise exception 'Private voter identity leaked'; end if;
  update public.review_votes set value=1; get diagnostics changed=row_count;
  if changed<>0 then raise exception 'Other voter changed vote'; end if;
  delete from public.review_votes; get diagnostics changed=row_count;
  if changed<>0 then raise exception 'Other voter removed vote'; end if;
  begin insert into public.review_votes values(c.author_id,c.game_id,c.author_id,1); raise exception 'Self vote accepted'; exception when check_violation then null; end;
end $$;
reset role;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ declare c record; s record; begin
  select * into c from vote_context;
  select * into s from public.review_helpfulness(c.author_id);
  if s.downvotes<>1 or s.viewer_vote<>0 then raise exception 'Anonymous aggregate incorrect'; end if;
  begin perform * from public.review_votes; raise exception 'Anonymous voter read accepted'; exception when insufficient_privilege then null; end;
  begin insert into public.review_votes values(c.author_id,c.game_id,c.voter_id,1); raise exception 'Anonymous vote accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.profiles set is_public=false where id=(select author_id from vote_context);
set local role authenticated;
select set_config('request.jwt.claim.sub',voter_user::text,true) from vote_context;
do $$ declare c record; begin
  select * into c from vote_context;
  if exists(select 1 from public.review_helpfulness(c.author_id)) then raise exception 'Private review counts leaked'; end if;
  begin update public.review_votes set value=1; raise exception 'Private review vote accepted'; exception when insufficient_privilege then null; end;
  delete from public.review_votes;
  if exists(select 1 from public.review_votes) then raise exception 'Vote removal failed'; end if;
end $$;
reset role;
update public.profiles set is_public=true where id=(select author_id from vote_context);
update public.ratings set review='  ' where profile_id=(select author_id from vote_context);
set local role authenticated;
select set_config('request.jwt.claim.sub',voter_user::text,true) from vote_context;
do $$ declare c record; begin
  select * into c from vote_context;
  begin insert into public.review_votes values(c.author_id,c.game_id,c.voter_id,1); raise exception 'Blank review vote accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.ratings set review='Review fixture' where profile_id=(select author_id from vote_context);
insert into public.review_votes select author_id,game_id,voter_id,1 from vote_context;
delete from public.ratings where profile_id=(select author_id from vote_context);
do $$ begin if exists(select 1 from public.review_votes where reviewer_profile_id=(select author_id from vote_context)) then raise exception 'Review deletion left votes'; end if; end $$;
insert into public.ratings(profile_id,game_id,score,review) select author_id,game_id,80,'Review fixture' from vote_context;
insert into public.review_votes select author_id,game_id,voter_id,1 from vote_context;
delete from public.profiles where id=(select voter_id from vote_context);
do $$ begin if exists(select 1 from public.review_votes where reviewer_profile_id=(select author_id from vote_context)) then raise exception 'Voter deletion left votes'; end if; end $$;
rollback;
select 'Review voting permissions and counts verified' result;
