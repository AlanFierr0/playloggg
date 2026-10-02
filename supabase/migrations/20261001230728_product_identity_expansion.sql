-- Approved discovery consent, independent ranking, list settings and social ownership.
alter table public.profiles add column is_discoverable boolean not null default false;
alter table public.profiles add constraint discovery_requires_public check (not is_discoverable or is_public);
grant select (is_discoverable) on public.profiles to anon, authenticated;
create index profiles_discovery on public.profiles(handle) where is_public and is_discoverable;
alter table public.curated_lists add column description text not null default '' check (length(description)<=2000);
alter table public.curated_lists add column is_public boolean not null default false;
alter table public.curated_lists add column is_ranked boolean not null default true;
grant insert(description,is_public,is_ranked),update(description,is_public,is_ranked) on public.curated_lists to authenticated;
drop policy published_lists_read on public.curated_lists;
create policy published_lists_read on public.curated_lists for select to anon,authenticated using(is_public and exists(select 1 from public.profiles p where p.id=profile_id and p.is_public));
drop policy published_list_items_read on public.curated_list_items;
create policy published_list_items_read on public.curated_list_items for select to anon,authenticated using(exists(select 1 from public.curated_lists l join public.profiles p on p.id=l.profile_id where l.id=list_id and l.is_public and p.is_public));

create table public.profile_rankings(profile_id bigint primary key references public.profiles(id) on delete cascade, game_ids bigint[] not null default '{}',revision integer not null default 1 check(revision>0));
alter table public.profile_rankings enable row level security;
revoke all on public.profile_rankings from anon,authenticated;
grant select on public.profile_rankings to anon,authenticated;
grant insert,update on public.profile_rankings to authenticated;
create policy ranking_read on public.profile_rankings for select to anon,authenticated using(exists(select 1 from public.profiles p where p.id=profile_id and p.is_public));
create policy ranking_owner on public.profile_rankings for all to authenticated using(exists(select 1 from public.profiles p where p.id=profile_id and p.owner_user_id=(select auth.uid()))) with check(exists(select 1 from public.profiles p where p.id=profile_id and p.owner_user_id=(select auth.uid())) and cardinality(game_ids)<=10000 and not exists(select 1 from unnest(game_ids) g where g is null or not exists(select 1 from public.ratings r where r.profile_id=profile_rankings.profile_id and r.game_id=g)));
create function public.save_preference_ranking(p_ids bigint[],p_revision integer) returns integer language plpgsql security invoker set search_path='' as $$
declare v_id bigint;v_revision integer;
begin
 select id into v_id from public.profiles where owner_user_id=(select auth.uid());
 if v_id is null then raise exception 'Owned profile required' using errcode='42501';end if;
 perform pg_catalog.pg_advisory_xact_lock(v_id);
 select revision into v_revision from public.profile_rankings where profile_id=v_id;
 if v_revision is distinct from p_revision then raise exception 'Ranking changed' using errcode='40001';end if;
 if p_ids is null or coalesce(array_ndims(p_ids),1)<>1 or cardinality(p_ids)>10000 or cardinality(p_ids)<>(select count(distinct id) from unnest(p_ids) id) or exists(select 1 from unnest(p_ids) id where id is null or not exists(select 1 from public.ratings r where r.profile_id=v_id and r.game_id=id)) then raise exception 'Only logged games may be ranked' using errcode='22023';end if;
 insert into public.profile_rankings(profile_id,game_ids) values(v_id,p_ids) on conflict(profile_id) do update set game_ids=excluded.game_ids,revision=public.profile_rankings.revision+1 returning revision into v_revision;
 return v_revision;
end;$$;
revoke all on function public.save_preference_ranking(bigint[],integer) from public,anon;
grant execute on function public.save_preference_ranking(bigint[],integer) to authenticated;

create table public.profile_blocks(blocker_id bigint references public.profiles(id) on delete cascade,blocked_id bigint references public.profiles(id) on delete cascade,primary key(blocker_id,blocked_id),check(blocker_id<>blocked_id));
create table public.profile_follows(follower_id bigint references public.profiles(id) on delete cascade,followed_id bigint references public.profiles(id) on delete cascade,primary key(follower_id,followed_id),check(follower_id<>followed_id));
create table public.list_likes(profile_id bigint references public.profiles(id) on delete cascade,list_id bigint references public.curated_lists(id) on delete cascade,primary key(profile_id,list_id));
create index profile_follows_target on public.profile_follows(followed_id);
create index profile_blocks_target on public.profile_blocks(blocked_id);
create index list_likes_target on public.list_likes(list_id);
alter table public.profile_blocks enable row level security;
alter table public.profile_follows enable row level security;
alter table public.list_likes enable row level security;
revoke all on public.profile_blocks,public.profile_follows,public.list_likes from anon,authenticated;
grant select,insert,delete on public.profile_blocks,public.profile_follows,public.list_likes to authenticated;
create policy blocks_participant_read on public.profile_blocks for select to authenticated using(exists(select 1 from public.profiles p where p.owner_user_id=(select auth.uid()) and p.id in(blocker_id,blocked_id)));
create policy blocks_owner_insert on public.profile_blocks for insert to authenticated with check(exists(select 1 from public.profiles p where p.id=blocker_id and p.owner_user_id=(select auth.uid())));
create policy blocks_owner_delete on public.profile_blocks for delete to authenticated using(exists(select 1 from public.profiles p where p.id=blocker_id and p.owner_user_id=(select auth.uid())));
create policy follows_owner_read on public.profile_follows for select to authenticated using(exists(select 1 from public.profiles p where p.id=follower_id and p.owner_user_id=(select auth.uid())));
create policy follows_owner_insert on public.profile_follows for insert to authenticated with check(exists(select 1 from public.profiles p where p.id=follower_id and p.owner_user_id=(select auth.uid())) and exists(select 1 from public.profiles p where p.id=followed_id and p.is_public and p.is_discoverable) and not exists(select 1 from public.profile_blocks b where (b.blocker_id=follower_id and b.blocked_id=followed_id) or (b.blocker_id=followed_id and b.blocked_id=follower_id)));
create policy follows_owner_delete on public.profile_follows for delete to authenticated using(exists(select 1 from public.profiles p where p.id=follower_id and p.owner_user_id=(select auth.uid())));
create policy likes_read on public.list_likes for select to authenticated using(exists(select 1 from public.curated_lists l join public.profiles p on p.id=l.profile_id where l.id=list_id and l.is_public and p.is_public));
create policy likes_owner_insert on public.list_likes for insert to authenticated with check(exists(select 1 from public.profiles p where p.id=profile_id and p.owner_user_id=(select auth.uid())) and exists(select 1 from public.curated_lists l join public.profiles p on p.id=l.profile_id where l.id=list_id and l.is_public and p.is_public));
create policy likes_owner_delete on public.list_likes for delete to authenticated using(exists(select 1 from public.profiles p where p.id=profile_id and p.owner_user_id=(select auth.uid())));

create table public.profile_activity(id bigint generated always as identity primary key,profile_id bigint not null references public.profiles(id) on delete cascade,game_id bigint references public.games(id) on delete cascade,kind text not null check(kind in('entry','favorite')),score smallint,status text,tier text,occurred_at timestamptz not null default now());
create index activity_profile_time on public.profile_activity(profile_id,occurred_at desc);
alter table public.profile_activity enable row level security;
revoke all on public.profile_activity from anon,authenticated;
grant select on public.profile_activity to anon,authenticated;
create policy activity_public on public.profile_activity for select to anon,authenticated using(exists(select 1 from public.profiles p where p.id=profile_id and p.is_public and p.is_discoverable));
create policy activity_owner on public.profile_activity for select to authenticated using(exists(select 1 from public.profiles p where p.id=profile_id and p.owner_user_id=(select auth.uid())));
create schema if not exists private;
revoke all on schema private from public,anon,authenticated;
create function private.record_entry_activity() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='UPDATE' and new.score is not distinct from old.score and new.tier is not distinct from old.tier and new.status is not distinct from old.status and new.review is not distinct from old.review then return new;end if;
 insert into public.profile_activity(profile_id,game_id,kind,score,status,tier) values(new.profile_id,new.game_id,'entry',new.score,new.status,new.tier);
 return new;
end;$$;
revoke all on function private.record_entry_activity() from public,anon,authenticated;
create trigger record_entry_activity after insert or update on public.ratings for each row execute function private.record_entry_activity();
create function private.record_favorite_activity() returns trigger language plpgsql security definer set search_path='' as $$ begin
 insert into public.profile_activity(profile_id,game_id,kind) values(new.profile_id,new.game_id,'favorite');return new;end;$$;
revoke all on function private.record_favorite_activity() from public,anon,authenticated;
create trigger record_favorite_activity after insert on public.profile_favorites for each row execute function private.record_favorite_activity();

create function public.save_curated_list_v2(p_profile_id bigint,p_list_id bigint,p_name text,p_game_ids bigint[],p_expected_revision integer,p_description text,p_public boolean,p_ranked boolean) returns jsonb language plpgsql security invoker set search_path='' as $$
declare saved jsonb;row public.curated_lists;
begin
 if p_description is null or length(p_description)>2000 or p_public is null or p_ranked is null then raise exception 'Invalid list settings' using errcode='22023';end if;
 saved=public.save_curated_list(p_profile_id,p_list_id,p_name,p_game_ids,p_expected_revision);
 update public.curated_lists set description=p_description,is_public=p_public,is_ranked=p_ranked where id=(saved->>'id')::bigint and profile_id=p_profile_id returning * into row;
 return pg_catalog.to_jsonb(row);
end;$$;
revoke all on function public.save_curated_list_v2(bigint,bigint,text,bigint[],integer,text,boolean,boolean) from public,anon;
grant execute on function public.save_curated_list_v2(bigint,bigint,text,bigint[],integer,text,boolean,boolean) to authenticated;
