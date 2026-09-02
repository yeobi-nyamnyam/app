-- =========================================
-- F7 여행 자동 완료 RPC
--
-- 클라이언트(index.tsx)가 end_date < 오늘인 ongoing 여행을 발견하면 이 함수를
-- 호출해 trips.status를 completed로 바꾸고, L1 "여행완주" 포인트(+100, 여행당
-- 1회)를 exp_ledger에 기록한다. G0~G17 배지 판정과 ±10%완주보너스(G2)는
-- badges 시드 데이터가 아직 없어 이번 범위에서 제외 — 후속 이슈에서 이 함수에
-- 이어붙일 예정 (business-logic-notes.md §6/§7).
--
-- trips_own/exp_ledger_own RLS(auth.uid() = user_id)가 이미 소유자만 허용하므로
-- create_trip_with_meal_slots와 동일하게 security definer는 불필요.
-- =========================================
create or replace function public.complete_trip(
  p_trip_id uuid
) returns public.trips language plpgsql as $$
declare
  v_trip public.trips;
begin
  update public.trips
  set status = 'completed'
  where id = p_trip_id and status = 'ongoing'
  returning * into v_trip;

  if v_trip.id is null then
    raise exception '완료 처리할 진행 중인 여행을 찾을 수 없습니다';
  end if;

  insert into public.exp_ledger (user_id, trip_id, event_type, points)
  values (v_trip.user_id, v_trip.id, 'trip_complete', 100);

  return v_trip;
end;
$$;
