-- F3-6: 가격보기 리스트가 서버 커서 페이지네이션(first/after)으로 바뀌면서, 클라이언트가
-- 더 이상 전체 결과를 한 번에 받지 않아 "조건에 맞는 곳 N개" 총 개수를 로컬에서 셀 수
-- 없게 됐다. pg_graphql의 totalCount 확장을 켜서 restaurantsCollection.totalCount로
-- 받아온다. pg_graphql은 테이블당 @graphql 코멘트를 하나만 인식하므로(코멘트를 새로
-- 달면 이전 값을 덮어씀), 20260902000000에서 설정한 max_rows=3000과 합쳐서 다시 쓴다.
comment on table public.restaurants is '@graphql({"max_rows": 3000, "totalCount": {"enabled": true}})';
