-- Approved IGDB enrichment of shared games. Personal ratings remain untouched.
alter table public.games
  add column igdb_id bigint unique check (igdb_id > 0),
  add column released_on date,
  add column genres text[] not null default '{}',
  add column cover_image_id text,
  add column artwork_image_ids text[] not null default '{}',
  add column screenshot_image_ids text[] not null default '{}',
  add column igdb_url text,
  add column igdb_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(igdb_metadata) = 'object'),
  add column igdb_synced_at timestamptz;

comment on column public.games.released_on is 'IGDB first_release_date, converted to a UTC calendar date. Earliest release, not regional release.';
comment on column public.games.genres is 'IGDB genre names for display. Source IDs are retained in igdb_metadata.';
comment on column public.games.igdb_metadata is 'Public game metadata only: source IDs, platforms, developers, publishers, summary and game type. Never credentials or personal data. Not passed to screen props.';
comment on column public.games.igdb_synced_at is 'Time of the explicit administrative import. No runtime provider requests or automatic refresh.';
-- Existing SELECT grants and RLS continue to apply. No new application writes.
