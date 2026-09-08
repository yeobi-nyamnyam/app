import "dotenv/config";
import { createHash } from "node:crypto";

import { batchUpsert } from "../lib/batchUpsert";
import { fetchAllGoodPriceStores, type GoodPriceStore } from "../lib/goodPriceApi";
import { searchNaverLocal } from "../lib/naverLocalSearch";
import { getSupabaseAdmin } from "../lib/supabase";

// 네이버 지역 검색 API 호출량을 억제하기 위한 요청 간 딜레이 (F3-5, docs/business-logic-notes.md §8).
const GEOCODE_DELAY_MS = 120;

// F3-5: 지오코딩(요청 간 GEOCODE_DELAY_MS 딜레이 필수)과 별개로, DB upsert는 이
// 개수만큼 모았다가 한 번에 보낸다 — 전국 단위 실행 시 upsert round-trip 수를
// 크게 줄인다. 너무 크면 중간에 스크립트가 죽었을 때 유실되는 미저장분이
// 커지므로, 지오코딩 한 바퀴(약 몇십 초) 분량 정도로만 모은다.
const UPSERT_CHUNK_SIZE = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// good_price는 자체 고유 ID가 없어 name+address 정규화 후 해시로 생성한다 (docs/schema-design.md §12).
const toExternalId = (name: string, address: string) =>
  createHash("sha256").update(`${name.trim()}|${address.trim()}`).digest("hex");

const toPriceMenus = (store: GoodPriceStore) =>
  [
    { name: store.메뉴1, price: store.가격1 },
    { name: store.메뉴2, price: store.가격2 },
    { name: store.메뉴3, price: store.가격3 },
    { name: store.메뉴4, price: store.가격4 },
  ]
    .filter(
      (menu): menu is { name: string; price: string } => menu.name != null && menu.price != null,
    )
    .map((menu) => ({ name: menu.name, price: Number(menu.price) }));

// F3-6: price_menus(jsonb) 안의 최저가는 pg_graphql이 서버 측 orderBy/filter 대상으로
// 못 써서(apps/mobile/src/graphql/recommend/good-price-restaurants.query.graphql 주석
// 참고), restaurants.min_price 실컬럼에 미리 계산해 채운다.
const toMinPrice = (menus: ReturnType<typeof toPriceMenus>) =>
  menus.length > 0 ? Math.min(...menus.map((menu) => menu.price)) : null;

interface GeocodeResult {
  latitude: number;
  longitude: number;
}

const toRow = (store: GoodPriceStore, geo: GeocodeResult | null) => {
  const priceMenus = toPriceMenus(store);
  return {
    source: "good_price",
    external_id: toExternalId(store.업소명, store.주소),
    name: store.업소명,
    address: store.주소,
    region_sido: store.시도,
    region_sigungu: store.시군,
    category: store.업종,
    phone: store.연락처,
    latitude: geo?.latitude ?? null,
    longitude: geo?.longitude ?? null,
    price_menus: priceMenus,
    min_price: toMinPrice(priceMenus),
    last_synced_at: new Date().toISOString(),
  };
};

const geocode = async (name: string, address: string): Promise<GeocodeResult | null> => {
  try {
    const results = await searchNaverLocal(`${name} ${address}`, 1);
    return results[0] ?? null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[good-price-sync] 좌표 검색 실패: ${name} (${address}) - ${message}`);
    return null;
  }
};

// GOOD_PRICE_SYNC_REGIONS: 시/도명 콤마 구분 (예: "대구광역시,서울특별시"). 비우면 전국 대상.
const targetRegions = (process.env.GOOD_PRICE_SYNC_REGIONS ?? "")
  .split(",")
  .map((region) => region.trim())
  .filter(Boolean);

async function main() {
  console.info(
    `[good-price-sync] 시작 (대상 지역: ${targetRegions.length > 0 ? targetRegions.join(", ") : "전국"})`,
  );

  const stores = await fetchAllGoodPriceStores(targetRegions);
  console.info(`[good-price-sync] 착한가격업소 API에서 ${stores.length}건 수집`);

  const supabase = getSupabaseAdmin();
  let syncedCount = 0;
  let geocodeFailedCount = 0;
  let upsertFailedCount = 0;

  const flush = async (buffer: ReturnType<typeof toRow>[]) => {
    if (buffer.length === 0) return;
    syncedCount += await batchUpsert({
      supabase,
      table: "restaurants",
      onConflict: "source,external_id",
      rows: buffer,
      chunkSize: UPSERT_CHUNK_SIZE,
      onItemError: (row, message) => {
        console.error(`[good-price-sync] upsert 실패: ${row.name} (${row.address})`, message);
        upsertFailedCount += 1;
      },
    });
  };

  let buffer: ReturnType<typeof toRow>[] = [];
  for (const store of stores) {
    const geo = await geocode(store.업소명, store.주소);
    if (!geo) {
      geocodeFailedCount += 1;
    }

    buffer.push(toRow(store, geo));
    if (buffer.length >= UPSERT_CHUNK_SIZE) {
      await flush(buffer);
      buffer = [];
    }

    await sleep(GEOCODE_DELAY_MS);
  }
  await flush(buffer);

  console.info(
    `[good-price-sync] 완료: ${syncedCount}/${stores.length}건 upsert, 좌표 검색 실패 ${geocodeFailedCount}건, upsert 실패 ${upsertFailedCount}건`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[good-price-sync] 배치 실패", error);
    process.exit(1);
  });
