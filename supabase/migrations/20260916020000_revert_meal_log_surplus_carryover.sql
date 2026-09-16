-- =========================================
-- F2-3 이월 확장 기능 롤백
--
-- 20260916000000/20260916010000에서 도입한 "실제 기록된 끼니의 예산 과부족도
-- 다음날로 이월" 기능을 기획 재검토 후 빼기로 결정 (PR #309, 이슈 #308 닫음).
-- record_meal_log/update_meal_log/delete_meal_log를 원래(캐스케이드로 건너뛴
-- 끼니의 budget_amount만 이월하는) 동작으로 되돌리고, recompute_carryover_from
-- 헬퍼는 더 이상 쓰이지 않아 제거한다.
--
-- 시그니처는 되돌리지 않는다 — 9-인자 record_meal_log(좌표 포함, 20260902040000)와
-- 6-인자 update_meal_log(카테고리 포함, 20260831020000)는 이번 기능과 무관하게
-- 계속 쓰이는 파라미터라 그대로 유지한다.
-- =========================================

create or replace function public.record_meal_log(
  p_trip_id uuid,
  p_meal_slot_id uuid,
  p_amount int,
  p_source text,
  p_store_name text default null,
  p_store_address text default null,
  p_memo text default null,
  p_store_latitude numeric default null,
  p_store_longitude numeric default null
) returns public.meal_logs language plpgsql as $$
declare
  v_target public.meal_slots;
  v_log public.meal_logs;
  v_cascade_total int;
  v_next_slot_id uuid;
  v_before jsonb;
begin
  select * into v_target
  from public.meal_slots
  where id = p_meal_slot_id and trip_id = p_trip_id;

  if v_target.id is null then
    raise exception '끼니 슬롯을 찾을 수 없습니다';
  end if;

  if v_target.is_recorded then
    raise exception '이미 기록된 끼니입니다';
  end if;

  v_before := jsonb_build_object(
    'budget_amount', v_target.budget_amount,
    'carried_over_amount', v_target.carried_over_amount
  );

  insert into public.meal_logs (
    trip_id, meal_slot_id, category, amount, store_name, store_address,
    store_latitude, store_longitude, memo, source, visit_date
  ) values (
    p_trip_id, p_meal_slot_id, '식비', p_amount, p_store_name, p_store_address,
    p_store_latitude, p_store_longitude, p_memo, p_source, v_target.date
  ) returning * into v_log;

  update public.meal_slots
  set recorded_amount = p_amount, is_recorded = true, confirmed_at = now()
  where id = p_meal_slot_id;

  -- 규칙 1~2: 기록된 슬롯보다 이전 날짜/끼니 순서로 미기록 슬롯을 전부 0원 확정
  with cascaded as (
    update public.meal_slots ms
    set recorded_amount = 0, is_cascade_confirmed = true, is_recorded = true, confirmed_at = now()
    where ms.trip_id = p_trip_id
      and ms.is_recorded = false
      and (ms.date, case ms.meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
        < (v_target.date, case v_target.meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
    returning ms.budget_amount
  )
  select coalesce(sum(budget_amount), 0) into v_cascade_total from cascaded;

  -- 규칙 3: 캐스케이드 확정된 슬롯들의 미사용 budget_amount 합을, 기록된 슬롯
  -- 다음으로 가장 가까운 미기록 슬롯의 carried_over_amount에 이월 (날짜 경계 무관)
  if v_cascade_total > 0 then
    select id into v_next_slot_id
    from public.meal_slots
    where trip_id = p_trip_id
      and is_recorded = false
      and (date, case meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
        > (v_target.date, case v_target.meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
    order by date asc, case meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end asc
    limit 1;

    if v_next_slot_id is not null then
      update public.meal_slots
      set carried_over_amount = carried_over_amount + v_cascade_total
      where id = v_next_slot_id;
    end if;
  end if;

  -- 규칙 4: expense_input 히스토리 로그 (docs/schema-design.md §5 포맷)
  insert into public.budget_change_history (trip_id, event_type, amount_delta, before_json, after_json)
  values (
    p_trip_id,
    'expense_input',
    -p_amount,
    v_before,
    jsonb_build_object('recorded_amount', p_amount, 'carried_over_amount', v_target.carried_over_amount)
  );

  return v_log;
end;
$$;

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

-- carried_over_amount는 캐스케이드(끼니 건너뛰기)로만 발생하고 실제 기록된
-- 슬롯의 지출액과는 무관해서, 이월/재분배 재계산 없이 단순 update로 충분하다.
create or replace function public.update_meal_log(
  p_meal_log_id uuid,
  p_amount int,
  p_store_name text default null,
  p_store_address text default null,
  p_memo text default null,
  p_category text default null
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
      memo = p_memo,
      category = coalesce(p_category, category)
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

drop function if exists public.recompute_carryover_from(uuid, uuid);
