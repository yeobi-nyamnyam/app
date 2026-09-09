import "dotenv/config";

import { batchUpsert } from "../lib/batchUpsert";
import { fetchTourApiRestaurants, type TourApiRestaurant } from "../lib/tourApi";
import { resolveTourApiCategory } from "../lib/tourApiCategory";
import { getSupabaseAdmin } from "../lib/supabase";

// F3-5: 지역 하나만 대상으로 하면 문제없지만, 전국 단위로 돌리면 업소 1건마다
// upsert를 순차 호출하던 것이 round-trip 수만큼 배치 시간을 늘렸다 — 지역별로
// 모은 업소를 이 개수 단위로 묶어 upsert 호출 수를 줄인다.
const UPSERT_CHUNK_SIZE = 300;

interface RegionCacheRow {
  region_code: string;
  region_name: string;
  tour_api_snapshot: { sigungu_code: string; sigungu_name: string }[];
}

// TOUR_API_SYNC_REGIONS: 시/도명 콤마 구분 (예: "대구광역시,서울특별시"). 비우면 전국 대상.
const targetRegionNames = (process.env.TOUR_API_SYNC_REGIONS ?? "")
  .split(",")
  .map((region) => region.trim())
  .filter(Boolean);

// TourAPI 응답의 lDongSignguCd(예: "290")는 region_cache.tour_api_snapshot의
// sigungu_code(예: "27290") 뒤 3자리와 같다 — lDongRegnCd + lDongSignguCd로
// 복원해서 구/군 이름을 찾는다.
const resolveSigunguName = (
  region: RegionCacheRow,
  item: TourApiRestaurant,
): string | null => {
  const fullSigunguCode = `${item.lDongRegnCd}${item.lDongSignguCd}`;
  return region.tour_api_snapshot.find((s) => s.sigungu_code === fullSigunguCode)?.sigungu_name ?? null;
};

const toRow = (region: RegionCacheRow, item: TourApiRestaurant) => {
  const latitude = Number(item.mapy);
  const longitude = Number(item.mapx);
  return {
    source: "tour_api",
    external_id: item.contentid,
    name: item.title,
    address: item.addr1,
    region_sido: region.region_name,
    region_sigungu: resolveSigunguName(region, item),
    category: resolveTourApiCategory(item.lclsSystm2, item.lclsSystm3),
    cls_system2: item.lclsSystm2 || null,
    cls_system3: item.lclsSystm3 || null,
    phone: item.tel || null,
    latitude: Number.isNaN(latitude) ? null : latitude,
    longitude: Number.isNaN(longitude) ? null : longitude,
    image_url: item.firstimage || null,
    last_synced_at: new Date().toISOString(),
  };
};

async function main() {
  const supabase = getSupabaseAdmin();

  const { data: regionRows, error: regionError } = await supabase
    .from("region_cache")
    .select("region_code, region_name, tour_api_snapshot");
  if (regionError || !regionRows) {
    throw new Error(`region_cache 조회 실패: ${regionError?.message}`);
  }
  const regions = regionRows as unknown as RegionCacheRow[];

  const targetRegions =
    targetRegionNames.length > 0
      ? regions.filter((region) => targetRegionNames.includes(region.region_name))
      : regions;

  console.info(
    `[tour-api-sync] 시작 (대상 지역: ${targetRegions.map((r) => r.region_name).join(", ")})`,
  );

  let syncedCount = 0;
  let totalFetched = 0;
  let upsertFailedCount = 0;

  for (const region of targetRegions) {
    const items = await fetchTourApiRestaurants(region.region_code);
    totalFetched += items.length;
    console.info(`[tour-api-sync] ${region.region_name} ${items.length}건 수집`);

    const rows = items.map((item) => toRow(region, item));
    syncedCount += await batchUpsert({
      supabase,
      table: "restaurants",
      onConflict: "source,external_id",
      rows,
      chunkSize: UPSERT_CHUNK_SIZE,
      onItemError: (row, message) => {
        console.error(`[tour-api-sync] upsert 실패: ${row.name} (${row.external_id})`, message);
        upsertFailedCount += 1;
      },
    });
  }

  console.info(
    `[tour-api-sync] 완료: ${syncedCount}/${totalFetched}건 upsert, upsert 실패 ${upsertFailedCount}건`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[tour-api-sync] 배치 실패", error);
    process.exit(1);
  });
