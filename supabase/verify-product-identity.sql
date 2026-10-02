begin;
insert into auth.users(id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data) values
('fcadc001-0000-4000-8000-000000000001','authenticated','authenticated','identity-a@fixture.invalid','',now(),'{}','{}'),
('fcadc001-0000-4000-8000-000000000002','authenticated','authenticated','identity-b@fixture.invalid','',now(),'{}','{}');
insert into public.profiles(id,handle,display_name,owner_user_id,is_public,is_discoverable) overriding system value values
(-910001,'identity_fixture_a','Fixture A','fcadc001-0000-4000-8000-000000000001',false,false),
(-910002,'identity_fixture_b','Fixture B','fcadc001-0000-4000-8000-000000000002',true,true);
insert into public.ratings(profile_id,game_id,score,status) values(-910002,(select min(id) from public.games),95,'completed');
insert into public.curated_lists(id,profile_id,name,is_public) overriding system value values(-910020,-910002,'Public like fixture',true);
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"fcadc001-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$
declare g bigint;rev integer;list_id bigint;
begin
select min(id) into g from public.games;
insert into public.ratings(profile_id,game_id,score,status) values(-910001,g,0,'backlog');
if (select count(*) from public.profile_activity where profile_id=-910001)<>1 then raise exception 'Missing trusted activity';end if;
rev=public.save_preference_ranking(array[g],null);
if rev<>1 then raise exception 'Ranking not saved';end if;
begin
 perform public.save_preference_ranking(array[(select max(id) from public.games)],rev);
 raise exception 'Unlogged ranking was allowed';
exception when invalid_parameter_value then null;end;
begin
 insert into public.ratings(profile_id,game_id,score) values(-910002,g,50);
 raise exception 'Foreign rating was allowed';
exception when insufficient_privilege then null;end;
list_id=(public.save_curated_list_v2(-910001,null,'Fixture list',array[g],null,'Private fixture',false,false)->>'id')::bigint;
if not exists(select 1 from public.curated_lists where id=list_id and description='Private fixture' and not is_ranked) then raise exception 'List settings failed';end if;
insert into public.list_likes(profile_id,list_id) values(-910001,-910020);
insert into public.profile_follows(follower_id,followed_id) values(-910001,-910002);
if not exists(select 1 from public.profile_activity where profile_id=-910002) then raise exception 'Discoverable activity unavailable';end if;
insert into public.profile_blocks(blocker_id,blocked_id) values(-910001,-910002);
if exists(select 1 from public.profile_activity where profile_id=-910002) then raise exception 'Blocked activity leaked';end if;
begin
 insert into public.profile_follows(follower_id,followed_id) values(-910001,-910002) on conflict do nothing;
 -- Verify a new blocked relationship cannot be added after unfollow.
 delete from public.profile_follows where follower_id=-910001 and followed_id=-910002;
 insert into public.profile_follows(follower_id,followed_id) values(-910001,-910002);
 raise exception 'Blocked follow was allowed';
exception when insufficient_privilege then null;end;
begin
 insert into public.profile_activity(profile_id,kind) values(-910001,'favorite');
 raise exception 'Forged activity was allowed';
exception when insufficient_privilege then null;end;
end;$$;
set local role anon;
do $$ begin
if not exists(select 1 from public.public_list_like_counts() where list_id=-910020 and likes=1) then raise exception 'Public like count missing';end if;
begin perform profile_id from public.list_likes;raise exception 'Liking identities leaked';exception when insufficient_privilege then null;end;
if exists(select 1 from public.profiles where id=-910001) then raise exception 'Private profile leaked';end if;
if exists(select 1 from public.profile_rankings where profile_id=-910001) then raise exception 'Private ranking leaked';end if;
if exists(select 1 from public.curated_lists where profile_id=-910001) then raise exception 'Private list leaked';end if;
if exists(select 1 from public.profile_activity where profile_id=-910001) then raise exception 'Private activity leaked';end if;
if not exists(select 1 from public.profile_activity where profile_id=-910002) then raise exception 'Public activity missing';end if;
end;$$;
reset role;
update public.profiles set is_public=false,is_discoverable=false where id=-910002;
set local role anon;
do $$ begin
if exists(select 1 from public.profile_activity where profile_id=-910002) then raise exception 'Unpublished activity leaked';end if;
if exists(select 1 from public.public_list_like_counts() where list_id=-910020) then raise exception 'Unpublished like count leaked';end if;
end;$$;
rollback;
select 'Identity ownership and visibility checks passed; all fixtures rolled back' as result;

