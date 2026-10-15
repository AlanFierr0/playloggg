-- Approved public defaults and one-time publication of existing profiles.
alter table public.profiles alter column is_public set default true;
update public.profiles set is_public = true, updated_at = now() where not is_public;
-- Discovery participation and all ownership/RLS rules remain unchanged.
