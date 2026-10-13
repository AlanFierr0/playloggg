-- Only published, discoverable reviews; voter identities stay inside the aggregate.
create function private.game_reviews(p_game_id bigint,p_offset integer)
returns table(profile_id bigint,handle text,display_name text,avatar_url text,review text,score smallint,tier text,updated_at timestamptz,upvotes bigint,downvotes bigint,viewer_vote smallint)
language sql stable security definer set search_path='' as $$
 select r.profile_id,p.handle,p.display_name,p.avatar_url,r.review,r.score,r.tier,r.updated_at,
 coalesce(v.upvotes,0),coalesce(v.downvotes,0),coalesce(v.viewer_vote,0)::smallint
 from public.ratings r join public.profiles p on p.id=r.profile_id
 left join lateral (select count(*) filter(where value=1) upvotes,count(*) filter(where value=-1) downvotes,
 max(value) filter(where voter_profile_id=(select id from public.profiles where owner_user_id=(select auth.uid()))) viewer_vote
 from public.review_votes where reviewer_profile_id=r.profile_id and game_id=r.game_id) v on true
 where r.game_id=p_game_id and p.is_public and p.is_discoverable and length(btrim(r.review))>0
 order by coalesce(v.upvotes,0)-coalesce(v.downvotes,0) desc,r.updated_at desc nulls last,r.profile_id
 limit 25 offset greatest(0,least(coalesce(p_offset,0),10000));
$$;
revoke all on function private.game_reviews(bigint,integer) from public;
grant execute on function private.game_reviews(bigint,integer) to anon,authenticated;
create function public.game_reviews(p_game_id bigint,p_offset integer default 0)
returns table(profile_id bigint,handle text,display_name text,avatar_url text,review text,score smallint,tier text,updated_at timestamptz,upvotes bigint,downvotes bigint,viewer_vote smallint)
language sql stable security invoker set search_path='' as $$select * from private.game_reviews(p_game_id,p_offset);$$;
revoke all on function public.game_reviews(bigint,integer) from public;
grant execute on function public.game_reviews(bigint,integer) to anon,authenticated;
