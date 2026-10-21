-- =========================================
-- 포인트/배지 직접 조작 차단
--
-- exp_ledger, user_badges 정책이 `for all`이라 로그인한 사용자가 GraphQL로
-- insertIntoexp_ledgerCollection(points: 999999)처럼 직접 쓰거나, award_badge를
-- 직접 호출해 아무 배지나 받을 수 있었다. 실제로 이 테이블에 쓰는 곳은
-- complete_trip RPC 하나뿐이고 앱은 조회만 한다.
--
-- 1. 두 테이블 정책을 조회 전용으로 바꾼다.
-- 2. complete_trip을 security definer로 바꿔 RLS 없이 기록하게 한다. 대신 RLS가
--    해주던 본인 확인을 user_id = auth.uid()로 함수 안에서 직접 한다.
-- 3. award_badge/judge_trip_badges는 complete_trip 안에서만 쓰이므로 클라이언트
--    역할의 실행 권한을 회수한다 (definer인 complete_trip 안에서는 소유자 권한으로 실행됨).
--
-- budget_change_history는 기록 RPC들(invoker)이 사용자 권한으로 쓰고 있어 이번 범위에서 제외.
-- =========================================

drop policy "exp_ledger_own" on public.exp_ledger;
create policy "exp_ledger_read_own" on public.exp_ledger
  for select using (auth.uid() = user_id);

drop policy "user_badges_own" on public.user_badges;
create policy "user_badges_read_own" on public.user_badges
  for select using (auth.uid() = user_id);

create or replace function public.complete_trip(
  p_trip_id uuid
) returns public.trips
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trip public.trips;
  v_already_awarded boolean;
begin
  update public.trips
  set status = 'completed'
  where id = p_trip_id and status = 'ongoing' and user_id = auth.uid()
  returning * into v_trip;

  if v_trip.id is null then
    raise exception '완료 처리할 진행 중인 여행을 찾을 수 없습니다';
  end if;

  select exists(
    select 1 from public.exp_ledger
    where trip_id = v_trip.id and event_type = 'trip_complete'
  ) into v_already_awarded;

  if not v_already_awarded then
    insert into public.exp_ledger (user_id, trip_id, event_type, points)
    values (v_trip.user_id, v_trip.id, 'trip_complete', 100);
  end if;

  perform public.judge_trip_badges(v_trip.id);

  return v_trip;
end;
$$;

revoke execute on function public.award_badge(uuid, uuid, text) from public, anon, authenticated;
revoke execute on function public.judge_trip_badges(uuid) from public, anon, authenticated;
