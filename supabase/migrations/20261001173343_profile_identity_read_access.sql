-- Expose optional identity fields only through existing profile visibility RLS.
grant select (bio, location, platform_preference) on public.profiles to anon, authenticated;
