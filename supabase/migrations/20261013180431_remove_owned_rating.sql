-- Match save_rating's owner lock and revision check; favorites are independent.
create function private.remove_rating(p_game_id bigint, p_expected_updated_at timestamptz)
returns boolean language plpgsql security definer set search_path='' as $$
declare owned bigint; previous public.ratings;
begin
  select id into owned from public.profiles where owner_user_id=(select auth.uid());
  if owned is null then raise exception 'Owned profile required' using errcode='42501'; end if;
  perform pg_catalog.pg_advisory_xact_lock(owned);
  select * into previous from public.ratings where profile_id=owned and game_id=p_game_id for update;
  if not found then return false; end if;
  if p_expected_updated_at is null or previous.updated_at is distinct from p_expected_updated_at then
    raise exception 'Entry changed' using errcode='40001';
  end if;
  update public.profile_rankings r set
    game_ids=array_remove(r.game_ids,p_game_id),
    manual_positions=coalesce((select jsonb_object_agg(item.key,
      item.value::text::integer-case when item.value::text::integer>array_position(r.game_ids,p_game_id)-1 then 1 else 0 end)
      from jsonb_each(r.manual_positions) item where item.key<>p_game_id::text),'{}'),
    revision=r.revision+1
    where r.profile_id=owned and p_game_id=any(r.game_ids);
  delete from public.profile_activity where profile_id=owned and game_id=p_game_id and kind='entry';
  delete from public.ratings where profile_id=owned and game_id=p_game_id;
  return true;
end; $$;
revoke all on function private.remove_rating(bigint,timestamptz) from public,anon;
grant execute on function private.remove_rating(bigint,timestamptz) to authenticated;
create function public.remove_rating(p_game_id bigint,p_expected_updated_at timestamptz)
returns boolean language sql security invoker set search_path='' as $$
 select private.remove_rating(p_game_id,p_expected_updated_at);
$$;
revoke all on function public.remove_rating(bigint,timestamptz) from public,anon;
grant execute on function public.remove_rating(bigint,timestamptz) to authenticated;
