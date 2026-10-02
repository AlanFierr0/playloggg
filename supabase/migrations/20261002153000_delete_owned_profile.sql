-- Server-only transactional deletion; personal ownership comes from verified Auth.
create function public.delete_owned_profile(p_owner uuid, p_handle text)
returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare target public.profiles%rowtype;
begin
  select * into target from public.profiles
    where owner_user_id=p_owner and handle=p_handle for update;
  if not found then raise exception 'Owned profile not found'; end if;
  delete from public.ratings where profile_id=target.id;
  delete from public.curated_lists where profile_id=target.id;
  delete from public.profiles where id=target.id and owner_user_id=p_owner;
  return jsonb_build_object('id',target.id,'avatar',target.avatar_url);
end;
$$;
revoke all on function public.delete_owned_profile(uuid,text) from public,anon,authenticated;
grant execute on function public.delete_owned_profile(uuid,text) to service_role;
