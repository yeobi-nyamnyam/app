-- =========================================
-- F4 예산 일괄 수정 + F2-3 재분배 RPC
-- trips 값 갱신과 budget_change_history 로그 2건(event_type='budget_edit',
-- 'rebalance')을 하나의 함수로 묶어 원자성을 보장한다. 재분배 대상 슬롯의 새
-- budget_amount 계산 자체는 클라이언트 순수함수(redistributeUnrecordedSlots,
-- apps/mobile/src/lib/mock/trip.ts)가 그대로 하고, 이 함수는 원자적 저장 +
-- 히스토리 기록만 담당한다.
--
-- business-logic-notes.md §2: "budget_edit"(trips 값 변경)과 "rebalance"(실제
-- 재분배 실행)를 별도 이벤트로 기록 — G9/L1 포인트/배지 판정이 두 이벤트를
-- 구분해서 세야 하기 때문. 재분배 대상이 없으면(모든 슬롯이 이미 기록됨)
-- rebalance 로그는 남기지 않는다.
--
-- meal_slots의 budget_amount 실제 갱신은 F2에서 만든 apply_meal_slot_budgets를
-- 재사용한다(is_recorded=true인 슬롯은 소급 변경하지 않는 안전장치 포함).
-- =========================================
-- 이전 버전(p_name 없는 6-arg 시그니처)이 이미 적용돼 있을 수 있어, 새 시그니처로
-- 교체하기 전에 명시적으로 제거한다 (create or replace는 인자 목록이 다르면
-- 새 함수를 추가로 만들 뿐 기존 함수를 지우지 않아 오버로드가 중복 생김).
drop function if exists public.edit_trip_budget(uuid, int, int, int, uuid[], int[]);

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
begin
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
