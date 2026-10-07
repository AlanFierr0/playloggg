create table public.review_votes (
  reviewer_profile_id bigint not null,
  game_id bigint not null,
  voter_profile_id bigint not null references public.profiles(id) on delete cascade,
  value smallint not null check (value in (-1,1)),
  primary key (reviewer_profile_id,game_id,voter_profile_id),
  foreign key (reviewer_profile_id,game_id) references public.ratings(profile_id,game_id) on delete cascade,
  check (reviewer_profile_id <> voter_profile_id)
);
create index review_votes_voter_idx on public.review_votes(voter_profile_id);
alter table public.review_votes enable row level security;
revoke all on public.review_votes from anon,authenticated;
grant select,insert,update,delete on public.review_votes to authenticated;
grant all on public.review_votes to service_role;

create policy review_votes_owner_read on public.review_votes for select to authenticated
using (exists(select 1 from public.profiles p where p.id=voter_profile_id and p.owner_user_id=(select auth.uid())));
create policy review_votes_owner_delete on public.review_votes for delete to authenticated
using (exists(select 1 from public.profiles p where p.id=voter_profile_id and p.owner_user_id=(select auth.uid())));
create policy review_votes_owner_insert on public.review_votes for insert to authenticated
with check (
  exists(select 1 from public.profiles p where p.id=voter_profile_id and p.owner_user_id=(select auth.uid()))
  and exists(select 1 from public.ratings r join public.profiles p on p.id=r.profile_id
    where r.profile_id=reviewer_profile_id and r.game_id=review_votes.game_id and p.is_public and length(btrim(r.review))>0)
);
create policy review_votes_owner_update on public.review_votes for update to authenticated
using (exists(select 1 from public.profiles p where p.id=voter_profile_id and p.owner_user_id=(select auth.uid())))
with check (
  exists(select 1 from public.profiles p where p.id=voter_profile_id and p.owner_user_id=(select auth.uid()))
  and exists(select 1 from public.ratings r join public.profiles p on p.id=r.profile_id
    where r.profile_id=reviewer_profile_id and r.game_id=review_votes.game_id and p.is_public and length(btrim(r.review))>0)
);

-- Aggregate private voters without revealing identities. Always recheck review visibility.
create function private.review_helpfulness(p_profile_id bigint)
returns table(game_slug text,upvotes bigint,downvotes bigint,viewer_vote smallint)
language sql stable security definer set search_path=''
as $$
  select g.slug, count(v.value) filter(where v.value=1), count(v.value) filter(where v.value=-1),
    coalesce(max(v.value) filter(where voter.owner_user_id=(select auth.uid())),0)::smallint
  from public.ratings r join public.profiles p on p.id=r.profile_id
  join public.games g on g.id=r.game_id
  left join public.review_votes v on v.reviewer_profile_id=r.profile_id and v.game_id=r.game_id
  left join public.profiles voter on voter.id=v.voter_profile_id
  where r.profile_id=p_profile_id and p.is_public and length(btrim(r.review))>0
  group by g.slug;
$$;
revoke all on function private.review_helpfulness(bigint) from public;
grant usage on schema private to anon,authenticated;
grant execute on function private.review_helpfulness(bigint) to anon,authenticated;
create function public.review_helpfulness(p_profile_id bigint)
returns table(game_slug text,upvotes bigint,downvotes bigint,viewer_vote smallint)
language sql stable security invoker set search_path=''
as $$ select * from private.review_helpfulness(p_profile_id); $$;
revoke all on function public.review_helpfulness(bigint) from public;
grant execute on function public.review_helpfulness(bigint) to anon,authenticated;
