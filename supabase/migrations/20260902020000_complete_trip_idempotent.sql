-- =========================================
-- complete_trip 중복 실행 방지
--
-- exp_ledger에는 유니크 제약이 없고(반복 이벤트인 끼니기록/착한가격이용 등과
-- 테이블을 공유해서 (trip_id, event_type) 유니크로 못 막는다), '여행완주'는
-- business-logic-notes.md §7 기준 여행당 1회여야 한다. 같은 여행에 대해
-- complete_trip이 다시 호출돼도(예: status를 수동으로 되돌린 뒤 재트리거) 이미
-- 'trip_complete' 기록이 있으면 건너뛴다.
-- =========================================
create or replace function public.complete_trip(
  p_trip_id uuid
) returns public.trips language plpgsql as $$
declare
  v_trip public.trips;
  v_already_awarded boolean;
begin
  update public.trips
  set status = 'completed'
  where id = p_trip_id and status = 'ongoing'
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

  return v_trip;
end;
$$;
