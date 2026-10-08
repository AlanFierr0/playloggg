create function public.valid_tier_ranges(ranges jsonb) returns boolean
language plpgsql immutable security invoker set search_path = '' as $$
declare bounds jsonb; name text; score integer;
begin
  if jsonb_typeof(ranges) <> 'object' or (select count(*) from jsonb_object_keys(ranges)) <> 6 then return false; end if;
  foreach name in array array['S','A','B','C','D','F'] loop
    bounds := ranges->name;
    if bounds is null or jsonb_typeof(bounds) <> 'array' or jsonb_array_length(bounds) <> 2 then return false; end if;
    if jsonb_typeof(bounds->0) <> 'number' or jsonb_typeof(bounds->1) <> 'number'
       or bounds->>0 !~ '^[0-9]+$' or bounds->>1 !~ '^[0-9]+$'
       or (bounds->>0)::integer < 0 or (bounds->>1)::integer > 100 or (bounds->>0)::integer > (bounds->>1)::integer then return false; end if;
  end loop;
  for score in 0..100 loop
    if (select count(*) from jsonb_each(ranges) where score between (value->>0)::integer and (value->>1)::integer) > 1 then return false; end if;
  end loop;
  return true;
exception when others then return false;
end;
$$;
revoke all on function public.valid_tier_ranges(jsonb) from public;
grant execute on function public.valid_tier_ranges(jsonb) to anon, authenticated, service_role;
alter table public.profiles add column tier_ranges jsonb not null default '{"S":[95,100],"A":[90,94],"B":[80,89],"C":[70,79],"D":[50,69],"F":[0,49]}'::jsonb
  check (public.valid_tier_ranges(tier_ranges));
grant select (tier_ranges) on public.profiles to anon, authenticated;
alter table public.ratings add column tier_manual boolean not null default false;
-- Preserve all existing assigned tiers as approved manual exceptions.
update public.ratings set tier_manual = true where tier is not null;
grant insert (tier_manual), update (tier_manual) on public.ratings to authenticated;
create function private.assign_score_tier() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if not new.tier_manual then
    new.tier := (select entry.key from public.profiles p, lateral jsonb_each(p.tier_ranges) entry
      where p.id = new.profile_id and new.score between (entry.value->>0)::integer and (entry.value->>1)::integer);
  end if;
  return new;
end;
$$;
create trigger assign_score_tier before insert or update on public.ratings for each row execute function private.assign_score_tier();
create function private.reapply_score_tiers() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.tier_ranges is distinct from old.tier_ranges then
    update public.ratings set tier = tier, updated_at = now() where profile_id = new.id and not tier_manual;
  end if;
  return new;
end;
$$;
create trigger reapply_score_tiers after update of tier_ranges on public.profiles for each row execute function private.reapply_score_tiers();
update public.ratings set tier = tier where not tier_manual and score is not null;
comment on column public.ratings.tier is 'Automatic from profile score ranges unless tier_manual is true.';
comment on column public.ratings.tier_manual is 'Manual tier assignments (including unassigned) stay fixed until explicitly returned to automatic mode.';
