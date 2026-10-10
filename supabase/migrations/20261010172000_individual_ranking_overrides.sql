alter table public.profile_rankings add column manual_positions jsonb not null default '{}';
-- Existing manually saved lists retain their positions.
update public.profile_rankings r set manual_positions = coalesce((select jsonb_object_agg(item.id::text, item.position - 1)
  from unnest(r.game_ids) with ordinality item(id, position)), '{}');
create function public.save_preference_ranking_v2(p_ids bigint[], p_revision integer, p_manual jsonb)
returns integer language plpgsql security invoker set search_path = '' as $$
declare owner_id bigint; revision integer;
begin
  select id into owner_id from public.profiles where owner_user_id = (select auth.uid());
  if owner_id is null then raise exception 'Owned profile required' using errcode = '42501'; end if;
  if jsonb_typeof(p_manual) is distinct from 'object' then raise exception 'Invalid positions' using errcode = '22023'; end if;
  if exists(select 1 from jsonb_each(p_manual) item where item.key !~ '^[0-9]+$'
    or jsonb_typeof(item.value) <> 'number' or item.value::text !~ '^[0-9]+$') then
    raise exception 'Invalid positions' using errcode = '22023';
  end if;
  if exists(select 1 from jsonb_each(p_manual) item where not item.key::bigint = any(p_ids)
    or item.value::text::integer >= cardinality(p_ids)) then raise exception 'Invalid positions' using errcode = '22023'; end if;
  revision := public.save_preference_ranking(p_ids, p_revision);
  update public.profile_rankings set manual_positions = p_manual where profile_id = owner_id;
  return revision;
end;
$$;
revoke all on function public.save_preference_ranking_v2(bigint[], integer, jsonb) from public, anon;
grant execute on function public.save_preference_ranking_v2(bigint[], integer, jsonb) to authenticated;
