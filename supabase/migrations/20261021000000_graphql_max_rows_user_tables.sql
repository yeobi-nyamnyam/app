-- pg_graphql은 컬렉션마다 기본 max_rows(30)를 넘는 행을 돌려주지 않는다. 쿼리에
-- first: 1000을 줘도 max_rows로 잘린다 (restaurants에서 이미 겪은 문제 —
-- 20260902000000_restaurants_graphql_max_rows.sql). 사용자 기록이 쌓이는 테이블에도
-- 같은 상한을 올려서, 30건을 넘는 순간 목록/합계가 조용히 잘리는 문제를 막는다:
--   - meal_logs: 기록 목록(trip-meal-logs)이 최신 30건만 보임
--   - budget_change_history: 오래된 순 정렬이라 최신 변동이 잘림
--   - meal_slots: 11일 이상 여행(33슬롯~)의 마지막 날짜들이 빠짐
--   - exp_ledger / user_badges: 누적 포인트·배지 수가 30행에서 멈춤
--   - trips / diaries: 여행·일기가 30개를 넘으면 잘림
-- 테이블에 이미 다른 @graphql 코멘트는 없다 (restaurants만 있음).
comment on table public.meal_logs is '@graphql({"max_rows": 1000})';
comment on table public.meal_slots is '@graphql({"max_rows": 1000})';
comment on table public.budget_change_history is '@graphql({"max_rows": 1000})';
comment on table public.exp_ledger is '@graphql({"max_rows": 1000})';
comment on table public.user_badges is '@graphql({"max_rows": 1000})';
comment on table public.trips is '@graphql({"max_rows": 1000})';
comment on table public.diaries is '@graphql({"max_rows": 1000})';
