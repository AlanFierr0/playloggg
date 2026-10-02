begin;
do $$
declare owner_a uuid:=gen_random_uuid(); owner_b uuid:=gen_random_uuid(); profile_a bigint; profile_b bigint; catalog_id bigint; list_a bigint; handle_a text:='verify_'||substr(replace(owner_a::text,'-',''),1,20);
begin
  if has_function_privilege('anon','public.delete_owned_profile(uuid,text)','EXECUTE')
    or has_function_privilege('authenticated','public.delete_owned_profile(uuid,text)','EXECUTE')
    or not has_function_privilege('service_role','public.delete_owned_profile(uuid,text)','EXECUTE')
  then raise exception 'Unexpected delete privileges'; end if;
  insert into auth.users(id) values(owner_a),(owner_b);
  insert into public.profiles(owner_user_id,handle,display_name) values(owner_a,handle_a,'Rollback verification') returning id into profile_a;
  insert into public.profiles(owner_user_id,handle,display_name) values(owner_b,handle_a||'b','Rollback peer') returning id into profile_b;
  select id into catalog_id from public.games order by id limit 1;
  insert into public.ratings(profile_id,game_id,score) values(profile_a,catalog_id,85),(profile_b,catalog_id,90);
  insert into public.curated_lists(profile_id,name) values(profile_a,'Rollback list') returning id into list_a;
  insert into public.curated_list_items(list_id,game_id,position) values(list_a,catalog_id,1);
  insert into public.profile_favorites(profile_id,game_id) values(profile_a,catalog_id);
  begin
    perform public.delete_owned_profile(owner_b,handle_a);
    raise exception 'Wrong owner unexpectedly deleted a profile';
  exception when raise_exception then
    if sqlerrm <> 'Owned profile not found' then raise; end if;
  end;
  perform public.delete_owned_profile(owner_a,handle_a);
  if exists(select 1 from public.profiles where id=profile_a)
    or exists(select 1 from public.ratings where profile_id=profile_a)
    or exists(select 1 from public.curated_lists where profile_id=profile_a)
    or exists(select 1 from public.curated_list_items where list_id=list_a)
    or exists(select 1 from public.profile_favorites where profile_id=profile_a)
    or not exists(select 1 from public.ratings where profile_id=profile_b and score=90)
    or not exists(select 1 from auth.users where id=owner_a)
    or not exists(select 1 from public.games where id=catalog_id)
  then raise exception 'Deletion verification failed'; end if;
end $$;
rollback;
