-- good_price_shops 제거 — restaurants 테이블로 통일 (docs/schema-design.md 세션1 결정 반영)
-- 착한가격업소+TourAPI 캐싱은 restaurants 하나로 확정, good_price_shops는 중복 테이블이라 폐기

drop table if exists public.good_price_shops;
