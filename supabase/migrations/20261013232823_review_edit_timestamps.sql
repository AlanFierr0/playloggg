-- Historical review edit dates are unknown; preserve the last known entry date.
alter table public.ratings add column review_updated_at timestamptz;
alter table public.ratings disable trigger stamp_rating_update;
alter table public.ratings disable trigger record_entry_activity;
update public.ratings set review_updated_at=updated_at where length(btrim(review))>0;
alter table public.ratings enable trigger stamp_rating_update;
alter table public.ratings enable trigger record_entry_activity;
grant select(review_updated_at) on public.ratings to anon,authenticated;
create function private.stamp_review_update() returns trigger language plpgsql set search_path='' as $$
begin
 if coalesce(length(btrim(new.review)),0)=0 then new.review_updated_at=null;
 elsif TG_OP='INSERT' then new.review_updated_at=clock_timestamp();
 elsif new.review is distinct from old.review then new.review_updated_at=clock_timestamp();
 else new.review_updated_at=old.review_updated_at;
 end if;
 return new;
end;$$;
revoke all on function private.stamp_review_update() from public;
create trigger stamp_review_update before insert or update on public.ratings for each row execute function private.stamp_review_update();

create or replace function private.home_reviews(p_limit integer)
returns table(profile_id bigint,game_id bigint,review text,updated_at timestamptz,handle text,display_name text,upvotes bigint,downvotes bigint,viewer_vote smallint)
language sql stable security definer set search_path='' as $$
  select r.profile_id,r.game_id,r.review,r.review_updated_at,p.handle,p.display_name,
    coalesce(v.upvotes,0),coalesce(v.downvotes,0),coalesce(v.viewer_vote,0)::smallint
  from public.ratings r join public.profiles p on p.id=r.profile_id
  left join lateral (select count(*) filter(where value=1) upvotes,count(*) filter(where value=-1) downvotes,
    max(value) filter(where voter_profile_id=(select id from public.profiles where owner_user_id=(select auth.uid()))) viewer_vote
    from public.review_votes where reviewer_profile_id=r.profile_id and game_id=r.game_id) v on true
  where p.is_public and p.is_discoverable and length(btrim(r.review))>0
  order by coalesce(v.upvotes,0)-coalesce(v.downvotes,0) desc,r.review_updated_at desc nulls last,r.profile_id,r.game_id
  limit least(greatest(p_limit,0),12);
$$;

create or replace function private.game_reviews(p_game_id bigint,p_offset integer)
returns table(profile_id bigint,handle text,display_name text,avatar_url text,review text,score smallint,tier text,updated_at timestamptz,upvotes bigint,downvotes bigint,viewer_vote smallint)
language sql stable security definer set search_path='' as $$
 select r.profile_id,p.handle,p.display_name,p.avatar_url,r.review,r.score,r.tier,r.review_updated_at,
 coalesce(v.upvotes,0),coalesce(v.downvotes,0),coalesce(v.viewer_vote,0)::smallint
 from public.ratings r join public.profiles p on p.id=r.profile_id
 left join lateral (select count(*) filter(where value=1) upvotes,count(*) filter(where value=-1) downvotes,
 max(value) filter(where voter_profile_id=(select id from public.profiles where owner_user_id=(select auth.uid()))) viewer_vote
 from public.review_votes where reviewer_profile_id=r.profile_id and game_id=r.game_id) v on true
 where r.game_id=p_game_id and p.is_public and p.is_discoverable and length(btrim(r.review))>0
 order by coalesce(v.upvotes,0)-coalesce(v.downvotes,0) desc,r.review_updated_at desc nulls last,r.profile_id
 limit 25 offset greatest(0,least(coalesce(p_offset,0),10000));
$$;
