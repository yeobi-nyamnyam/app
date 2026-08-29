-- =========================================
-- F1+F2 여행 생성 트랜잭션 RPC
-- trips insert + meal_slots(여행 일수×3끼) 다건 insert를 하나의 Postgres 함수로
-- 묶어 원자성을 보장한다. 함수 본문 자체가 하나의 트랜잭션이라 별도 BEGIN/COMMIT
-- 없이도, 중간에 실패하면 trips만 생성되고 meal_slots가 비는 상태가 절대 발생하지
-- 않는다. RLS(trips_own, meal_slots_own)가 이미 auth.uid() 소유자만 허용하므로
-- security definer는 불필요(invoker 권한으로 충분).
--
-- 일별/끼니별 배분 계산(F2-1/F2-2, 가중치 프리셋 0.8/1.0/1.2 배율)은 클라이언트의
-- 순수함수(apps/mobile/src/lib/mock/trip.ts)가 그대로 계산해서 병렬 배열로 넘긴다 —
-- 이 함수는 원자적 저장만 담당하고 계산 로직을 SQL로 옮기지 않는다
-- (docs/business-logic-notes.md에 "초연과 별도 확인 필요"로 남아있던 RPC 방식 결정).
-- =========================================
create or replace function public.create_trip_with_meal_slots(
  p_name text,
  p_region_code text,
  p_start_date date,
  p_end_date date,
  p_total_budget int,
  p_fixed_cost int,
  p_food_budget_ratio numeric,
  p_floating_budget int,
  p_dates date[],
  p_meal_types text[],
  p_weight_levels text[],
  p_budget_amounts int[]
) returns public.trips language plpgsql as $$
declare
  v_trip public.trips;
begin
  insert into public.trips (
    user_id, name, region_code, start_date, end_date,
    total_budget, fixed_cost, food_budget_ratio, floating_budget
  ) values (
    auth.uid(), p_name, p_region_code, p_start_date, p_end_date,
    p_total_budget, p_fixed_cost, p_food_budget_ratio, p_floating_budget
  ) returning * into v_trip;

  insert into public.meal_slots (trip_id, date, meal_type, weight_level, budget_amount)
  select v_trip.id, d, mt, wl, ba
  from unnest(p_dates, p_meal_types, p_weight_levels, p_budget_amounts) as t(d, mt, wl, ba);

  return v_trip;
end;
$$;

-- =========================================
-- meal_slots 다건 budget_amount(+선택적으로 weight_level) 원자적 갱신 헬퍼.
-- F4의 재분배(F2-3)와 F2-5(홈에서 당일 가중치 변경) 양쪽에서 재사용한다.
-- is_recorded=true인 슬롯은 소급 변경하지 않는다 (business-logic-notes.md §2).
-- p_weight_levels를 생략(null)하면 budget_amount만 갱신(F4 재분배),
-- 넘기면 weight_level까지 같이 갱신한다(F2-5 가중치 변경).
-- =========================================
create or replace function public.apply_meal_slot_budgets(
  p_slot_ids uuid[],
  p_budget_amounts int[],
  p_weight_levels text[] default null
) returns void language plpgsql as $$
begin
  if p_weight_levels is null then
    update public.meal_slots ms
    set budget_amount = u.amt
    from unnest(p_slot_ids, p_budget_amounts) as u(id, amt)
    where ms.id = u.id and ms.is_recorded = false;
  else
    update public.meal_slots ms
    set budget_amount = u.amt, weight_level = u.wl
    from unnest(p_slot_ids, p_budget_amounts, p_weight_levels) as u(id, amt, wl)
    where ms.id = u.id and ms.is_recorded = false;
  end if;
end;
$$;
