-- Counters live outside the exposed schema. Only the trusted server can consume them.
create table private.operation_limits (
 actor text not null check(length(actor) between 1 and 128),
 operation text not null check(length(operation) between 1 and 40),
 period_seconds integer not null check(period_seconds in (60,86400)),
 window_start timestamptz not null,
 used integer not null check(used > 0),
 primary key(actor,operation,period_seconds)
);
alter table private.operation_limits enable row level security;
revoke all on private.operation_limits from public,anon,authenticated;
grant usage on schema private to service_role;
grant select,insert,update on private.operation_limits to service_role;

create function public.consume_operation_limit(p_actor text,p_operation text,p_seconds integer,p_limit integer)
returns integer language plpgsql security invoker set search_path='' as $$
declare window_begin timestamptz; now_at timestamptz:=clock_timestamp(); used_count integer;
begin
 if p_seconds not in (60,86400) or p_limit not between 1 and 5000 then raise exception 'Invalid quota'; end if;
 window_begin:=to_timestamp(floor(extract(epoch from now_at)/p_seconds)*p_seconds);
 insert into private.operation_limits(actor,operation,period_seconds,window_start,used)
 values(p_actor,p_operation,p_seconds,window_begin,1)
 on conflict(actor,operation,period_seconds) do update
 set window_start=excluded.window_start, used=case when operation_limits.window_start=excluded.window_start then operation_limits.used+1 else 1 end
 where operation_limits.window_start<>excluded.window_start or operation_limits.used<p_limit
 returning used into used_count;
 if used_count is not null then return 0; end if;
 return greatest(1,ceil(extract(epoch from window_begin+make_interval(secs=>p_seconds)-now_at))::integer);
end;$$;
revoke all on function public.consume_operation_limit(text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.consume_operation_limit(text,text,integer,integer) to service_role;

create index profile_activity_game_id_idx on public.profile_activity(game_id);

-- Aggregate within RLS and current discovery consent; never cache private visibility.
create function public.community_game_scores(p_ids bigint[] default null)
returns table(game_id bigint,sample_count bigint,average numeric,deviation numeric)
language sql stable security invoker set search_path='' as $$
 select r.game_id,count(*)::bigint,round(avg(r.score),1),stddev_pop(r.score)
 from public.ratings r join public.profiles p on p.id=r.profile_id
 where p.is_public and p.is_discoverable and r.score is not null
 and (p_ids is null or r.game_id=any(p_ids))
 group by r.game_id having count(*)>=5;
$$;
revoke all on function public.community_game_scores(bigint[]) from public;
grant execute on function public.community_game_scores(bigint[]) to anon,authenticated;

create function public.community_trending_games()
returns table(game_id bigint,sample_count bigint)
language sql stable security invoker set search_path='' as $$
 select a.game_id,count(distinct a.profile_id)::bigint
 from public.profile_activity a join public.profiles p on p.id=a.profile_id
 where p.is_public and p.is_discoverable and a.score_changed and a.game_id is not null
 and a.occurred_at between now()-interval '30 days' and now()
 group by a.game_id order by count(distinct a.profile_id) desc,a.game_id limit 5;
$$;
revoke all on function public.community_trending_games() from public;
grant execute on function public.community_trending_games() to anon,authenticated;
