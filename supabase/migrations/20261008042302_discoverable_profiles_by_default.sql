-- New public profiles start discoverable; later owner opt-outs remain unchanged.
alter table public.profiles alter column is_discoverable set default true;
