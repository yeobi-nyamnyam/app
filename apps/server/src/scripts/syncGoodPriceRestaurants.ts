import "dotenv/config";
import { createHash } from "node:crypto";

import { fetchAllGoodPriceStores, type GoodPriceStore } from "../lib/goodPriceApi";
import { searchNaverLocal } from "../lib/naverLocalSearch";
import { getSupabaseAdmin } from "../lib/supabase";

// 네이버 지역 검색 API 호출량을 억제하기 위한 요청 간 딜레이 (F3-5, docs/business-logic-notes.md §8).
const GEOCODE_DELAY_MS = 120;

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

const geocode = async (name: string, address: string) => {
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

  for (const store of stores) {
    const geo = await geocode(store.업소명, store.주소);
    if (!geo) {
      geocodeFailedCount += 1;
    }

    const { error } = await supabase.from("restaurants").upsert(
      {
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
        price_menus: toPriceMenus(store),
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: "source,external_id" },
    );

    if (error) {
      console.error(`[good-price-sync] upsert 실패: ${store.업소명} (${store.주소})`, error.message);
      continue;
    }
    syncedCount += 1;

    await sleep(GEOCODE_DELAY_MS);
  }

  console.info(
    `[good-price-sync] 완료: ${syncedCount}/${stores.length}건 upsert, 좌표 검색 실패 ${geocodeFailedCount}건`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[good-price-sync] 배치 실패", error);
    process.exit(1);
  });
