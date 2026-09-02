-- =========================================
-- G0~G17 배지 판정 (business-logic-notes.md §6, 사용자 확정 스펙 2026-09-02)
-- =========================================

-- ---------------------------------------------------------------
-- 0. apply_meal_slot_budgets: 가중치 수정(F2-5)을 budget_change_history에 기록
--
-- 기존에는 weight_levels가 있을 때도(F2-5 가중치 변경) 아무 로그를 안 남겨서
-- G7(순발력 만렙, 가중치 수정 횟수)을 판정할 데이터가 없었다. weight_levels가
-- null이 아닐 때만(F4 재분배 호출은 null이라 영향 없음) event_type='weight_change'
-- 로그를 추가한다.
-- ---------------------------------------------------------------
create or replace function public.apply_meal_slot_budgets(
  p_slot_ids uuid[],
  p_budget_amounts int[],
  p_weight_levels text[] default null
) returns void language plpgsql as $$
declare
  v_trip_id uuid;
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

    if array_length(p_slot_ids, 1) > 0 then
      select trip_id into v_trip_id from public.meal_slots where id = p_slot_ids[1];
      insert into public.budget_change_history (trip_id, event_type, before_json, after_json)
      values (
        v_trip_id,
        'weight_change',
        jsonb_build_object('slot_ids', p_slot_ids),
        jsonb_build_object('weight_levels', p_weight_levels, 'budget_amounts', p_budget_amounts)
      );
    end if;
  end if;
end;
$$;

-- ---------------------------------------------------------------
-- 1. badges 시드 데이터 (17개, G1~G17)
-- 이름은 packages/ui의 badgeNames(아이콘 매칭용 한글명)와 정확히 일치해야 한다.
-- ---------------------------------------------------------------
insert into public.badges (code, category, name, description, bonus_points) values
  ('G1', '예산 준수형', '예산 완주자', '여행 종료까지 총예산 초과 없이 마무리', 100),
  ('G2', '예산 준수형', '딱 맞춤 플래너', '실제 지출과 계획 예산 차이 ±5% 이내로 여행 종료', 50),
  ('G3', '예산 준수형', '짠테크 고수', '식비 예산 대비 실제 지출 80% 이하로 절약', 60),
  ('G4', '예산 준수형', '위기탈출', '하루 예산 초과 후 다음 끼니 재조정으로 당일 예산 회복', 50),
  ('G5', '소비 패턴/캐릭터형', '플렉스 여행자', '기념품·액티비티 등 유동비용이 식비보다 잦고 큼', 30),
  ('G6', '소비 패턴/캐릭터형', '아침형 알뜰러', '아침 예산은 항상 적게·저녁에 몰아쓰는 패턴', 40),
  ('G7', '계획 변경 유연성', '순발력 만렙', '고정비·식비 비율 수정 후 재추천 받은 횟수 다수', 30),
  ('G8', '계획 변경 유연성', '초지일관형', '여행 내내 예산·비율 수정 없이 최초 계획 유지', 40),
  ('G9', '계획 변경 유연성', '재설계 마스터', '남은 끼니 기준 재분배(F2-3)를 여러 번 활용해 끝까지 예산 관리 성공', 50),
  ('G10', '착한가격/데이터 활용형', '착한가격 애호가', '착한가격업소 필터로 방문한 비율이 높음', 40),
  ('G11', '착한가격/데이터 활용형', '가성비 헌터', '끼니별 실지출이 배정 예산 대비 낮은 비율이 높음', 40),
  ('G12', '지역 탐방/다양성', '팔도 미식가', '서로 다른 지역(자체 지역코드 기준)에서 식비 기록', 70),
  ('G13', '지역 탐방/다양성', '로컬 크루', '동일 지역 반복 방문 시 그 지역 단골 뱃지', 50),
  ('G14', '습관/연속기록형', '매일 기록왕', '여행 중 매일 빠짐없이 대화형으로 소비 기록', 50),
  ('G15', '습관/연속기록형', 'N회 여행 완주', '여비냠냠으로 여행 예산 관리를 N번째 완료', 60),
  ('G16', '온보딩/입문형', '첫 여행 설계자', '첫 여행 등록(F1)과 예산 산정(F2) 완료', 20),
  ('G17', '온보딩/입문형', 'AI와 첫 대화', '자연어 지출 입력(F5) 최초 사용', 20)
on conflict (code) do nothing;

-- ---------------------------------------------------------------
-- 2. award_badge: 배지 1개를 (user, trip)에 중복 없이 부여 + badge_earned 포인트 기록
-- ---------------------------------------------------------------
create or replace function public.award_badge(
  p_user_id uuid,
  p_trip_id uuid,
  p_badge_code text
) returns void language plpgsql as $$
declare
  v_badge_id uuid;
  v_points int;
  v_new_id uuid;
begin
  select id, bonus_points into v_badge_id, v_points
  from public.badges where code = p_badge_code;

  if v_badge_id is null then
    raise exception 'Unknown badge code: %', p_badge_code;
  end if;

  insert into public.user_badges (user_id, trip_id, badge_id)
  select p_user_id, p_trip_id, v_badge_id
  where not exists (
    select 1 from public.user_badges
    where user_id = p_user_id and trip_id = p_trip_id and badge_id = v_badge_id
  )
  returning id into v_new_id;

  if v_new_id is not null then
    insert into public.exp_ledger (user_id, trip_id, event_type, points)
    values (p_user_id, p_trip_id, 'badge_earned', v_points);
  end if;
end;
$$;

-- ---------------------------------------------------------------
-- 3. judge_trip_badges: 여행 완료 시 G1~G17을 일괄 판정
-- ---------------------------------------------------------------
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
  v_total_trip_count int;
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

  select count(*) into v_total_trip_count
  from public.trips where user_id = v_trip.user_id;

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

  -- G16 첫 여행 설계자: 사용자의 첫 번째 여행
  if v_total_trip_count = 1 then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G16');
  end if;

  -- G17 AI와 첫 대화: 사용자 최초 source='chat' 기록이 이 여행에서 나옴
  if v_first_chat_trip_id = p_trip_id then
    perform public.award_badge(v_trip.user_id, p_trip_id, 'G17');
  end if;
end;
$$;

-- ---------------------------------------------------------------
-- 4. complete_trip: 완료 처리 후 배지 판정까지 같은 트랜잭션에서 실행
-- ---------------------------------------------------------------
create or replace function public.complete_trip(
  p_trip_id uuid
) returns public.trips language plpgsql as $$
declare
  v_trip public.trips;
  v_already_awarded boolean;
begin
  update public.trips
  set status = 'completed'
  where id = p_trip_id and status = 'ongoing'
  returning * into v_trip;

  if v_trip.id is null then
    raise exception '완료 처리할 진행 중인 여행을 찾을 수 없습니다';
  end if;

  select exists(
    select 1 from public.exp_ledger
    where trip_id = v_trip.id and event_type = 'trip_complete'
  ) into v_already_awarded;

  if not v_already_awarded then
    insert into public.exp_ledger (user_id, trip_id, event_type, points)
    values (v_trip.user_id, v_trip.id, 'trip_complete', 100);
  end if;

  perform public.judge_trip_badges(v_trip.id);

  return v_trip;
end;
$$;
