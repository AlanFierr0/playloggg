-- Approved public read-only portfolio foundation. No application write access.
create table public.profiles (
  id bigint generated always as identity primary key,
  handle text not null unique check (length(trim(handle)) > 0),
  display_name text not null check (length(trim(display_name)) > 0),
  avatar_url text,
  is_public boolean not null default false,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.games (
  id bigint generated always as identity primary key,
  slug text not null unique check (length(trim(slug)) > 0),
  title text not null check (length(trim(title)) > 0),
  cover_url text not null,
  release_year smallint,
  search_keywords text not null default '',
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ratings (
  profile_id bigint not null references public.profiles(id) on delete restrict,
  game_id bigint not null references public.games(id) on delete restrict,
  score smallint not null check (score between 0 and 100),
  tier text check (tier in ('S', 'A', 'B', 'C', 'D', 'F')),
  review text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, game_id)
);

create index ratings_game_id_idx on public.ratings(game_id);

comment on table public.profiles is 'Reusable profiles; sample content is explicitly marked. Auth ownership is deferred.';
comment on table public.games is 'Shared game metadata. Personal scores belong to ratings.';
comment on table public.ratings is 'One current rating/review per profile/game. Tier is independent of score. Rank by score descending, then game slug ascending.';
comment on column public.ratings.tier is 'Null means no tier was supplied; never derive it from score.';
comment on column public.profiles.updated_at is 'Maintained by future approved administrative/application writes; no application write flow exists yet.';

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.ratings enable row level security;

revoke all on table public.profiles, public.games, public.ratings from public, anon, authenticated;
revoke all on sequence public.profiles_id_seq, public.games_id_seq from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on table public.profiles, public.games, public.ratings to anon, authenticated;

create policy published_profiles_read on public.profiles
  for select to anon, authenticated using (is_public);

create policy catalog_read on public.games
  for select to anon, authenticated using (true);

create policy published_profile_ratings_read on public.ratings
  for select to anon, authenticated
  using (exists (
    select 1 from public.profiles
    where profiles.id = ratings.profile_id and profiles.is_public
  ));
