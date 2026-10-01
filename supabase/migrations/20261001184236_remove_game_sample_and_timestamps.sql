-- User-approved removal of catalog-only bookkeeping columns.
-- Deploy compatible catalog reads/imports before applying this migration.
-- No CASCADE: unexpected dependencies must fail instead of removing other objects.
begin;
lock table public.games in access exclusive mode;
create temporary table catalog_columns_before on commit drop as
select count(*) as game_count,
  md5(coalesce(string_agg((to_jsonb(g) - array['is_sample','created_at','updated_at'])::text, '' order by id), '')) as contents_hash
from public.games g;

alter table public.games
  drop column is_sample,
  drop column created_at,
  drop column updated_at;

do $$ declare before record; begin
  select * into before from catalog_columns_before;
  if (select count(*) from public.games) <> before.game_count
    or (select md5(coalesce(string_agg(to_jsonb(g)::text, '' order by id), '')) from public.games g) <> before.contents_hash then
    raise exception 'Catalog content changed while removing bookkeeping columns';
  end if;
end $$;
commit;
