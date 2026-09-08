-- F3-6: 가격보기 리스트를 서버 측 정렬/필터/커서 페이지네이션으로 전환하기 위해
-- price_menus(jsonb)에서 뽑은 대표 메뉴 최저가를 실제 컬럼으로 둔다. pg_graphql은
-- jsonb 내부 값 기준 orderBy/filter를 지원하지 않아(F3-4에서 확인한 제약) min_price를
-- 별도 numeric 컬럼으로 둬야 서버 측 orderBy(min_price)/filter(min_price: {lte})가
-- 가능해진다. 값은 apps/server/src/scripts/syncGoodPriceRestaurants.ts 배치가 upsert
-- 시점에 계산해 채우고, 이 마이그레이션은 컬럼 추가 + 기존 행 백필만 담당한다.
alter table public.restaurants
  add column min_price numeric;

-- 기존 행 백필: price_menus 배열([{"name": string, "price": number}, ...])에서
-- 최저가 추출. tour_api(source=tour_api)는 price_menus가 없어 null로 남는다
-- (가격보기는 good_price만 대상이라 문제 없음).
update public.restaurants
set min_price = (
  select min((elem->>'price')::numeric)
  from jsonb_array_elements(price_menus) as elem
)
where price_menus is not null and jsonb_array_length(price_menus) > 0;

-- 가격보기 조회 패턴(지역+source 필터 → 가격 상한 필터 → 가격순 정렬)에 맞춘 복합 인덱스
create index idx_restaurants_region_source_min_price
  on public.restaurants (region_sido, source, min_price);
