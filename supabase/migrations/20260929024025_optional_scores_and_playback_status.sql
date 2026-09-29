-- A portfolio entry may be logged before it receives a personal score.
alter table public.ratings alter column score drop not null;
alter table public.ratings add column status text
  check (status in ('completed', 'playing', 'backlog', 'shelved'));

comment on column public.ratings.score is 'Optional personal score from 0 to 100. Null means unrated; zero is a real score.';
comment on column public.ratings.status is 'Optional saved playback status. Null means not supplied; existing sample statuses are not invented.';

-- Extend the existing owner-only write grants; existing ownership policies apply.
grant insert (status), update (status) on public.ratings to authenticated;
