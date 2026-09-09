-- =========================================
-- F6-10 지오코딩: record_meal_log에 매장 좌표 저장 지원 추가
-- StoreSearchModal "주소로 찾기" 검색 결과(네이버 지역 검색 API 경유)에 이미
-- 위경도가 포함돼 있었지만 지금까지는 폼~RPC 경로에서 버려지고 있었다.
-- meal_logs.store_latitude/store_longitude 컬럼(20260812000000)에 채워 넣도록
-- p_store_latitude/p_store_longitude를 마지막 인자로 추가한다 (M2 방문 매장
-- 지도 표시가 이 컬럼을 씀 — docs/schema-design.md §M2).
--
-- Postgres는 `create or replace function`으로 파라미터 개수를 늘리면 기존
-- 시그니처를 대체하지 않고 별도 오버로드로 추가해 PostgREST가 후보를 하나로
-- 못 좁히는 문제가 생긴다(20260830030000/20260831020000과 동일한 이유) — 기존
-- 7-인자 시그니처를 명시적으로 drop한 뒤 9-인자로 다시 만든다.
-- =========================================
drop function if exists public.record_meal_log(uuid, uuid, int, text, text, text, text);

create function public.record_meal_log(
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
