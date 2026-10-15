-- Steam identities are reserved to one Auth account, including email accounts.
create table public.steam_accounts (
  steam_id text primary key check (steam_id ~ '^7656119[0-9]{10}$'),
  user_id uuid not null unique references auth.users(id) on delete cascade
);
alter table public.steam_accounts enable row level security;
revoke all on public.steam_accounts from public, anon, authenticated;
grant select, insert on public.steam_accounts to service_role;

insert into public.steam_accounts (steam_id, user_id)
select raw_app_meta_data->>'playlogg_steam_id', id
from auth.users
where raw_app_meta_data->>'playlogg_steam_id' ~ '^7656119[0-9]{10}$';
