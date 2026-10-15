create table private.review_translations(
 profile_id bigint not null,game_id bigint not null,target text not null check(target in('EN','ES')),
 content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),
 translated_text text not null check(length(translated_text)<=40000),source_language text not null check(source_language ~ '^[A-Z-]{2,10}$'),
 primary key(profile_id,game_id,target),foreign key(profile_id,game_id) references public.ratings(profile_id,game_id) on delete cascade
);
alter table private.review_translations enable row level security;
revoke all on private.review_translations from public,anon,authenticated;
grant select,insert,update,delete on private.review_translations to service_role;
create table private.translation_usage(period_start date primary key,characters integer not null check(characters between 0 and 500000));
alter table private.translation_usage enable row level security;
revoke all on private.translation_usage from public,anon,authenticated;
grant select,insert,update on private.translation_usage to service_role;
create function public.reserve_review_translation(p_characters integer) returns boolean language plpgsql security invoker set search_path='' as $$
declare used integer; begin
 if p_characters not between 1 and 20000 then raise exception 'Invalid translation size'; end if;
 insert into private.translation_usage(period_start,characters) values(date_trunc('month',now() at time zone 'UTC')::date,p_characters)
 on conflict(period_start) do update set characters=translation_usage.characters+excluded.characters
 where translation_usage.characters+excluded.characters<=500000 returning characters into used;
 return used is not null;
end;$$;
create function public.read_review_translation(p_profile_id bigint,p_game_id bigint,p_hash text,p_target text) returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('text',translated_text,'sourceLanguage',source_language) from private.review_translations
 where profile_id=p_profile_id and game_id=p_game_id and content_hash=p_hash and target=p_target;
$$;
create function public.store_review_translation(p_profile_id bigint,p_game_id bigint,p_hash text,p_target text,p_original text,p_translation text,p_source_language text)
returns boolean language sql security invoker set search_path='' as $$
 with saved as (
 insert into private.review_translations(profile_id,game_id,target,content_hash,translated_text,source_language)
 select r.profile_id,r.game_id,p_target,p_hash,p_translation,p_source_language from public.ratings r
 where r.profile_id=p_profile_id and r.game_id=p_game_id and r.review=p_original
 on conflict(profile_id,game_id,target) do update set content_hash=excluded.content_hash,translated_text=excluded.translated_text,source_language=excluded.source_language
 returning 1) select exists(select 1 from saved);
$$;
revoke all on function public.reserve_review_translation(integer),public.read_review_translation(bigint,bigint,text,text),public.store_review_translation(bigint,bigint,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.reserve_review_translation(integer),public.read_review_translation(bigint,bigint,text,text),public.store_review_translation(bigint,bigint,text,text,text,text,text) to service_role;
create function private.invalidate_review_translations() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.review is distinct from old.review then delete from private.review_translations where profile_id=new.profile_id and game_id=new.game_id;end if;
 return new;
end;$$;
revoke all on function private.invalidate_review_translations() from public,anon,authenticated;
create trigger invalidate_review_translations after update of review on public.ratings for each row execute function private.invalidate_review_translations();
