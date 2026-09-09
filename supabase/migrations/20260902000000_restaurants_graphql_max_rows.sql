-- F3-1: 지도보기는 여행 지역의 착한가격업소를 예산과 무관하게 전부 마커로
-- 표시해야 하는데, pg_graphql의 기본 max_rows(30)에 걸려 일부만 조회됐다.
-- restaurants 테이블만 대상으로 상한을 올린다 (다른 테이블의 페이지네이션
-- 기본값에는 영향 없음). 3000은 현재 가장 큰 지역(서울, 착한가격업소 약
-- 2,000여 건)에 여유를 둔 값 — apps/server/src/scripts/syncGoodPriceRestaurants.ts
-- 배치로 전국 데이터가 계속 늘어날 수 있어 넉넉히 잡았다.
comment on table public.restaurants is '@graphql({"max_rows": 3000})';
