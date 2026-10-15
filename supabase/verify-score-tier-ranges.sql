-- Run after the migration. All personal data changes roll back.
begin;
do $$
declare p bigint; g bigint;
begin
 select profile_id,game_id into strict p,g from public.ratings limit 1;
 update public.ratings set score=0,tier_manual=false where profile_id=p and game_id=g;
 if not exists(select 1 from public.ratings where profile_id=p and game_id=g and tier='F') then raise exception 'Zero must assign F'; end if;
 update public.ratings set score=96 where profile_id=p and game_id=g;
 if not exists(select 1 from public.ratings where profile_id=p and game_id=g and tier='S') then raise exception 'Score update must assign S'; end if;
 update public.ratings set tier='A',tier_manual=true,score=75 where profile_id=p and game_id=g;
 update public.profiles set tier_ranges=jsonb_set(tier_ranges,'{C}','[76,79]'::jsonb) where id=p;
 if not exists(select 1 from public.ratings where profile_id=p and game_id=g and tier='A' and tier_manual) then raise exception 'Manual tiers must survive score and range changes'; end if;
 update public.ratings set tier_manual=false where profile_id=p and game_id=g;
 if not exists(select 1 from public.ratings where profile_id=p and game_id=g and tier is null) then raise exception 'Uncovered scores must be unassigned'; end if;
 update public.profiles set tier_ranges=jsonb_set(tier_ranges,'{C}','[70,79]'::jsonb) where id=p;
 if not exists(select 1 from public.ratings where profile_id=p and game_id=g and tier='C') then raise exception 'Range updates must recalculate automatic games'; end if;
 update public.ratings set score=null where profile_id=p and game_id=g;
 if not exists(select 1 from public.ratings where profile_id=p and game_id=g and tier is null) then raise exception 'Unscored games must be unassigned'; end if;
 if public.valid_tier_ranges('{"S":[90,100],"A":[90,94],"B":[80,89],"C":[70,79],"D":[50,69],"F":[0,49]}') then raise exception 'Overlapping ranges accepted'; end if;
 if not (select relrowsecurity from pg_class where oid='public.ratings'::regclass) then raise exception 'Ratings RLS disabled'; end if;
end $$;
rollback;
