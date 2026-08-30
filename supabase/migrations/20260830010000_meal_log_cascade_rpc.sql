-- =========================================
-- F6-4 끼니 캐스케이드 확정 RPC
-- 끼니 소비(식비) 기록은 meal_slots와 반드시 연결되어야 하고, 기록 시점에 그
-- 이전 순서(날짜→아침→점심→저녁→다음날...)의 미기록 슬롯들을 0원으로 자동
-- 확정 + 이월시키는 캐스케이드가 함께 일어나야 배지/재분배 로직이 깨지지 않는다
-- (docs/business-logic-notes.md §1). meal_logs insert + 대상 슬롯 확정 +
-- 캐스케이드 확정 + 이월 + 히스토리 로그를 하나의 함수로 묶어 원자성을 보장한다.
-- RLS(meal_slots_own, meal_logs_own, budget_history_own)가 이미 trip 소유자만
-- 허용하므로 security definer는 불필요(invoker 권한으로 충분).
--
-- 기타 소비(교통/숙박/기념품/기타)는 meal_slot_id가 없어 캐스케이드 대상이 아니므로
-- 계속 apps/mobile/src/graphql/record/create-meal-log.mutation.graphql의 단순
-- insert를 그대로 사용한다. 이 함수는 끼니 소비 전용이라 category를 '식비'로 고정한다.
-- =========================================
create or replace function public.record_meal_log(
  p_trip_id uuid,
  p_meal_slot_id uuid,
  p_amount int,
  p_store_name text,
  p_store_address text,
  p_memo text,
  p_source text
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
    trip_id, meal_slot_id, category, amount, store_name, store_address, memo, source
  ) values (
    p_trip_id, p_meal_slot_id, '식비', p_amount, p_store_name, p_store_address, p_memo, p_source
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
