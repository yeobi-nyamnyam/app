-- =========================================
-- F6-4 record_meal_log 선택 입력 파라미터 nullable 처리 수정
-- p_store_name/p_store_address/p_memo에 default null이 없으면 pg_graphql이
-- meal_logs 컬럼 자체는 nullable인데도 GraphQL 스키마에서 이 인자들을 필수(String!)로
-- 노출한다. apps/mobile/src/graphql/record/record-meal-log.mutation.graphql이
-- 이 값들을 nullable(String)로 선언해둬서 `pnpm codegen`의 GraphQL Document
-- Validation이 실패했다 (20260830010000 최초 커밋 시 놓친 부분).
-- Postgres 규칙상 default가 있는 파라미터는 없는 파라미터보다 뒤에 와야 해서
-- p_source(default 없음)를 p_store_name 앞으로 옮겼다 — pg_graphql은 이름
-- 기반으로 인자를 넘기므로(위치 기반 아님) 호출 쪽 영향은 없다. 타입 순서
-- 자체는 그대로(uuid,uuid,int,text,text,text,text)라 create or replace로 충분.
-- =========================================
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
