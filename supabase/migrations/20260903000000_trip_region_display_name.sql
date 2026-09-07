-- =========================================
-- trips.region_display_name
-- F1 지역 입력이 시/군 단위("경주")까지 허용되면서, region_code(시/도 단위,
-- 예: "47")만으로는 사용자가 실제로 입력한 지역명을 복원할 수 없어 조회/수정
-- 화면에 "경상북도"로만 표시되는 문제가 생겼다. 사용자가 실제 선택한 표시용
-- 지역명을 별도로 저장해서 화면에 그대로 보여준다.
--
-- region_code(시/도 단위, 매칭·추천 필터링용)는 그대로 두고 이 컬럼은 순수
-- 표시용이다. 기존 트립은 null로 남고, 조회 화면에서 region_cache.region_name
-- (시/도)으로 폴백한다.
-- =========================================
alter table public.trips add column region_display_name text;

-- p_region_display_name 파라미터를 추가하기 위해 기존 12-arg 함수를 새 13-arg
-- 시그니처로 교체한다. create or replace는 인자 시그니처가 다르면 새 함수를
-- 추가로 만들 뿐 기존 걸 안 지우므로, 먼저 명시적으로 drop한다.
drop function if exists public.create_trip_with_meal_slots(
  text, text, date, date, int, int, numeric, int, date[], text[], text[], int[]
);

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
  p_budget_amounts int[],
  p_region_display_name text default null
) returns public.trips language plpgsql as $$
declare
  v_trip public.trips;
begin
  insert into public.trips (
    user_id, name, region_code, region_display_name, start_date, end_date,
    total_budget, fixed_cost, food_budget_ratio, floating_budget
  ) values (
    auth.uid(), p_name, p_region_code, p_region_display_name, p_start_date, p_end_date,
    p_total_budget, p_fixed_cost, p_food_budget_ratio, p_floating_budget
  ) returning * into v_trip;

  insert into public.meal_slots (trip_id, date, meal_type, weight_level, budget_amount)
  select v_trip.id, d, mt, wl, ba
  from unnest(p_dates, p_meal_types, p_weight_levels, p_budget_amounts) as t(d, mt, wl, ba);

  return v_trip;
end;
$$;
