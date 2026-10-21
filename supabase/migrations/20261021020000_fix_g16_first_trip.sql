-- =========================================
-- G16(첫 여행 설계자) 판정 조건 수정
--
-- 기존 조건은 "사용자의 여행 수(진행 중 포함) = 1"이라, 첫 여행 도중에 다음 여행을
-- 미리 만들어 두면 첫 여행이 끝날 때 개수가 2가 돼서 G16을 영영 못 받았다.
-- "이 여행보다 먼저 만든 여행이 없음"으로 바꾼다. 나머지 판정은
-- 20260902030000_badge_judgment.sql과 동일 (함수 단위라 본문 전체를 다시 씀).
-- =========================================
create or replace function public.judge_trip_badges(p_trip_id uuid) returns void language plpgsql as $$
declare
  v_trip public.trips;
  v_food_budget int;
  v_food_spent int;
  v_total_spent int;
  v_other_count int;
  v_other_sum int;
  v_food_count int;
  v_food_sum int;
  v_good_price_ratio numeric;
  v_cheap_ratio numeric;
  v_weight_change_count int;
  v_plan_change_count int;
  v_rebalance_count int;
  v_crisis_escape boolean;
  v_early_bird boolean;
  v_daily_record_king boolean;
  v_region_count int;
  v_max_region_repeat int;
  v_completed_trip_count int;
  v_has_earlier_trip boolean;
  v_first_chat_trip_id uuid;
  v_already_bonus boolean;
begin
  select * into v_trip from public.trips where id = p_trip_id;
  if v_trip.id is null then
    raise exception 'Trip not found: %', p_trip_id;
  end if;

  v_food_budget := v_trip.total_budget - v_trip.fixed_cost - v_trip.floating_budget;

  select coalesce(sum(recorded_amount), 0) into v_food_spent
  from public.meal_slots where trip_id = p_trip_id;

  select coalesce(sum(amount), 0) into v_total_spent
  from public.meal_logs where trip_id = p_trip_id;

  select count(*), coalesce(sum(amount), 0) into v_other_count, v_other_sum
  from public.meal_logs where trip_id = p_trip_id and meal_slot_id is null;

  select count(*), coalesce(sum(amount), 0) into v_food_count, v_food_sum
  from public.meal_logs where trip_id = p_trip_id and meal_slot_id is not null;

  select case when count(*) = 0 then 0
    else count(*) filter (where is_good_price)::numeric / count(*) end
  into v_good_price_ratio
  from public.meal_logs where trip_id = p_trip_id and meal_slot_id is not null;

  select case when count(*) = 0 then 0
    else count(*) filter (where ml.amount <= ms.budget_amount * 0.7)::numeric / count(*) end
  into v_cheap_ratio
  from public.meal_logs ml
  join public.meal_slots ms on ms.id = ml.meal_slot_id
  where ml.trip_id = p_trip_id;

  select count(*) into v_weight_change_count
  from public.budget_change_history where trip_id = p_trip_id and event_type = 'weight_change';

  select count(*) into v_plan_change_count
  from public.budget_change_history
  where trip_id = p_trip_id and event_type in ('budget_edit', 'rebalance', 'weight_change');

  select count(*) into v_rebalance_count
  from public.budget_change_history where trip_id = p_trip_id and event_type = 'rebalance';

  select exists (
    select 1
    from (
      select date,
             sum(budget_amount) as day_budget,
             sum(coalesce(recorded_amount, 0)) as day_recorded,
             bool_or(recorded_amount > budget_amount) as any_meal_over
      from public.meal_slots
      where trip_id = p_trip_id and is_recorded = true
      group by date
    ) d
    where d.any_meal_over and d.day_recorded <= d.day_budget
  ) into v_crisis_escape;

  select
    count(*) > 0
    and count(*) filter (where breakfast_amt < lunch_amt and lunch_amt < dinner_amt) = count(*)
  into v_early_bird
  from (
    select date,
      max(recorded_amount) filter (where meal_type = 'breakfast') as breakfast_amt,
      max(recorded_amount) filter (where meal_type = 'lunch') as lunch_amt,
      max(recorded_amount) filter (where meal_type = 'dinner') as dinner_amt
    from public.meal_slots
    where trip_id = p_trip_id and is_recorded = true
    group by date
    having count(*) = 3
  ) d;

  select not exists (
    select gs.d
    from generate_series(v_trip.start_date, v_trip.end_date, interval '1 day') as gs(d)
    where not exists (
      select 1 from public.meal_logs
      where trip_id = p_trip_id and source = 'chat' and visit_date = gs.d::date
    )
  ) into v_daily_record_king;

  select count(distinct region_code) into v_region_count
  from public.trips where user_id = v_trip.user_id and status = 'completed';

  select coalesce(max(cnt), 0) into v_max_region_repeat
  from (
    select count(*) as cnt from public.trips
    where user_id = v_trip.user_id and status = 'completed'
    group by region_code
  ) t;

  select count(*) into v_completed_trip_count
  from public.trips where user_id = v_trip.user_id and status = 'completed';

  select exists (
    select 1 from public.trips
    where user_id = v_trip.user_id and created_at < v_trip.created_at
  ) into v_has_earlier_trip;

  select ml.trip_id into v_first_chat_trip_id
  from public.meal_logs ml
  join public.trips t on t.id = ml.trip_id
  where t.user_id = v_trip.user_id and ml.source = 'chat'
  order by ml.created_at asc
  limit 1;

  -- G1 예산 완주자: 총지출 <= 총예산
  if v_total_spent <= v_trip.total_budget then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G1');
  end if;

  -- G2 딱 맞춤 플래너: |총지출-총예산| <= 총예산*5%
  if v_trip.total_budget > 0 and abs(v_total_spent - v_trip.total_budget) <= v_trip.total_budget * 0.05 then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G2');

    -- L1 ±10%완주보너스(trip_complete_bonus, +50, 여행 1회) — 배지 지급과 별개 이벤트
    select exists(
      select 1 from public.exp_ledger
      where trip_id = p_trip_id and event_type = 'trip_complete_bonus'
    ) into v_already_bonus;

    if not v_already_bonus then
      insert into public.exp_ledger (user_id, trip_id, event_type, points)
      values (v_trip.user_id, p_trip_id, 'trip_complete_bonus', 50);
    end if;
  end if;

  -- G3 짠테크 고수: 식비지출 <= 식비예산*80%
  if v_food_budget > 0 and v_food_spent <= v_food_budget * 0.8 then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G3');
  end if;

  -- G4 위기탈출
  if v_crisis_escape then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G4');
  end if;

  -- G5 플렉스 여행자: 기타소비 건수·합계 둘 다 식비보다 많음
  if v_other_count > v_food_count and v_other_sum > v_food_sum then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G5');
  end if;

  -- G6 아침형 알뜰러
  if v_early_bird then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G6');
  end if;

  -- G7 순발력 만렙: 가중치 수정 3회 이상
  if v_weight_change_count >= 3 then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G7');
  end if;

  -- G8 초지일관형: 예산·비율 수정 이력 0건
  if v_plan_change_count = 0 then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G8');
  end if;

  -- G9 재설계 마스터: 재분배 2회 이상
  if v_rebalance_count >= 2 then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G9');
  end if;

  -- G10 착한가격 애호가: 착한가격업소 방문 비율 50% 이상
  if v_good_price_ratio >= 0.5 then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G10');
  end if;

  -- G11 가성비 헌터(대체 기준): 끼니 실지출이 배정예산 70% 이하인 비율 50% 이상
  if v_cheap_ratio >= 0.5 then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G11');
  end if;

  -- G12 팔도 미식가: 서로 다른 지역 여행 3곳 이상(누적, 완료된 여행 기준)
  if v_region_count >= 3 then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G12');
  end if;

  -- G13 로컬 크루: 동일 지역 여행 2회 이상(누적, 완료된 여행 기준)
  if v_max_region_repeat >= 2 then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G13');
  end if;

  -- G14 매일 기록왕: 여행 전체 일자에 대화형(source='chat') 기록이 하루도 안 빠짐
  if v_daily_record_king then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G14');
  end if;

  -- G15 N회 여행 완주: 완료한 여행이 3번째가 되는 시점
  if v_completed_trip_count = 3 then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G15');
  end if;

  -- G16 첫 여행 설계자: 사용자의 첫 번째 여행 (이보다 먼저 만든 여행이 없음)
  if not v_has_earlier_trip then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G16');
  end if;

  -- G17 AI와 첫 대화: 사용자 최초 source='chat' 기록이 이 여행에서 나옴
  if v_first_chat_trip_id = p_trip_id then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G17');
  end if;
end;
$$;
