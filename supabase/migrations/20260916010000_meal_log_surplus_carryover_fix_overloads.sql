-- =========================================
-- 20260916000000 오버로드 충돌 긴급 수정
--
-- 20260916000000이 record_meal_log/update_meal_log를 재작성하면서 각각
-- 20260902040000(좌표 인자 추가)/20260831020000(카테고리 인자 추가)로 이미
-- 확장된 "현재" 시그니처를 확인하지 않고 더 오래된 시그니처로 다시 만들어
-- 버렸다. Postgres는 인자 개수가 다르면 기존 함수를 대체하지 않고 별도
-- 오버로드로 추가하므로(20260830030000/20260831020000/20260902040000이 이미
-- 똑같은 이유로 겪은 문제), record_meal_log/update_meal_log 둘 다 시그니처
-- 2개가 공존하게 됐고, PostgREST/pg_graphql이 후보를 하나로 못 좁혀 두 함수
-- 모두 GraphQL 스키마에서 통째로 빠져버렸다("Unknown field ... on type
-- Mutation"). 이번 수정은:
--   1. 20260916000000이 잘못 추가한 구버전 시그니처 오버로드를 drop
--   2. 실제 현재 시그니처(좌표 9-인자 / 카테고리 6-인자)로 다시 만들면서
--      20260916000000의 이월 확장 로직(recompute_carryover_from 호출)과
--      좌표·카테고리 처리 로직을 모두 합친다
-- =========================================

drop function if exists public.record_meal_log(uuid, uuid, int, text, text, text, text);

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
  v_cascade_start_id uuid;
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

  -- 규칙 1~2: 기록된 슬롯보다 이전으로 미기록인 슬롯 중 가장 이른 것(캐스케이드
  -- 시작점) 탐색 후 전부 0원 확정
  select id into v_cascade_start_id
  from public.meal_slots
  where trip_id = p_trip_id
    and is_recorded = false
    and (date, case meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
      < (v_target.date, case v_target.meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
  order by date asc, case meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end asc
  limit 1;

  update public.meal_slots
  set recorded_amount = 0, is_cascade_confirmed = true, is_recorded = true, confirmed_at = now()
  where trip_id = p_trip_id
    and is_recorded = false
    and (date, case meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
      < (v_target.date, case v_target.meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end);

  -- 규칙 3 (확장): 캐스케이드 확정분 + 이번에 기록한 슬롯의 예산 과부족까지
  -- 순서대로 다음 미기록 슬롯까지 이월 전파 (20260916000000)
  perform public.recompute_carryover_from(p_trip_id, coalesce(v_cascade_start_id, p_meal_slot_id));

  -- 규칙 4: expense_input 히스토리 로그 (docs/schema-design.md §5 포맷)
  insert into public.budget_change_history (trip_id, event_type, amount_delta, before_json, after_json)
  values (
    p_trip_id,
    'expense_input',
    -p_amount,
    v_before,
    jsonb_build_object(
      'recorded_amount', p_amount,
      'carried_over_amount', (select carried_over_amount from public.meal_slots where id = p_meal_slot_id)
    )
  );

  return v_log;
end;
$$;

drop function if exists public.update_meal_log(uuid, int, text, text, text);

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

    -- 금액이 바뀌면 이 슬롯 이후 이월 체인 전체를 재계산 (20260916000000)
    perform public.recompute_carryover_from(v_log.trip_id, v_log.meal_slot_id);
  end if;

  return v_log;
end;
$$;
