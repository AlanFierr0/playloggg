-- Aggregate voters privately; return only current, eligible reviews and counts.
create function private.home_reviews(p_limit integer)
returns table(profile_id bigint,game_id bigint,review text,updated_at timestamptz,handle text,display_name text,upvotes bigint,downvotes bigint,viewer_vote smallint)
language sql stable security definer set search_path='' as $$
  select r.profile_id,r.game_id,r.review,r.updated_at,p.handle,p.display_name,
    coalesce(v.upvotes,0),coalesce(v.downvotes,0),coalesce(v.viewer_vote,0)::smallint
  from public.ratings r join public.profiles p on p.id=r.profile_id
  left join lateral (select count(*) filter(where value=1) upvotes,count(*) filter(where value=-1) downvotes,
    max(value) filter(where voter_profile_id=(select id from public.profiles where owner_user_id=(select auth.uid()))) viewer_vote
    from public.review_votes where reviewer_profile_id=r.profile_id and game_id=r.game_id) v on true
  where p.is_public and p.is_discoverable and length(btrim(r.review))>0
  order by coalesce(v.upvotes,0)-coalesce(v.downvotes,0) desc,r.updated_at desc nulls last,r.profile_id,r.game_id
  limit least(greatest(p_limit,0),12);
$$;
revoke all on function private.home_reviews(integer) from public;
grant execute on function private.home_reviews(integer) to anon,authenticated;
create function public.home_reviews(p_limit integer default 12)
returns table(profile_id bigint,game_id bigint,review text,updated_at timestamptz,handle text,display_name text,upvotes bigint,downvotes bigint,viewer_vote smallint)
language sql stable security invoker set search_path='' as $$ select * from private.home_reviews(p_limit); $$;
revoke all on function public.home_reviews(integer) from public;
grant execute on function public.home_reviews(integer) to anon,authenticated;

-- Read individual scores internally; expose only eligible neighbors and aggregate recommendations.
create function private.home_taste() returns jsonb language sql stable security definer set search_path='' as $$
with me as (select id from public.profiles where owner_user_id=(select auth.uid())),
matches as materialized (
  select other.profile_id,count(*) shared,100-avg(abs(mine.score-other.score)) match
  from public.ratings mine join public.ratings other on other.game_id=mine.game_id
  join public.profiles p on p.id=other.profile_id
  where mine.profile_id=(select id from me) and mine.score is not null and other.score is not null
    and p.id<>(select id from me) and p.is_public and p.is_discoverable
    and not exists(select 1 from public.profile_blocks b where (b.blocker_id=(select id from me) and b.blocked_id=p.id) or (b.blocked_id=(select id from me) and b.blocker_id=p.id))
  group by other.profile_id having count(*)>=5 and 100-avg(abs(mine.score-other.score))>=85
), neighbors as (
  select m.profile_id,m.shared,round(m.match,1) match,p.handle,p.display_name,p.avatar_url
  from matches m join public.profiles p on p.id=m.profile_id
  order by round(m.match,1) desc,m.shared desc,m.profile_id limit 6
), recommendations as (
  select r.game_id,round(avg(r.score),1) average,count(*) count,round(max(m.match),1) best_match
  from matches m join public.ratings r on r.profile_id=m.profile_id
  where r.score>=90 and not exists(select 1 from public.ratings own where own.profile_id=(select id from me) and own.game_id=r.game_id)
  group by r.game_id order by count(*) desc,round(avg(r.score),1) desc,r.game_id limit 5
)
select jsonb_build_object('neighbors',coalesce((select jsonb_agg(jsonb_build_object('profileId',profile_id,'shared',shared,'match',match,'handle',handle,'displayName',display_name,'avatarUrl',avatar_url) order by match desc,shared desc,profile_id) from neighbors),'[]'),
  'recommendations',coalesce((select jsonb_agg(jsonb_build_object('gameId',game_id,'average',average,'count',count,'bestMatch',best_match) order by count desc,average desc,game_id) from recommendations),'[]'));
$$;
revoke all on function private.home_taste() from public,anon;
grant execute on function private.home_taste() to authenticated;
create function public.home_taste() returns jsonb language sql stable security invoker set search_path='' as $$ select private.home_taste(); $$;
revoke all on function public.home_taste() from public,anon;
grant execute on function public.home_taste() to authenticated;

create function public.explore_games(p_seed text,p_amount integer,p_profile_id bigint,p_genres text[])
returns setof public.games language sql stable security invoker set search_path='' as $$
  select g.* from public.games g where g.genres && p_genres
    and not exists(select 1 from public.ratings r where r.profile_id=p_profile_id and r.game_id=g.id)
  order by md5(p_seed||':'||g.id::text),g.id limit least(greatest(p_amount,0),25);
$$;
revoke all on function public.explore_games(text,integer,bigint,text[]) from public,anon,authenticated;
grant execute on function public.explore_games(text,integer,bigint,text[]) to service_role;
