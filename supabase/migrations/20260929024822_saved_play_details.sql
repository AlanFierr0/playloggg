-- Personal play details remain optional and use the existing owner-only RLS.
alter table public.ratings
  add column platform text check (platform in ('pc', 'ps5', 'xbox_series_x', 'steam_deck')),
  add column hours_played double precision check (hours_played >= 0 and hours_played < 'Infinity'::double precision),
  add column completed_on date check (completed_on between date '0001-01-01' and date '9999-12-31');
comment on column public.ratings.platform is 'Optional platform played: PC/Steam, PlayStation 5, Xbox Series X, or Steam Deck.';
comment on column public.ratings.hours_played is 'Optional finite nonnegative decimal hours; null is unknown and zero is a supplied value.';
comment on column public.ratings.completed_on is 'Optional calendar completion date, independent of playback status; no timezone conversion.';
grant insert (platform, hours_played, completed_on), update (platform, hours_played, completed_on) on public.ratings to authenticated;
