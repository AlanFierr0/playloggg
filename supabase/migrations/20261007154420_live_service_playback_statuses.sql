-- Add live-service choices without rewriting existing entries or changing access.
begin;
alter table public.ratings drop constraint ratings_status_check;
alter table public.ratings add constraint ratings_status_check
  check (status in ('completed', 'playing', 'backlog', 'shelved', 'active', 'paused', 'stopped'));
commit;
