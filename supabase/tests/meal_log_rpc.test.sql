-- record_meal_log / delete_meal_log (F6-4, F6-5/F6-6) 회귀 테스트
-- 실행: supabase test db (로컬 Docker 필요). 전부 트랜잭션 안에서 돌고 마지막에 rollback한다.
--
-- 2일 여행, 끼니 6개(각 10,000원)에서:
--   1일차 점심 기록 → 아침 0원 캐스케이드 확정 + 저녁에 10,000원 이월
--   그 기록 삭제   → 끼니 6개가 처음 상태로 완전히 복구
-- 와 거부돼야 하는 경우 3가지를 확인한다.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(10);

-- ---------- 준비 ----------
insert into auth.users (id, aud, role, email, created_at, updated_at)
values ('00000000-0000-4000-8000-0000000000a1', 'authenticated', 'authenticated', 'meal-log-test@example.invalid', now(), now());

insert into public.trips (id, user_id, name, region_code, start_date, end_date, total_budget, food_budget_ratio)
values ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000000a1', 'test', 'TEST',
        '2026-10-01', '2026-10-02', 100000, 60);

insert into public.meal_slots (id, trip_id, date, meal_type, budget_amount)
values
  ('00000000-0000-4000-8000-0000000001d1', '00000000-0000-4000-8000-0000000000b1', '2026-10-01', 'breakfast', 10000),
  ('00000000-0000-4000-8000-0000000002d1', '00000000-0000-4000-8000-0000000000b1', '2026-10-01', 'lunch', 10000),
  ('00000000-0000-4000-8000-0000000003d1', '00000000-0000-4000-8000-0000000000b1', '2026-10-01', 'dinner', 10000),
  ('00000000-0000-4000-8000-0000000001d2', '00000000-0000-4000-8000-0000000000b1', '2026-10-02', 'breakfast', 10000),
  ('00000000-0000-4000-8000-0000000002d2', '00000000-0000-4000-8000-0000000000b1', '2026-10-02', 'lunch', 10000),
  ('00000000-0000-4000-8000-0000000003d2', '00000000-0000-4000-8000-0000000000b1', '2026-10-02', 'dinner', 10000);

-- 슬롯 상태 스냅샷 (삭제 후 원상복구 비교용)
create temp table initial_slots as
select id, budget_amount, carried_over_amount, is_recorded, is_cascade_confirmed, recorded_amount
from public.meal_slots where trip_id = '00000000-0000-4000-8000-0000000000b1';

-- ---------- 1. 1일차 점심 기록 ----------
create temp table recorded as
select * from public.record_meal_log(
  '00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000002d1', 8000, 'record'
);

select is(
  (select recorded_amount from public.meal_slots where id = '00000000-0000-4000-8000-0000000002d1'),
  8000, '기록한 끼니에 금액이 들어간다'
);

select is(
  (select row(is_recorded, is_cascade_confirmed, recorded_amount)::text
   from public.meal_slots where id = '00000000-0000-4000-8000-0000000001d1'),
  row(true, true, 0)::text, '이전 끼니(아침)는 0원으로 캐스케이드 확정된다'
);

select is(
  (select carried_over_amount from public.meal_slots where id = '00000000-0000-4000-8000-0000000003d1'),
  10000, '건너뛴 아침 예산이 다음 끼니(저녁)로 이월된다'
);

select is(
  (select count(*)::int from public.budget_change_history
   where trip_id = '00000000-0000-4000-8000-0000000000b1' and event_type = 'expense_input'),
  1, 'expense_input 히스토리가 1건 남는다'
);

-- ---------- 2. 같은 끼니 재기록 거부 ----------
select throws_ok(
  $$ select public.record_meal_log(
       '00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000002d1', 5000, 'record') $$,
  '이미 기록된 끼니입니다',
  '이미 기록된 끼니는 다시 기록할 수 없다'
);

-- ---------- 3. 삭제하면 처음 상태로 복구 ----------
select lives_ok(
  format('select public.delete_meal_log(%L)', (select id from recorded)),
  '방금 기록은 삭제할 수 있다'
);

select set_eq(
  $$ select id, budget_amount, carried_over_amount, is_recorded, is_cascade_confirmed, recorded_amount
     from public.meal_slots where trip_id = '00000000-0000-4000-8000-0000000000b1' $$,
  $$ select * from initial_slots $$,
  '기록 → 삭제 후 끼니 6개가 처음 상태와 같다'
);

select is(
  (select count(*)::int from public.meal_logs where trip_id = '00000000-0000-4000-8000-0000000000b1'),
  0, 'meal_logs가 남지 않는다'
);

-- ---------- 4. 다음 끼니가 기록돼 있으면 삭제 거부 ----------
create temp table lunch_log as
select * from public.record_meal_log(
  '00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000002d1', 8000, 'record'
);
select public.record_meal_log(
  '00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000003d1', 9000, 'record'
);

select throws_ok(
  format('select public.delete_meal_log(%L)', (select id from lunch_log)),
  '다음 끼니가 이미 기록되어 있어 삭제할 수 없습니다',
  '다음 끼니가 기록돼 있으면 삭제할 수 없다'
);

-- ---------- 5. 완료된 여행은 삭제 거부 ----------
update public.trips set status = 'completed' where id = '00000000-0000-4000-8000-0000000000b1';

select throws_ok(
  format('select public.delete_meal_log(%L)', (select id from lunch_log)),
  '완료된 여행의 기록은 삭제할 수 없습니다',
  '완료된 여행의 기록은 삭제할 수 없다'
);

select * from finish();
rollback;
