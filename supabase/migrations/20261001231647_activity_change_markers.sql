alter table public.profile_activity add column score_changed boolean not null default false;
alter table public.profile_activity add column completion_changed boolean not null default false;
create or replace function private.record_entry_activity() returns trigger language plpgsql security definer set search_path='' as $$
declare score_changed boolean; completion_changed boolean;
begin
 if TG_OP='INSERT' then score_changed=new.score is not null;completion_changed=new.status='completed';
 else
 score_changed=new.score is not null and new.score is distinct from old.score;
 completion_changed=new.status='completed' and new.status is distinct from old.status;
 if new.score is not distinct from old.score and new.tier is not distinct from old.tier and new.status is not distinct from old.status and new.review is not distinct from old.review then return new;end if;
 end if;
 insert into public.profile_activity(profile_id,game_id,kind,score,status,tier,score_changed,completion_changed) values(new.profile_id,new.game_id,'entry',new.score,new.status,new.tier,score_changed,coalesce(completion_changed,false));
 return new;
end;$$;
drop policy activity_public on public.profile_activity;
create policy activity_public on public.profile_activity for select to anon using(exists(select 1 from public.profiles p where p.id=profile_id and p.is_public and p.is_discoverable));
create policy activity_authenticated on public.profile_activity for select to authenticated using(exists(select 1 from public.profiles p where p.id=profile_id and p.is_public and p.is_discoverable) and not exists(select 1 from public.profile_blocks b join public.profiles me on me.owner_user_id=(select auth.uid()) where (b.blocker_id=me.id and b.blocked_id=profile_activity.profile_id) or (b.blocker_id=profile_activity.profile_id and b.blocked_id=me.id)));
create policy likes_owner_read on public.list_likes for select to authenticated using(exists(select 1 from public.profiles p where p.id=profile_id and p.owner_user_id=(select auth.uid())));

