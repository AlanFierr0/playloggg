-- Anonymous readers can count public-list likes, never read the liking profile IDs.
grant select(list_id) on public.list_likes to anon;
create policy discoverable_list_like_counts on public.list_likes for select to anon using(exists(select 1 from public.curated_lists l join public.profiles p on p.id=l.profile_id where l.id=list_id and l.is_public and p.is_public and p.is_discoverable));
create function public.public_list_like_counts() returns table(list_id bigint,likes bigint) language sql stable security invoker set search_path='' as $$
 select ll.list_id,count(ll.list_id) from public.list_likes ll join public.curated_lists l on l.id=ll.list_id join public.profiles p on p.id=l.profile_id where l.is_public and p.is_public and p.is_discoverable group by ll.list_id;
$$;
revoke all on function public.public_list_like_counts() from public;
grant execute on function public.public_list_like_counts() to anon,authenticated;
create index profile_activity_recent_scores on public.profile_activity(occurred_at,id) where score_changed;
