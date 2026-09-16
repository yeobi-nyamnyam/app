-- =========================================
-- F2-3 재분배 의도 확장: "실제 기록된 끼니의 예산 과부족"도 이월한다
--
-- 기존엔 "완전히 건너뛴(캐스케이드로 0원 확정된) 끼니"의 budget_amount만
-- 다음 미기록 슬롯의 carried_over_amount에 더했는데, F2 담당자(초연) 확인
-- 결과 원래 기획 의도는 "실제로 기록은 했지만 예산보다 더 쓰거나 덜 쓴 경우도
-- 그 차액만큼 다음 날 예산이 조정"되는 것이었다. 이번 마이그레이션으로
-- record_meal_log가 캐스케이드 확정분 + 이번에 기록한 슬롯 자체의
-- (budget_amount+carried_over_amount-recorded_amount) 차액까지 합쳐서
-- 다음 미기록 슬롯에 이월하도록 확장한다. 초과 지출이면 음수로 이월돼
-- 다음 끼니 예산이 그만큼 줄어든다.
--
-- 캐스케이드/실기록 구분 없이 "다음 미기록 슬롯까지 순서대로 이월값을 다시
-- 계산"하는 로직을 recompute_carryover_from 헬퍼로 뽑아서 record/delete/update
-- 세 RPC가 공유한다. 이렇게 통합하면:
--   1. delete_meal_log가 기록을 지울 때 이 확장된 이월분까지 정확히 되돌릴 수 있고
--   2. update_meal_log(F6-2/F6-3 금액 수정)가 "이월은 캐스케이드로만 생긴다"던
--      기존 전제(더 이상 사실이 아님) 없이도 이후 체인 전체를 정확히 재계산할 수 있고
--   3. 캐스케이드된 슬롯 자신이 이미 갖고 있던 carried_over_amount를 무시하고
--      budget_amount만 넘기던 기존의 잠재 버그(연쇄 건너뛰기 시 이월액 유실)도
--      같이 해결된다
-- =========================================

-- ---------------------------------------------------------------
-- 0. recompute_carryover_from: p_from_slot_id(이미 기록/캐스케이드된 슬롯)부터
-- 순서대로 훑어서, 각 슬롯이 다음 슬롯으로 넘기는 이월값을 끝까지(첫 미기록
-- 슬롯을 만날 때까지) 다시 계산해 저장한다. p_from_slot_id 자신의
-- carried_over_amount(그 슬롯이 "받은" 값)는 이미 확정된 입력으로 보고 그대로
-- 읽기만 하고 덮어쓰지 않는다 — 그 이후 슬롯들만 새로 계산해 덮어쓴다.
-- ---------------------------------------------------------------
create or replace function public.recompute_carryover_from(
  p_trip_id uuid,
  p_from_slot_id uuid
) returns void language plpgsql as $$
declare
  v_start public.meal_slots;
  v_slot record;
  v_incoming int;
begin
  select * into v_start from public.meal_slots where id = p_from_slot_id;

  if v_start.id is null or not v_start.is_recorded then
    return;
  end if;

  v_incoming := v_start.budget_amount + v_start.carried_over_amount - coalesce(v_start.recorded_amount, 0);

  for v_slot in
    select id, budget_amount, recorded_amount, is_recorded
    from public.meal_slots
    where trip_id = p_trip_id
      and (date, case meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
        > (v_start.date, case v_start.meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
    order by date asc, case meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end asc
  loop
    update public.meal_slots set carried_over_amount = v_incoming where id = v_slot.id;

    if not v_slot.is_recorded then
      return; -- 미기록 슬롯을 만나면 여기가 새 종착지 — 더 이상 전파하지 않음
    end if;

    v_incoming := v_slot.budget_amount + v_incoming - coalesce(v_slot.recorded_amount, 0);
  end loop;
  -- 루프가 끝까지 돌면(여행의 마지막 끼니 이후) 남은 이월분은 갈 곳이 없어 사라진다
end;
$$;

-- ---------------------------------------------------------------
-- 1. record_meal_log: 캐스케이드 확정 + 기록 후, recompute_carryover_from으로
-- 이월 전파를 한 번에 처리
-- ---------------------------------------------------------------
create or replace function public.record_meal_log(
  p_trip_id uuid,
  p_meal_slot_id uuid,
  p_amount int,
  p_source text,
  p_store_name text default null,
  p_store_address text default null,
  p_memo text default null
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
    trip_id, meal_slot_id, category, amount, store_name, store_address, memo, source
  ) values (
    p_trip_id, p_meal_slot_id, '식비', p_amount, p_store_name, p_store_address, p_memo, p_source
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
  -- 순서대로 다음 미기록 슬롯까지 이월 전파
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

-- ---------------------------------------------------------------
-- 2. delete_meal_log: 캐스케이드 구간 + 대상 슬롯을 원복한 뒤, 예전 이월
-- 체인의 잔여값을 지우고(0으로 리셋) recompute_carryover_from으로 다시 계산
-- ---------------------------------------------------------------
create or replace function public.delete_meal_log(
  p_meal_log_id uuid
) returns void language plpgsql as $$
declare
  v_log public.meal_logs;
  v_trip_status text;
  v_target public.meal_slots;
  v_next_after public.meal_slots;
  v_boundary public.meal_slots;
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

  -- 캐스케이드 구간 원복
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
    );

  -- 대상 슬롯 원복
  update public.meal_slots
  set recorded_amount = null, is_recorded = false, is_cascade_confirmed = false, confirmed_at = null
  where id = v_target.id;

  -- 예전 이월 체인의 잔여값 제거: 경계 이후(또는 경계가 없으면 여행 전체)의
  -- 미기록 슬롯 이월값을 0으로 리셋해야, 이전 체인의 종착지였던 슬롯에 남아있던
  -- 값이 새로 계산되는 값과 뒤섞이지 않는다
  update public.meal_slots
  set carried_over_amount = 0
  where trip_id = v_target.trip_id
    and is_recorded = false
    and (
      v_boundary.id is null
      or (date, case meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
        > (v_boundary.date, case v_boundary.meal_type when 'breakfast' then 0 when 'lunch' then 1 else 2 end)
    );

  if v_boundary.id is not null then
    perform public.recompute_carryover_from(v_target.trip_id, v_boundary.id);
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

-- ---------------------------------------------------------------
-- 3. update_meal_log: 금액이 바뀌면 이 슬롯 이후 이월 체인 전체를 재계산
-- ("이월은 캐스케이드로만 생긴다"던 기존 전제가 이제 성립하지 않음)
-- ---------------------------------------------------------------
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

    perform public.recompute_carryover_from(v_log.trip_id, v_log.meal_slot_id);
  end if;

  return v_log;
end;
$$;
