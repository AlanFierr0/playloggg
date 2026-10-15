-- Rollback-only check of the default, owner opt-out and private visibility.
begin;
do $$ declare p bigint; discoverable boolean; begin
  insert into public.profiles(handle,display_name)
  values ('discovery_'||left(replace(gen_random_uuid()::text,'-',''),16),'Rollback discovery check')
  returning id,is_discoverable into p,discoverable;
  if not discoverable then raise exception 'New profiles must be discoverable'; end if;
  update public.profiles set is_discoverable=false where id=p;
  if (select is_discoverable from public.profiles where id=p) then raise exception 'Opt-out must persist'; end if;
  update public.profiles set is_public=false where id=p;
  if not exists(select 1 from public.profiles where id=p and not is_public and not is_discoverable) then
    raise exception 'Private profiles must stay hidden';
  end if;
end $$;
rollback;
