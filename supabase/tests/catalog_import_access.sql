-- Catalog imports use an authorized server client, not public table writes.
-- Temporary test games are rolled back. Do not run without the final rollback.
begin;

do $$ begin
  if has_table_privilege('anon', 'public.games', 'INSERT')
    or has_table_privilege('authenticated', 'public.games', 'INSERT')
    or has_table_privilege('authenticated', 'public.games', 'UPDATE')
    or has_table_privilege('authenticated', 'public.games', 'DELETE') then
    raise exception 'Public catalog writes must remain denied';
  end if;
  if not has_table_privilege('service_role', 'public.games', 'INSERT') then
    raise exception 'Server import role requires INSERT';
  end if;
end $$;

set local role anon;
do $$ begin
  begin
    insert into public.games (slug,title,cover_url) values ('catalog-access-forged','Forged','/images/missing-cover.svg');
  exception when insufficient_privilege then return;
  end;
  raise exception 'Anonymous insert was unexpectedly permitted';
end $$;

reset role;
set local role authenticated;
do $$ begin
  begin
    insert into public.games (slug,title,cover_url) values ('catalog-access-forged','Forged','/images/missing-cover.svg');
  exception when insufficient_privilege then return;
  end;
  raise exception 'Authenticated direct insert was unexpectedly permitted';
end $$;

reset role;
set local role service_role;
do $$
declare source_id bigint := 2000000000 + floor(random() * 100000000)::bigint;
declare saved_slug text := 'catalog-test-' || source_id;
declare before_ratings bigint := (select count(*) from public.ratings);
declare before_lists bigint := (select count(*) from public.curated_list_items);
begin
  if exists (select 1 from public.games where igdb_id=source_id or slug=saved_slug) then
    raise exception 'Test ID already exists; retry with a fresh fixture';
  end if;
  insert into public.games (slug,title,cover_url,igdb_id,is_sample)
    values (saved_slug,'Original import','/images/missing-cover.svg',source_id,false);
  insert into public.games (slug,title,cover_url,igdb_id,is_sample)
    values (saved_slug || '-changed','Overwrite attempt','/changed',source_id,true)
    on conflict (igdb_id) do nothing;
  if (select count(*) from public.games where igdb_id=source_id) <> 1
    or not exists (select 1 from public.games where igdb_id=source_id and slug=saved_slug and title='Original import' and not is_sample) then
    raise exception 'Duplicate imports must reuse the original row without overwriting';
  end if;
  if before_ratings <> (select count(*) from public.ratings)
    or before_lists <> (select count(*) from public.curated_list_items) then
    raise exception 'Import must not create personal entries or list membership';
  end if;
end $$;

reset role;
rollback;
