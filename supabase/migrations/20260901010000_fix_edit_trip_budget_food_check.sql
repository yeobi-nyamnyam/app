-- =========================================
-- edit_trip_budget 검증 버그 수정
--
-- trips.floating_budget은 "유동비용"(전체-고정-식비, 남는 금액)을 저장하는 컬럼인데,
-- 기존 함수는 이 값을 식비처럼 취급해서 이미 기록된 끼니 예산 합과 직접 비교하고
-- 있었다. 실제로 끼니 예산 합과 비교해야 하는 건 식비(=total_budget-fixed_cost-
-- floating_budget)이므로, 그 값을 역산해 검증하도록 고친다.
--
-- total_budget < fixed_cost + floating_budget 체크는 식비(=total-fixed-floating)가
-- 0 이상이라는 것과 동치라 기존 로직 그대로 둔다.
-- =========================================
create or replace function public.edit_trip_budget(
  p_trip_id uuid,
  p_name text,
  p_total_budget int,
  p_fixed_cost int,
  p_floating_budget int,
  p_slot_ids uuid[],
  p_slot_amounts int[]
) returns public.trips language plpgsql as $$
declare
  v_before jsonb;
  v_after public.trips;
  v_recorded_total int;
  v_food_budget int;
begin
  -- F4-1 로컬 검증(버튼 비활성화)과 동일한 규칙을 서버에서도 재검증한다
  -- (business-logic-notes.md §5: "서버/RPC가 재검증 후 trips 갱신").
  if p_total_budget < p_fixed_cost + p_floating_budget then
    raise exception '전체 예산이 고정비용+유동비용보다 적습니다';
  end if;

  v_food_budget := p_total_budget - p_fixed_cost - p_floating_budget;

  select coalesce(sum(budget_amount), 0) into v_recorded_total
  from public.meal_slots
  where trip_id = p_trip_id and is_recorded = true;

  if v_food_budget < v_recorded_total then
    raise exception '식비가 이미 기록된 끼니 예산 합보다 적습니다';
  end if;

  select to_jsonb(t) into v_before from public.trips t where t.id = p_trip_id;

  update public.trips
  set name = p_name,
      total_budget = p_total_budget,
      fixed_cost = p_fixed_cost,
      floating_budget = p_floating_budget
  where id = p_trip_id
  returning * into v_after;

  insert into public.budget_change_history (trip_id, event_type, before_json, after_json, amount_delta)
  values (
    p_trip_id,
    'budget_edit',
    v_before,
    to_jsonb(v_after),
    p_floating_budget - (v_before->>'floating_budget')::int
  );

  if array_length(p_slot_ids, 1) > 0 then
    perform public.apply_meal_slot_budgets(p_slot_ids, p_slot_amounts);

    insert into public.budget_change_history (trip_id, event_type, before_json, after_json)
    values (
      p_trip_id,
      'rebalance',
      jsonb_build_object('slot_ids', p_slot_ids),
      jsonb_build_object('slot_amounts', p_slot_amounts)
    );
  end if;

  return v_after;
end;
$$;
