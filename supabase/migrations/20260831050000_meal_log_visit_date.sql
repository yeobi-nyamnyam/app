-- meal_logs.visit_date 추가.
-- 기타소비는 폼에서 "방문 날짜"를 선택해도 저장하지 않고 created_at만 남아서,
-- 자정 넘어 입력하면 실제 소비일과 작성 시각이 어긋나는 문제가 있었다
-- (예: 30일 저녁을 31일 새벽에 기록 → 31일 소비로 잘못 집계됨).
-- default current_date를 둬서, 이 컬럼을 아직 채우지 않는 클라이언트 버전이
-- 배포돼 있는 동안에도 insertIntomeal_logsCollection이 깨지지 않게 한다.
alter table public.meal_logs add column visit_date date not null default current_date;

-- 기존 행 백필: 끼니 소비는 meal_slots.date, 기타소비는 created_at의 날짜.
update public.meal_logs ml
set visit_date = coalesce(
  (select ms.date from public.meal_slots ms where ms.id = ml.meal_slot_id),
  ml.created_at::date
);

-- record_meal_log: 끼니 슬롯의 날짜를 그대로 visit_date에 채운다.
-- 파라미터 이름/순서는 그대로라 create or replace로 안전하게 바꿀 수 있다.
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
    trip_id, meal_slot_id, category, amount, store_name, store_address, memo, source, visit_date
  ) values (
    p_trip_id, p_meal_slot_id, '식비', p_amount, p_store_name, p_store_address, p_memo, p_source, v_target.date
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
