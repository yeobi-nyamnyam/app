-- =========================================
-- F6-5/F6-6 소비 기록 삭제 + 재계산 RPC
-- meal_logs 삭제(끼니 소비/기타소비 공용) 트리거 하나로 처리한다.
--
-- F6-6 규칙 1: 완료된 여행(trips.status='completed')은 삭제 불가 — 서버에서 재검증.
-- F6-6 규칙 3: meal_slot_id가 없는 기타소비는 슬롯 재계산 없이 단순 삭제 +
--   budget_change_history(log_deleted)만 남긴다.
-- F6-6 규칙 2 / F6-5: meal_slot_id가 있는 끼니 소비는 아래 절차를 따른다
-- (business-logic-notes.md §3).
--
-- "바로 다음 끼니의 is_recorded === false일 때만 삭제 가능" 조건 외에,
-- record_meal_log가 이 기록을 만들 때 직전에 캐스케이드 확정(0원 자동 확정)한
-- 연속 구간이 있다면 그것까지 함께 원상복구해야 상태가 일관된다(팀 확인 완료) —
-- 그 구간만 남겨두면 "삭제된 기록이 유발한 부작용"만 남는 모순이 생긴다.
-- 캐스케이드 구간의 경계는 "대상 슬롯 이전으로 가장 가까운, is_cascade_confirmed=false인
-- 슬롯"을 찾아서 그 다음부터 대상 직전까지로 판단한다(그 사이는 항상 전부
-- is_cascade_confirmed=true임 — record_meal_log가 이전 실제 기록 지점부터 끊김 없이
-- 확정시키기 때문).
-- =========================================
create or replace function public.delete_meal_log(
  p_meal_log_id uuid
) returns void language plpgsql as $$
declare
  v_log public.meal_logs;
  v_trip_status text;
  v_target public.meal_slots;
  v_next_after public.meal_slots;
  v_boundary public.meal_slots;
  v_cascade_total int;
begin
  select * into v_log from public.meal_logs where id = p_meal_log_id;
  if v_log.id is null then
    raise exception '삭제할 소비 기록을 찾을 수 없습니다';
  end if;

  select status into v_trip_status from public.trips where id = v_log.trip_id;
  if v_trip_status = 'completed' then
    raise exception '완료된 여행의 기록은 삭제할 수 없습니다';
  end if;

  if v_log.meal_slot_id is null then
    delete from public.meal_logs where id = p_meal_log_id;

    insert into public.budget_change_history (trip_id, event_type, amount_delta, before_json, after_json)
    values (
      v_log.trip_id,
      'log_deleted',
      v_log.amount,
      jsonb_build_object('recorded_amount', v_log.amount),
      jsonb_build_object('recorded_amount', null)
    );
    return;
  end if;

  select * into v_target from public.meal_slots where id = v_log.meal_slot_id;

  select * into v_next_after
  from public.meal_slots
  where trip_id = v_target.trip_id
    and (date, case meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
      > (v_target.date, case v_target.meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
  order by date asc, case meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end asc
  limit 1;

  if v_next_after.id is not null and v_next_after.is_recorded then
    raise exception '다음 끼니가 이미 기록되어 있어 삭제할 수 없습니다';
  end if;

  -- 대상 직전, 캐스케이드 구간의 시작 경계(그 이전으로 가장 가까운 비-캐스케이드 슬롯) 탐색
  select * into v_boundary
  from public.meal_slots
  where trip_id = v_target.trip_id
    and is_cascade_confirmed = false
    and (date, case meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
      < (v_target.date, case v_target.meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
  order by date desc, case meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end desc
  limit 1;

  with cascaded as (
    update public.meal_slots ms
    set recorded_amount = null, is_recorded = false, is_cascade_confirmed = false, confirmed_at = null
    where ms.trip_id = v_target.trip_id
      and ms.is_cascade_confirmed = true
      and (ms.date, case ms.meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
        < (v_target.date, case v_target.meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
      and (
        v_boundary.id is null
        or (ms.date, case ms.meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
          > (v_boundary.date, case v_boundary.meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
      )
    returning ms.budget_amount
  )
  select coalesce(sum(budget_amount), 0) into v_cascade_total from cascaded;

  update public.meal_slots
  set recorded_amount = null, is_recorded = false, is_cascade_confirmed = false, confirmed_at = null
  where id = v_target.id;

  if v_cascade_total > 0 and v_next_after.id is not null then
    update public.meal_slots
    set carried_over_amount = greatest(carried_over_amount - v_cascade_total, 0)
    where id = v_next_after.id;
  end if;

  delete from public.meal_logs where id = p_meal_log_id;

  insert into public.budget_change_history (trip_id, event_type, amount_delta, before_json, after_json)
  values (
    v_log.trip_id,
    'log_deleted',
    v_log.amount,
    jsonb_build_object('recorded_amount', v_log.amount),
    jsonb_build_object('recorded_amount', null)
  );
end;
$$;

-- =========================================
-- 소비 기록 금액/매장/메모 수정
-- carried_over_amount는 캐스케이드(끼니 건너뛰기)로만 발생하고 실제 기록된
-- 슬롯의 지출액과는 무관해서(수진 확인 완료), 이월/재분배 재계산 없이 단순
-- update로 충분하다. 끼니 소비면 meal_slots.recorded_amount도 함께 동기화한다
-- (meal_slots가 홈 화면 등에서 지출액 표시에 쓰는 값이라 어긋나면 안 됨).
-- =========================================
create or replace function public.update_meal_log(
  p_meal_log_id uuid,
  p_amount int,
  p_store_name text default null,
  p_store_address text default null,
  p_memo text default null
) returns public.meal_logs language plpgsql as $$
declare
  v_log public.meal_logs;
  v_trip_status text;
begin
  select * into v_log from public.meal_logs where id = p_meal_log_id;
  if v_log.id is null then
    raise exception '수정할 소비 기록을 찾을 수 없습니다';
  end if;

  select status into v_trip_status from public.trips where id = v_log.trip_id;
  if v_trip_status = 'completed' then
    raise exception '완료된 여행의 기록은 수정할 수 없습니다';
  end if;

  update public.meal_logs
  set amount = p_amount,
      store_name = p_store_name,
      store_address = p_store_address,
      memo = p_memo
  where id = p_meal_log_id
  returning * into v_log;

  if v_log.meal_slot_id is not null then
    update public.meal_slots
    set recorded_amount = p_amount
    where id = v_log.meal_slot_id;
  end if;

  return v_log;
end;
$$;
